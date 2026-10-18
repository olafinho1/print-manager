import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { TestD1 } from "./helpers/d1.js";
import {
  ensureSchema, readState, replaceState, applyQueueAction, saveFilament, adjustFilamentInventory,
  deleteFilament, savePart, savePrinter, SEED_STATE, seedStateIfEmpty, withMutationState,
} from "../functions/api/_lib/store.js";
import { gramsToMilligrams, printerMatchesFilament, futureFilamentDemand, consumptionQuantity } from "../filament-model.js";

async function fixture(t, overrides = {}) {
  const db = new TestD1();
  t.after(() => db.close());
  await ensureSchema(db);
  await replaceState(db, {
    filaments: [{ id: "f", manufacturer: "Maker", material: "PLA", color: "Blue", spoolWeightGrams: 1000, stockGrams: 1000 }],
    parts: ["p", "p2"].map((id) => ({ id, name: id, color: "Blue", material: "PLA", filamentId: "f", filamentGramsPerUnit: 12.34 })),
    products: ["p", "p2"].map((id) => ({ id: `product-${id}`, name: id, requiresAssembly: false, partRequirements: [{ partId: id, quantity: 1 }] })),
    salesOrders: [{ id: "order", orderNumber: "1", orderDate: "2026-10-18", status: "open", items: ["p", "p2"].map((id) => ({ productId: `product-${id}`, quantity: 100 })) }],
    ...overrides,
  });
  return db;
}

async function queuePayload(db, action, quantity, partId = "p") {
  const state = await readState(db);
  const part = state.parts.find((part) => part.id === partId);
  return { partId, action, quantity, actor: "Operator", requestId: crypto.randomUUID(), expectedQueueVersion: part.queueVersion, expectedFilamentId: part.filamentId, expectedFilamentGramsPerUnit: part.filamentGramsPerUnit };
}
async function queue(db, action, quantity, partId) { return applyQueueAction(db, await queuePayload(db, action, quantity, partId)); }
async function stock(db) { return (await readState(db)).filaments[0].stockGrams; }
const inventory = (db, payload) => adjustFilamentInventory(db, { filamentId: "f", requestId: crypto.randomUUID(), actor: "Operator", ...payload });

test("gram inputs reject missing, non-finite, excessive precision and unsafe weights", () => {
  for (const invalid of [null, undefined, "", "1.001", NaN, Infinity, "1e3", "9007199254740991"]) assert.equal(gramsToMilligrams(invalid), null);
  assert.equal(gramsToMilligrams("12.34"), 12340);
  assert.equal(gramsToMilligrams(-0.01), -10);
  assert.equal(gramsToMilligrams(".5"), 500);
  assert.equal(gramsToMilligrams("-.25"), -250);
});

test("receipts, counted stock and signed adjustments retain precision and attribution", async (t) => {
  const db = await fixture(t);
  await inventory(db, { action: "receive", rolls: 3 });
  assert.equal(await stock(db), 4000);
  const current = (await readState(db)).filaments[0];
  await inventory(db, { action: "set", rolls: 1, additionalGrams: 123.45, note: "Counted", expectedStockVersion: current.stockVersion });
  await inventory(db, { action: "adjust", deltaGrams: -0.01, note: "Waste" });
  assert.equal(await stock(db), 1123.44);
  const movements = (await readState(db)).filamentInventoryMovements;
  assert.equal(movements.length, 3);
  assert(movements.every((entry) => entry.actor === "Operator" && Number.isFinite(Date.parse(entry.createdAt))));
  await assert.rejects(inventory(db, { action: "receive", rolls: 1.5 }), /whole/);
  await assert.rejects(inventory(db, { action: "adjust", deltaGrams: 10 }), /reason/);
  await assert.rejects(inventory(db, { action: "set", rolls: 0, additionalGrams: -1, note: "Count", expectedStockVersion: (await readState(db)).filaments[0].stockVersion }), /non-negative/);
});

