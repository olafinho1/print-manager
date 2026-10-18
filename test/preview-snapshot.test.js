import assert from "node:assert/strict";
import test from "node:test";
import { readFile, writeFile, access, readdir } from "node:fs/promises";
import { TestD1 } from "./helpers/d1.js";
import { readState } from "../functions/api/_lib/store.js";
import { onRequest } from "../functions/api/state.js";
import { previewIdentity, assertPreviewDatabase, previewVars } from "../scripts/preview.mjs";
import { snapshotStatus, cloneProductionDatabase, verifySnapshotState } from "../scripts/preview-snapshot.mjs";

const sourceId = "ebe1b46e-e722-44ea-ab21-5e309be0c7c0";
const identity = previewIdentity("olafinho1/print-manager", 12);
const database = { name: identity.name, uuid: "11111111-2222-3333-4444-555555555555" };
const protectedIds = [sourceId];
const timestamp = "2026-10-18T20:00:00.000Z";
const sql = `CREATE TABLE original (id INTEGER PRIMARY KEY, value TEXT);
INSERT INTO original VALUES (1, 'private fixture');`;
const options = { sourceId, database, identity, protectedIds, compatibilityDate: "2026-05-04",
  targetConfig: "/preview/wrangler.json", assertPreviewDatabase, now: () => timestamp };

function apiFor(db) {
  return async (path, { body }) => {
    assert.equal(path, `/d1/database/${database.uuid}/query`);
    return [await db.prepare(body.sql).bind(...(body.params || [])).all()];
  };
}

function wranglerFixture(db, sourceSql = sql, fail = "") {
  const calls = [];
  let dump;
  return { calls, dump: () => dump, run: async (args, settings) => {
    calls.push(args.slice(0, 2).join(" "));
    assert.equal(settings.quiet, true);
    if (args[1] === "export") {
      const config = JSON.parse(await readFile(args[args.indexOf("--config") + 1], "utf8"));
      assert.equal(config.d1_databases[0].database_id, sourceId);
      dump = args[args.indexOf("--output") + 1];
      await writeFile(dump, sourceSql);
      if (fail === "export") throw new Error("export failed");
    } else {
      assert.equal(args[2], identity.name);
      assert.equal(args[args.indexOf("--config") + 1], options.targetConfig);
      if (fail === "import") throw new Error("import failed");
      db.sqlite.exec(await readFile(args[args.indexOf("--file") + 1], "utf8"));
    }
  } };
}

test("clone copies schema and data before migrations, marks completion, and removes its private dump", async (t) => {
  const db = new TestD1(); t.after(() => db.close());
  const fixture = wranglerFixture(db);
  assert.deepEqual(await snapshotStatus(apiFor(db), database.uuid, sourceId), { snapshot: null, dirty: false });
  await cloneProductionDatabase({ ...options, runWrangler: fixture.run });
  assert.deepEqual(fixture.calls, ["d1 export", "d1 execute"]);
  assert.equal(db.sqlite.prepare("SELECT value FROM original").get().value, "private fixture");
  assert.deepEqual({ ...(await snapshotStatus(apiFor(db), database.uuid, sourceId)).snapshot },
    { source_database_id: sourceId, copied_at: timestamp });
  await assert.rejects(access(fixture.dump()), { code: "ENOENT" });
  // Updating a preview checks this marker and must not run another export/import.
  db.sqlite.exec("UPDATE original SET value = 'operator test'");
  assert((await snapshotStatus(apiFor(db), database.uuid, sourceId)).snapshot);
  assert.equal(db.sqlite.prepare("SELECT value FROM original").get().value, "operator test");
});

test("export/import failures leave no completion marker or temporary dump", async (t) => {
  for (const failure of ["export", "import"]) {
    const db = new TestD1(); t.after(() => db.close());
    const fixture = wranglerFixture(db, sql, failure);
    await assert.rejects(cloneProductionDatabase({ ...options, runWrangler: fixture.run }), /failed/);
    await assert.rejects(access(fixture.dump()), { code: "ENOENT" });
    assert.equal((await snapshotStatus(apiFor(db), database.uuid, sourceId)).snapshot, null);
  }
});

