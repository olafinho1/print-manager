import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { buildDemandModel } from "../demand-model.js";
import * as filamentModel from "../filament-model.js";

// Exercise the app's real view-model and markup functions without starting a
// browser or changing the production bundle's public interface.
function appFixture(options = {}) {
  const source = readFileSync(new URL("../app.js", import.meta.url), "utf8")
    .replace(/^import .*;$/gm, "")
    .replace("  init();", "")
    .replace("  function render() {", options.skipRender ? "  function render() { return;" : "  function render() {")
    .replace(/\}\)\(\);\s*$/, "return { ui, state, dom, adjustPartStock, renderPartForm, readPartForm, normalizePart, partFilamentMarkup, renderPartDetail, applyRemoteMeta, renderHeader, renderFilamentOrdering, renderQueueActionPreview, queueActionLimit, normalizeRemoteState, replaceStateInMemory, computeState, renderQueueCard, buildFilamentActivityEntries, filterActivityEntries }; })();");
  const app = runInNewContext(source, {
    buildDemandModel, ...filamentModel, crypto,
    window: { location: { hostname: "localhost" }, sessionStorage: { getItem: () => null }, ...options.window },
    document: { body: { setAttribute() {}, removeAttribute() {} }, querySelector: () => null, querySelectorAll: () => [] },
  });
  app.replaceStateInMemory(app.normalizeRemoteState({
    filaments: ["f", "g"].map((id) => ({ id, manufacturer: id, material: "PLA", color: "Blue", spoolWeightGrams: 1000, stockGrams: 100 })),
    parts: [
      { id: "p", name: "P", color: "Blue", material: "PLA", filamentId: "f", filamentGramsPerUnit: 5, printTimeMinutes: 10 },
      { id: "q", name: "Q", color: "Blue", material: "PLA", filamentId: "g", filamentGramsPerUnit: 10, printTimeMinutes: 30 },
    ],
    products: ["p", "q"].map((id) => ({ id, name: id, active: true, requiresAssembly: false, partRequirements: [{ partId: id, quantity: 1 }] })),
    printers: [
      { id: "f1", name: "F1", active: true, filamentId: "f" },
      { id: "f2", name: "F2", active: true, filamentId: "f" },
      { id: "g1", name: "G1", active: true, filamentId: "g" },
      { id: "inactive", name: "Inactive", active: false, filamentId: "f" },
      { id: "legacy", name: "Legacy", active: true, color: "Blue", material: "PLA" },
    ],
    printState: [{ partId: "p", plannedQty: 1, inProgressQty: 2 }],
    salesOrders: [{ id: "order", orderNumber: "1", orderDate: "2026-10-18", status: "open", items: [{ productId: "p", quantity: 6 }, { productId: "q", quantity: 3 }] }],
  }));
  return app;
}

test("queue and printer summaries keep exact-filament pools separate in time estimates", () => {
  const app = appFixture();
  const computed = app.computeState();
  assert.equal(computed.queueByPartId.get("p").readyPrinterCount, 2);
  assert.equal(computed.queueByPartId.get("q").readyPrinterCount, 1);
  assert.equal(computed.totalQueueParallelTimeMinutes, 90);
  assert.equal(computed.printerSummaries.find((printer) => printer.id === "f1").setupParallelTimeMinutes, 30);
  assert.equal(computed.printerSummaries.find((printer) => printer.id === "legacy").compatibleQueueRowsCount, 0);
  assert.equal(computed.queueReadyPrinterCount, 3);
  const markup = app.renderQueueCard(computed.queueByPartId.get("p"), false);
  assert.match(markup, /Future filament: 30 g/);
  assert.match(markup, /f · PLA · Blue · 5 g per unit/);
});

test("missing setup disables starts and unpaid completions", () => {
  const app = appFixture();
  app.state.parts[0].filamentId = null;
  const row = app.computeState().queueByPartId.get("p");
  const markup = app.renderQueueCard(row, false);
  assert.equal(row.readyPrinterCount, 0);
  assert.match(markup, /Filament setup required/);
  assert.match(markup, /data-action="queue-start"[^>]+disabled/);
  assert.match(markup, /data-action="queue-complete"[^>]+disabled/);
});