test("only completed quantity consumes filament, including partial and mixed direct completions", async (t) => {
  const db = await fixture(t);
  await queue(db, "plan", 5);
  assert.equal(await stock(db), 1000);
  await queue(db, "start", 3);
  assert.equal(await stock(db), 1000);
  assert.equal((await readState(db)).filamentInventoryMovements.length, 0);
  await queue(db, "complete", 1);
  assert.equal(await stock(db), 987.66);
  await queue(db, "complete", 4);
  const state = await readState(db);
  assert.equal(state.filaments[0].stockGrams, 938.3);
  assert.equal(state.parts[0].inventoryQty, 5);
  assert.equal(state.filamentInventoryMovements.length, 2);
  for (const movement of state.filamentInventoryMovements) {
    assert.equal(movement.gramsPerUnit, 12.34);
    assert.equal(movement.reason, "print_completed");
    assert.equal(movement.actor, "Operator");
    assert(Number.isFinite(Date.parse(movement.createdAt)));
    assert(state.printEvents.some((event) => event.id === movement.printEventId));
  }
  assert.equal(state.partInventoryMovements.length, 2);
});

test("start, fail and retry do not consume; completion can make stock negative", async (t) => {
  const db = await fixture(t);
  await queue(db, "start", 100);
  await queue(db, "fail", 10);
  await queue(db, "retry", 10);
  await queue(db, "start", 10);
  assert.equal(await stock(db), 1000);
  assert.equal((await readState(db)).filamentInventoryMovements.length, 0);
  await queue(db, "complete", 100);
  assert.equal(await stock(db), -234);
});

test("completion snapshots the current part settings without altering earlier usage", async (t) => {
  const db = await fixture(t);
  await queue(db, "start", 3);
  await queue(db, "complete", 1);
  assert.equal(await stock(db), 987.66);
  const state = await readState(db);
  await savePart(db, { ...state.parts[0], filamentGramsPerUnit: 50 });
  await queue(db, "complete", 2);
  assert.equal(await stock(db), 887.66);
  const moves = (await readState(db)).filamentInventoryMovements;
  assert(moves.some((entry) => entry.gramsPerUnit === 12.34 && entry.quantity === 1));
  assert(moves.some((entry) => entry.gramsPerUnit === 50 && entry.quantity === 2));
});

test("unconfigured legacy parts must be configured to complete but can still fail", async (t) => {
  const db = await fixture(t, { parts: [{ id: "p", name: "Legacy", color: "Blue", material: "PLA" }, { id: "p2", name: "Other", color: "Blue", material: "PLA" }], printState: [{ partId: "p", inProgressQty: 3 }] });
  await assert.rejects(queue(db, "start", 1), /Configure/);
  await assert.rejects(queue(db, "complete", 2), /Configure/);
  await queue(db, "fail", 1);
  assert.equal(await stock(db), 1000);
  await savePart(db, { ...(await readState(db)).parts[0], filamentId: "f", filamentGramsPerUnit: 12.34 });
  await queue(db, "complete", 2);
  assert.equal(await stock(db), 975.32);
  assert.equal((await readState(db)).parts[0].inventoryQty, 2);
});

test("request replay does not charge again and reuse for a different command is rejected", async (t) => {
  const db = await fixture(t);
  const command = await queuePayload(db, "complete", 2);
  await applyQueueAction(db, command);
  await applyQueueAction(db, command);
  assert.equal(await stock(db), 975.32);
  await assert.rejects(applyQueueAction(db, { ...command, quantity: 3 }), /different action/);
  const receipt = { action: "receive", rolls: 1, requestId: crypto.randomUUID() };
  await inventory(db, receipt);
  await inventory(db, receipt);
  assert.equal(await stock(db), 1975.32);
});