test("legacy sample data and incomplete imports need a fresh D1; another source is rejected", async (t) => {
  const db = new TestD1(); t.after(() => db.close());
  db.sqlite.exec("CREATE TABLE preview_seed (id INTEGER PRIMARY KEY); INSERT INTO preview_seed VALUES (1)");
  assert.equal((await snapshotStatus(apiFor(db), database.uuid, sourceId)).dirty, true);
  db.sqlite.exec(sql);
  assert.equal((await snapshotStatus(apiFor(db), database.uuid, sourceId)).dirty, true);
  const fixture = wranglerFixture(db);
  // Guard fires before any Wrangler action or filesystem work.
  await assert.rejects(cloneProductionDatabase({ ...options, database: { ...database, uuid: sourceId }, runWrangler: fixture.run }), /outside/);
  await assert.rejects(cloneProductionDatabase({ ...options, sourceId: database.uuid, runWrangler: fixture.run }), /configured production/);
  assert.equal(fixture.calls.length, 0);
  db.sqlite.exec(`CREATE TABLE preview_production_snapshot (id INTEGER, source_database_id TEXT, copied_at TEXT);
    INSERT INTO preview_production_snapshot VALUES (1, 'wrong-source', '${timestamp}')`);
  await assert.rejects(snapshotStatus(apiFor(db), database.uuid, sourceId), /different production/);
});

test("a legacy production snapshot retains full history, stock, and in-progress work through feature migrations", async (t) => {
  const db = new TestD1(); t.after(() => db.close());
  const migrations = (await readdir(new URL("../migrations/", import.meta.url))).filter((name) => name.endsWith(".sql")).sort();
  const oldSchema = (await Promise.all(migrations.slice(0, 3).map((name) => readFile(new URL(`../migrations/${name}`, import.meta.url), "utf8")))).join("\n");
  const rows = Array.from({ length: 501 }, (_, i) => `INSERT INTO part_inventory_movements
    (id, part_id, delta_qty, reason, actor, created_at) VALUES ('history-${i}', 'legacy', 1, 'adjustment', 'Fixture operator', '${timestamp}');`).join("\n");
  const productionSql = `${oldSchema}\nINSERT INTO parts (id, name, color, material, inventory_qty) VALUES ('legacy', 'Legacy part', 'Blue', 'PLA', 10);
    INSERT INTO print_state (part_id, planned_qty, in_progress_qty) VALUES ('legacy', 3, 2);
    INSERT INTO products (id, name, requires_assembly) VALUES ('direct', 'Direct product', 0), ('assembly', 'Assembly product', 1);
    INSERT INTO product_requirements (product_id, part_id, quantity) VALUES ('direct', 'legacy', 1), ('assembly', 'legacy', 2);
    ${rows}`;
  const fixture = wranglerFixture(db, productionSql);
  const snapshot = await cloneProductionDatabase({ ...options, runWrangler: fixture.run });
  // A real clone retains the production migration table if there is one; these
  // legacy migrations are repeatable for older installations without that table.
  for (const name of migrations) db.sqlite.exec(await readFile(new URL(`../migrations/${name}`, import.meta.url), "utf8"));
  await verifySnapshotState(apiFor(db), database, identity, protectedIds, assertPreviewDatabase, previewVars(identity, snapshot));
  const state = await readState(db);
  assert.equal(state.parts[0].inventoryQty, 10);
  assert.equal(state.parts[0].filamentId, null);
  assert.equal(state.printState[0].inProgressQty, 2);
  assert.equal(state.filaments.length, 0);
  assert.equal(db.sqlite.prepare("SELECT count(*) AS n FROM part_inventory_movements").get().n, 501);
  assert.equal(state.partInventoryMovements.length, 400);
  assert.equal(state.products.find((product) => product.id === "direct").requiresAssembly, false);
  const response = await onRequest({ request: new Request("https://preview.pages.dev/api/state"),
    env: { DB: db, ...previewVars(identity, snapshot) } });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.meta.app.previewSnapshotAt, timestamp);
  assert(body.meta.auth);
});

test("an empty production snapshot remains empty when /api/state is opened", async (t) => {
  const db = new TestD1(); t.after(() => db.close());
  const response = await onRequest({ request: new Request("https://preview.pages.dev/api/state"),
    env: { DB: db, ...previewVars(identity, { copied_at: timestamp }) } });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body.parts, []);
  assert.deepEqual(body.filaments, []);
  assert.equal(body.meta.app.previewDataSource, "production snapshot");
});