test("filament history participates in actor, action and scope filters", () => {
  const app = appFixture();
  app.state.filamentInventoryMovements = [{ id: "move", filamentId: "f", deltaGrams: -10, reason: "print_completed", actor: "Operator", createdAt: new Date().toISOString() }];
  const computed = app.computeState();
  assert(computed.activityActors.some((entry) => entry.value === "Operator"));
  const filtered = app.filterActivityEntries(app.buildFilamentActivityEntries(), { actor: "Operator", scope: "filament", action: "print_completed", window: "all" });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].badgeLabel, "-10 g");
});

test("Complete prints previews the entered quantity, decimal usage and negative balance", () => {
  const app = appFixture();
  app.state.parts[0].filamentGramsPerUnit = 12.34;
  app.state.filaments[0].stockGrams = 20;
  const row = app.computeState().queueByPartId.get("p");
  const submit = {};
  app.dom.queueActionForm = { elements: { quantity: { value: "3" } }, querySelector: () => submit };
  app.dom.queueActionPreview = {};
  app.ui.queueActionDraft = { row, action: "complete" };
  app.renderQueueActionPreview();
  assert.match(app.dom.queueActionPreview.innerHTML, /37.02 g/);
  assert.match(app.dom.queueActionPreview.innerHTML, /3 completed units × 12.34 g per unit/);
  assert.match(app.dom.queueActionPreview.innerHTML, /-17.02 g/);
  assert.match(app.dom.queueActionPreview.innerHTML, /Stock will be negative/);
  assert.equal(submit.disabled, false);
  app.dom.queueActionForm.elements.quantity.value = "1";
  app.renderQueueActionPreview();
  assert.match(app.dom.queueActionPreview.innerHTML, /12.34 g/);
  assert.match(app.dom.queueActionPreview.innerHTML, /7.66 g/);
  app.ui.queueActionDraft.action = "start";
  app.renderQueueActionPreview();
  assert.match(app.dom.queueActionPreview.textContent, /No filament is deducted now/);
  app.dom.queueActionForm.elements.quantity.value = "1.5";
  app.ui.queueActionDraft.action = "complete";
  app.renderQueueActionPreview();
  assert.equal(submit.disabled, true);
});

test("prepaid quantities survive frontend state replacement and appear in completion preview", () => {
  const app = appFixture();
  const snapshot = JSON.parse(JSON.stringify(app.state));
  snapshot.printState[0].prepaidFilamentQty = 2;
  app.replaceStateInMemory(app.normalizeRemoteState(snapshot));
  const row = app.computeState().queueByPartId.get("p");
  assert.equal(row.prepaidFilamentQty, 2);
  app.dom.queueActionForm = { elements: { quantity: { value: "3" } }, querySelector: () => ({}) };
  app.dom.queueActionPreview = {};
  app.ui.queueActionDraft = { row, action: "complete" };
  app.renderQueueActionPreview();
  assert.match(app.dom.queueActionPreview.innerHTML, /1 completed unit × 5 g per unit/);
  assert.match(app.dom.queueActionPreview.innerHTML, /2 units were already charged/);
  assert.match(app.renderQueueCard(row, false), /Future filament: 20 g/);
});