test("replaying Start does not duplicate progress or create filament movements", async (t) => {
  const db = await fixture(t);
  const command = await queuePayload(db, "start", 2);
  await applyQueueAction(db, command);
  await applyQueueAction(db, command);
  const state = await readState(db);
  assert.equal(state.printState[0].inProgressQty, 2);
  assert.equal(state.filaments[0].stockGrams, 1000);
  assert.equal(state.filamentInventoryMovements.length, 0);
});

test("upgrade and restore preserve earlier Start charges without double charging or restoring spent credits", async (t) => {
  const db = await fixture(t);
  db.sqlite.exec("DROP TABLE filament_prepaid_prints");
  const events = [["direct", "complete", 10], ["old-start", "start", 5], ["done", "complete", 2], ["failed", "fail", 1], ["retry", "retry", 1], ["old-restart", "start", 1]];
  const insert = db.sqlite.prepare("INSERT INTO print_events (id, part_id, action, quantity, created_at) VALUES (?, 'p', ?, ?, '2026-10-18T00:00:00.000Z')");
  for (const [id, action, quantity] of events) insert.run(id, action, quantity);
  const movement = db.sqlite.prepare("INSERT INTO filament_inventory_movements (id, filament_id, delta_mg, reason, created_at, part_id, print_event_id, quantity, grams_per_unit_mg) VALUES (?, 'f', ?, 'print_started', '2026-10-18T00:00:00.000Z', 'p', ?, ?, 12340)");
  movement.run("old-move", -61700, "old-start", 5);
  movement.run("restart-move", -12340, "old-restart", 1);
  db.sqlite.exec("UPDATE filaments SET stock_mg = 925960 WHERE id = 'f'");
  db.sqlite.exec("INSERT INTO print_state (part_id, in_progress_qty) VALUES ('p', 3)");
  // Exercise the actual SQL migration and repeat runtime initialization afterward.
  db.sqlite.exec(readFileSync(new URL("../migrations/0005_completion_filament.sql", import.meta.url), "utf8"));
  await ensureSchema(db); await ensureSchema(db);
  let state = await readState(db);
  assert.equal(state.printState[0].prepaidFilamentQty, 3);
  assert.equal(await stock(db), 925.96);
  await replaceState(db, state);
  await ensureSchema(db);
  assert.equal((await readState(db)).printState[0].prepaidFilamentQty, 3);
  await savePart(db, { ...state.parts[0], filamentGramsPerUnit: 20 });
  await queue(db, "complete", 1);
  await queue(db, "fail", 1);
  assert.equal(await stock(db), 925.96);
  await ensureSchema(db);
  assert.equal((await readState(db)).printState[0].prepaidFilamentQty, 1);
  await queue(db, "start", 2);
  // One prepaid in-progress unit, two new in-progress units, one direct unit.
  await queue(db, "complete", 4);
  assert.equal(await stock(db), 865.96);
  await ensureSchema(db);
  state = await readState(db);
  assert.equal(state.printState[0].prepaidFilamentQty, 0);
  assert(state.filamentInventoryMovements.some((entry) => entry.reason === "print_completed" && entry.quantity === 3 && entry.gramsPerUnit === 20));
  await replaceState(db, state);
  await ensureSchema(db);
  assert.equal((await readState(db)).printState[0].prepaidFilamentQty, 0);
});

test("overlapping queue commands conflict atomically and versions survive empty queue state", async (t) => {
  const db = await fixture(t);
  const first = await queuePayload(db, "complete", 2);
  const second = await queuePayload(db, "complete", 3);
  db.beforeMutationBatch = () => applyQueueAction(db, second);
  await assert.rejects(applyQueueAction(db, first), /Refresh and retry/);
  assert.equal(await stock(db), 962.98);
  assert.equal((await readState(db)).parts[0].inventoryQty, 3);
  assert.equal((await readState(db)).printState.length, 0);
  await assert.rejects(applyQueueAction(db, first), /queue changed/);
});

test("different parts can concurrently consume the same filament without lost updates", async (t) => {
  const db = await fixture(t);
  db.beforeMutationBatch = () => queue(db, "complete", 3, "p2");
  await queue(db, "complete", 2);
  assert.equal(await stock(db), 938.3);
  assert.equal((await readState(db)).filamentInventoryMovements.length, 2);
});

