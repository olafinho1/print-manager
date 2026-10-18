import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { buildDemandModel } from "../demand-model.js";
import * as filamentModel from "../filament-model.js";

// Exercise the app's real view-model and markup functions without starting a
// browser or changing the production bundle's public interface.
function appFixture() {
  const source = readFileSync(new URL("../app.js", import.meta.url), "utf8")
    .replace(/^import .*;$/gm, "")
    .replace("  init();", "")
    .replace(/\}\)\(\);\s*$/, "return { ui, state, dom, applyRemoteMeta, renderHeader, renderFilamentOrdering, renderQueueActionPreview, queueActionLimit, normalizeRemoteState, replaceStateInMemory, computeState, renderQueueCard, buildFilamentActivityEntries, filterActivityEntries }; })();");
  const app = runInNewContext(source, {
    buildDemandModel, ...filamentModel,
    window: { location: { hostname: "localhost" }, sessionStorage: { getItem: () => null } },
    document: { querySelector: () => null, querySelectorAll: () => [] },
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