test("ordering includes the sales-driven queue and stock deficit, rounds per filament, and clears after restocking", () => {
  const app = appFixture();
  app.state.parts[0].filamentGramsPerUnit = 12.34;
  app.state.salesOrders[0].items[0].quantity = 8;
  Object.assign(app.state.filaments[0], { stockGrams: -50, spoolWeightGrams: 750 });
  Object.assign(app.state.filaments[1], { stockGrams: 9, spoolWeightGrams: 10 });
  const needs = filamentModel.filamentOrderingNeeds(app.state.filaments, app.computeState().productionQueue);
  assert.equal(needs.length, 2); // Identical material/color still require separate orders.
  assert.equal(needs[0].filament.id, "f");
  assert.equal(needs[0].neededGrams, 98.72);
  assert.equal(needs[0].shortageGrams, 148.72);
  assert.equal(needs[0].rollsToOrder, 1);
  assert.equal(needs[1].rollsToOrder, 3);
  for (const name of ["filamentOrderAlert", "filamentOrderCount", "filamentOrderSetup", "filamentOrderList"]) app.dom[name] = {};
  app.dom.filamentOrderPanel = { classList: { toggle() {} } };
  app.renderFilamentOrdering(app.computeState());
  assert.equal(app.dom.filamentOrderAlert.hidden, false);
  assert.match(app.dom.filamentOrderAlert.innerHTML, /4 rolls/);
  assert.match(app.dom.filamentOrderList.innerHTML, /148.72 g/);
  assert.match(app.dom.filamentOrderList.innerHTML, /data-action="filament-stock" data-id="f"/);
  app.state.filaments.forEach((filament) => { filament.stockGrams = 1000; });
  app.renderFilamentOrdering(app.computeState());
  assert.equal(app.dom.filamentOrderAlert.hidden, true);
  assert.match(app.dom.filamentOrderList.innerHTML, /No filament to order/);
  // Missing configuration must not produce a false all-clear.
  app.state.parts[0].filamentId = null;
  app.renderFilamentOrdering(app.computeState());
  assert.equal(app.dom.filamentOrderAlert.hidden, false);
  assert.match(app.dom.filamentOrderAlert.innerHTML, /estimate is incomplete/);
  assert.match(app.dom.filamentOrderSetup.innerHTML, /Configure P/);
  assert.equal(app.dom.filamentOrderCount.textContent, "Setup required");
});

test("whole-roll suggestions use exact decimal accounting and include deficits without queued work", () => {
  const filament = { id: "f", manufacturer: "Maker", material: "PLA", color: "Blue", stockGrams: 0.1, spoolWeightGrams: 10 };
  const rows = [{ part: { filamentId: "f", filamentGramsPerUnit: 10.1 }, plannedQty: 1, remainingQty: 0 }];
  assert.equal(filamentModel.filamentOrderingNeeds([filament], rows)[0].rollsToOrder, 1);
  const deficit = filamentModel.filamentOrderingNeeds([{ ...filament, stockGrams: -10.01 }], []);
  assert.equal(deficit[0].shortageGrams, 10.01);
  assert.equal(deficit[0].rollsToOrder, 2);
});


test("preview snapshot metadata survives frontend normalization and appears in the header", () => {
  const app = appFixture();
  app.applyRemoteMeta({ auth: { authenticated: true, email: "operator@example.com" },
    app: { environment: "preview", previewDataSource: "production snapshot", previewSnapshotAt: "2026-10-18T20:00:00.000Z" } });
  app.dom.signedInUser = {};
  app.renderHeader();
  assert.equal(app.ui.appMeta.previewSnapshotAt, "2026-10-18T20:00:00.000Z");
  assert.match(app.dom.signedInUser.textContent, /Preview environment · production snapshot from/);
  assert.match(app.dom.signedInUser.textContent, /operator@example.com/);
});

test("non-printed parts keep sales shortages and product requirements but leave print timing and filament demand", () => {
  const app = appFixture();
  app.state.parts[0] = app.normalizePart({ ...app.state.parts[0], isPrinted: false });
  app.state.printState = [];
  const computed = app.computeState();
  assert.equal(computed.currentDemandByPartId.get("p"), 6);
  assert.equal(computed.currentDemandGapByPartId.get("p"), 6);
  assert.equal(computed.queueByPartId.has("p"), false);
  assert.equal(computed.productionQueue.length, 1);
  assert.equal(computed.totalQueueParallelTimeMinutes, 90);
  assert.equal(computed.productSummaries.find((product) => product.id === "p").buildableNow, 0);
  assert.equal(filamentModel.futureFilamentDemand(computed.productionQueue).has("f"), false);
  assert.match(app.partFilamentMarkup(app.state.parts[0]), /Not 3D printed/);
  assert.doesNotMatch(app.partFilamentMarkup(app.state.parts[0]), /setup required/);
  assert.match(app.renderPartDetail(computed.partsById.get("p"), computed), /data-action="queue-part"[^>]*hidden/);
  assert.equal(app.state.parts[0].filamentId, null);
  assert.equal(app.state.parts[0].filamentGramsPerUnit, null);
  assert.equal(app.state.parts[0].printTimeMinutes, 0);
  // Helpers also ignore malformed rows with leftover filament settings.
  const row = { part: { isPrinted: false, filamentId: "f", filamentGramsPerUnit: 99 }, plannedQty: 4, remainingQty: 10 };
  assert.equal(filamentModel.futureFilamentDemand([row]).size, 0);
  assert.equal(filamentModel.printerMatchesFilament({ filamentId: "f" }, row.part), false);
});