test("stock counts conflict with concurrent consumption instead of overwriting it", async (t) => {
  const db = await fixture(t);
  db.beforeMutationBatch = () => queue(db, "complete", 1);
  await assert.rejects(inventory(db, { action: "set", rolls: 1, note: "Count", expectedStockVersion: 0 }), /Refresh and retry/);
  assert.equal(await stock(db), 987.66);
});

test("changed filament settings reject both stale-client and overlapping consumption", async (t) => {
  const db = await fixture(t);
  const stale = await queuePayload(db, "complete", 1);
  let part = (await readState(db)).parts[0];
  await savePart(db, { ...part, filamentGramsPerUnit: 20 });
  await assert.rejects(applyQueueAction(db, stale), /settings changed/);
  const overlapping = await queuePayload(db, "complete", 1);
  part = (await readState(db)).parts[0];
  db.beforeMutationBatch = () => savePart(db, { ...part, filamentGramsPerUnit: 30 });
  await assert.rejects(applyQueueAction(db, overlapping), /Refresh and retry/);
  assert.equal(await stock(db), 1000);
});

test("ledger failure rolls back queue, stock, events and receipt; the request can retry", async (t) => {
  const db = await fixture(t);
  const command = await queuePayload(db, "complete", 2);
  await db.exec("CREATE TRIGGER fail_ledger BEFORE INSERT ON filament_inventory_movements BEGIN SELECT RAISE(ABORT, 'test failure'); END");
  await assert.rejects(applyQueueAction(db, command), /test failure/);
  const state = await readState(db);
  assert.equal(state.filaments[0].stockGrams, 1000);
  assert.equal(state.parts[0].inventoryQty, 0);
  assert.equal(state.printEvents.length, 0);
  assert.equal(state.parts[0].queueVersion, 0);
  await db.exec("DROP TRIGGER fail_ledger");
  await applyQueueAction(db, command);
  assert.equal(await stock(db), 975.32);
});

test("catalog edits preserve balance; assignments derive labels; referenced deletion is blocked", async (t) => {
  const db = await fixture(t);
  await saveFilament(db, { filament: { ...(await readState(db)).filaments[0], color: "Navy", spoolWeightGrams: 500, stockGrams: 99999 }, requestId: crypto.randomUUID() });
  assert.equal(await stock(db), 1000);
  assert.equal((await readState(db)).parts[0].color, "Navy");
  await savePrinter(db, { id: "printer", name: "Printer", filamentId: "f" });
  assert.equal((await readState(db)).printers[0].color, "Navy");
  await assert.rejects(deleteFilament(db, "f"), /referenced/);
  await savePrinter(db, { id: "printer", name: "Printer", filamentId: null });
  assert.equal((await readState(db)).printers[0].filamentId, null);
  await saveFilament(db, { filament: { id: "empty", manufacturer: "M", material: "PETG", color: "Red", spoolWeightGrams: 1000 }, requestId: crypto.randomUUID() });
  await deleteFilament(db, "empty");
});

test("opening roll stock is deduplicated and filament-only databases are never reseeded", async (t) => {
  const db = await fixture(t);
  await replaceState(db, {});
  const command = { filament: { manufacturer: "M", material: "PLA", color: "Green", spoolWeightGrams: 750 }, initialRolls: 2, additionalGrams: 10.25, actor: "Operator", requestId: crypto.randomUUID() };
  await saveFilament(db, command);
  await saveFilament(db, command);
  const state = await seedStateIfEmpty(db);
  assert.equal(state.filaments.length, 1);
  assert.equal(state.filaments[0].stockGrams, 1510.25);
  assert.equal(state.parts.length, 0);
});