test("part editor hides print fields for bookkeeping parts and keeps existing stock read-only", () => {
  const app = appFixture();
  const names = ["id", "name", "sku", "isPrinted", "filamentId", "filamentGramsPerUnit", "inventoryQty", "minStock", "printTimeMinutes", "imageRef", "fileRef", "notes"];
  const labels = Object.fromEntries(names.map((name) => [name, {}]));
  const elements = Object.fromEntries(names.map((name) => [name, { closest: () => labels[name] }]));
  const helper = {};
  app.dom.partForm = { elements, querySelector: (selector) => selector === "[data-part-stock-help]" ? helper : selector.startsWith('[name=') ? elements[selector.match(/"(.+)"/)[1]] : {} };
  app.ui.partFormDraft = { ...app.state.parts[0], isPrinted: false };
  app.renderPartForm();
  assert.equal(elements.isPrinted.checked, false);
  assert.equal(elements.filamentId.disabled, true);
  assert.equal(labels.filamentGramsPerUnit.hidden, true);
  assert.equal(labels.printTimeMinutes.hidden, true);
  assert.equal(elements.inventoryQty.readOnly, true);
  assert.match(helper.textContent, /Add stock or Adjust/);
  app.ui.partFormDraft = { ...app.ui.partFormDraft, id: "", isPrinted: true };
  app.renderPartForm();
  assert.equal(elements.filamentId.disabled, false);
  assert.equal(labels.filamentGramsPerUnit.hidden, false);
  assert.equal(elements.inventoryQty.readOnly, false);
  assert.match(helper.textContent, /no filament is deducted retrospectively/);
});

test("Add stock previews consumption and deficits; signed removals are not turned into additions", async () => {
  let response = "3";
  let confirmations = [];
  let sent = [];
  const app = appFixture({ skipRender: true, window: {
    prompt: () => response,
    confirm: (message) => { confirmations.push(message); return true; },
    alert: (message) => { throw Error(message); },
    fetch: async (url, request) => {
      sent.push(JSON.parse(request.body));
      return { ok: true, json: async () => ({ state: JSON.parse(JSON.stringify(app.state)) }) };
    },
  } });
  app.state.parts[0].filamentGramsPerUnit = 12.34;
  app.state.parts[0].inventoryQty = 5;
  app.state.filaments[0].stockGrams = 20;
  await app.adjustPartStock("p", "add");
  assert.equal(sent[0].delta, 3);
  assert.equal(sent[0].expectedIsPrinted, true);
  assert.equal(sent[0].expectedFilamentGramsPerUnit, 12.34);
  assert.match(confirmations[0], /37.02 g/);
  assert.match(confirmations[0], /-17.02 g/);
  assert.match(confirmations[0], /Stock will be negative/);
  response = "-1";
  await app.adjustPartStock("p", "add");
  assert.equal(sent[1].delta, -1);
  assert.equal(confirmations.length, 1);
  response = "2";
  await app.adjustPartStock("p", "adjust");
  assert.equal(sent[2].delta, 2);
  assert.equal(confirmations.length, 2);
  app.state.parts[0] = app.normalizePart({ ...app.state.parts[0], isPrinted: false });
  await app.adjustPartStock("p", "add");
  assert.equal(sent[3].expectedIsPrinted, false);
  assert.equal(sent[3].expectedFilamentId, null);
  assert.equal(confirmations.length, 2);
});

test("cancelling the stock preview and invalid/unconfigured inputs send no mutation", async () => {
  let response = "2";
  const alerts = [];
  const app = appFixture({ skipRender: true, window: {
    prompt: () => response, confirm: () => false, alert: (text) => alerts.push(text),
    fetch: () => { throw Error("Must not send a mutation"); },
  } });
  await app.adjustPartStock("p", "add");
  for (const invalid of ["1.5", "2x", "0", "", "-1"]) {
    response = invalid;
    await app.adjustPartStock("p", "add");
  }
  assert.equal(alerts.length, 5);
  response = "1";
  app.state.parts[0].filamentId = null;
  await app.adjustPartStock("p", "add");
  assert.match(alerts.at(-1), /Configure/);
});