test("fresh SQL migration and runtime upgrades are repeatable and sample restore round-trips", async (t) => {
  const db = new TestD1(); t.after(() => db.close());
  for (const file of ["0001_initial", "0002_inventory_ledger", "0003_sales_orders", "0004_filaments", "0004_filaments", "0005_completion_filament", "0005_completion_filament"]) {
    db.sqlite.exec(readFileSync(new URL(`../migrations/${file}.sql`, import.meta.url), "utf8"));
  }
  await ensureSchema(db); await ensureSchema(db);
  await replaceState(db, SEED_STATE);
  const before = await readState(db);
  await replaceState(db, before);
  const after = await readState(db);
  // Optimistic concurrency tokens are regenerated by a full-state replacement.
  for (const snapshot of [before, after]) snapshot.filaments.forEach((filament) => { delete filament.stockVersion; });
  assert.deepEqual(after, before);
  const response = await withMutationState({ env: { DB: db }, request: new Request("http://localhost/api/test") }, async () => {});
  const payload = await response.json();
  assert(payload.ok && payload.state.meta.auth && payload.state.meta.app);
});

test("printer matching is exact and future demand includes unpaid in-progress quantities", () => {
  assert(printerMatchesFilament({ filamentId: "f" }, { filamentId: "f" }));
  assert(!printerMatchesFilament({ filamentId: "other" }, { filamentId: "f" }));
  assert(!printerMatchesFilament({}, {}));
  const part = { filamentId: "f", filamentGramsPerUnit: 0.1 };
  assert.equal(futureFilamentDemand([
    { part, plannedQty: 1, remainingQty: 2, inProgressQty: 100, prepaidFilamentQty: 10 },
    { part, plannedQty: 2, remainingQty: 1, inProgressQty: 50 },
  ]).get("f"), 14.6);
  assert.equal(consumptionQuantity("start", 10), 0);
  assert.equal(consumptionQuantity("complete", 10), 10);
  assert.equal(consumptionQuantity("complete", 10, 3), 7);
});

test("runtime upgrade preserves existing stock, labels and in-progress quantities without guessing filament", async (t) => {
  const db = new TestD1(); t.after(() => db.close());
  db.sqlite.exec(readFileSync(new URL("../migrations/0001_initial.sql", import.meta.url), "utf8"));
  db.sqlite.exec("INSERT INTO parts (id, name, color, material, inventory_qty) VALUES ('legacy', 'Legacy', 'Ivory', 'PETG', 17)");
  db.sqlite.exec("INSERT INTO printers (id, name, color, material) VALUES ('printer', 'Printer', 'Ivory', 'PETG')");
  db.sqlite.exec("INSERT INTO print_state (part_id, in_progress_qty) VALUES ('legacy', 3)");
  await ensureSchema(db);
  const state = await readState(db);
  assert.equal(state.filaments.length, 0);
  assert.equal(state.parts[0].filamentId, null);
  assert.equal(state.parts[0].filamentGramsPerUnit, null);
  assert.equal(state.parts[0].inventoryQty, 17);
  assert.equal(state.parts[0].color, "Ivory");
  assert.equal(state.printers[0].filamentId, null);
  assert.equal(state.printers[0].material, "PETG");
  assert.equal(state.printState[0].inProgressQty, 3);
});

test("restore retains print events referenced by filament history beyond the recent-event window", async (t) => {
  const db = await fixture(t);
  await queue(db, "complete", 1);
  const event = (await readState(db)).filamentInventoryMovements[0].printEventId;
  const insert = db.sqlite.prepare("INSERT INTO print_events (id, part_id, action, quantity, created_at) VALUES (?, 'p', 'plan', 1, '2099-01-01T00:00:00.000Z')");
  for (let index = 0; index < 410; index++) insert.run(`later-${index}`);
  const snapshot = await readState(db);
  assert(snapshot.printEvents.some((entry) => entry.id === event));
  await replaceState(db, snapshot);
  assert.equal(await stock(db), 987.66);
  assert.equal((await readState(db)).filamentInventoryMovements[0].printEventId, event);
});
