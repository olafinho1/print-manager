import assert from "node:assert/strict";
import test from "node:test";

import { buildDemandModel } from "../demand-model.js";

const assemblyProduct = {
  id: "assembled",
  name: "Assembled",
  active: true,
  requiresAssembly: true,
  finishedStock: 3,
  targetStock: 8,
  partRequirements: [{ partId: "body", quantity: 2 }],
};

test("open sales demand is added while finished stock is reserved before target stock", () => {
  const model = buildDemandModel({
    parts: [{ id: "body", inventoryQty: 4 }],
    products: [assemblyProduct],
    salesOrders: [
      {
        status: "open",
        orderDate: "2026-07-12",
        items: [{ productId: "assembled", quantity: 5, fulfilledQuantity: 0 }],
      },
    ],
  });

  assert.deepEqual(model.productDemandById.get("assembled"), {
    productId: "assembled",
    salesDemand: 5,
    salesUnitsToProduce: 2,
    targetUnitsToProduce: 8,
    totalUnitsToProduce: 10,
    oldestOrderDate: "2026-07-12",
  });
  assert.equal(model.partDemandById.get("body").requiredQty, 20);
  assert.equal(model.partDemandById.get("body").orderShortageQty, 0);
  assert.equal(model.partDemandById.get("body").targetShortageQty, 16);
});

test("packing an assembled order preserves the replenishment requirement", () => {
  const before = buildDemandModel({
    parts: [{ id: "body", inventoryQty: 0 }],
    products: [assemblyProduct],
    salesOrders: [{ status: "open", orderDate: "2026-07-12", items: [{ productId: "assembled", quantity: 2 }] }],
  });
  const after = buildDemandModel({
    parts: [{ id: "body", inventoryQty: 0 }],
    products: [{ ...assemblyProduct, finishedStock: 1 }],
    salesOrders: [{ status: "packed", orderDate: "2026-07-12", items: [{ productId: "assembled", quantity: 2, fulfilledQuantity: 2 }] }],
  });

  assert.equal(before.partDemandById.get("body").shortageQty, 14);
  assert.equal(after.partDemandById.get("body").shortageQty, 14);
});

test("direct products use part inventory for orders first and targets second", () => {
  const model = buildDemandModel({
    parts: [{ id: "direct-part", inventoryQty: 3 }],
    products: [
      {
        id: "direct",
        name: "Direct",
        active: true,
        requiresAssembly: false,
        targetStock: 4,
        partRequirements: [{ partId: "direct-part", quantity: 1 }],
      },
    ],
    salesOrders: [{ status: "open", orderDate: "2026-07-10", items: [{ productId: "direct", quantity: 5 }] }],
  });
  const demand = model.partDemandById.get("direct-part");

  assert.equal(demand.orderRequiredQty, 5);
  assert.equal(demand.targetRequiredQty, 4);
  assert.equal(demand.orderShortageQty, 2);
  assert.equal(demand.targetShortageQty, 4);
});

test("open orders remain demand for inactive products while their targets do not", () => {
  const model = buildDemandModel({
    parts: [{ id: "body", inventoryQty: 0 }],
    products: [{ ...assemblyProduct, active: false, finishedStock: 0 }],
    salesOrders: [
      { status: "open", orderDate: "2026-07-10", items: [{ productId: "assembled", quantity: 2 }] },
      { status: "cancelled", orderDate: "2026-07-09", items: [{ productId: "assembled", quantity: 20 }] },
      { status: "packed", orderDate: "2026-07-08", items: [{ productId: "assembled", quantity: 20, fulfilledQuantity: 20 }] },
    ],
  });

  assert.equal(model.productDemandById.get("assembled").salesDemand, 2);
  assert.equal(model.productDemandById.get("assembled").targetUnitsToProduce, 0);
  assert.equal(model.partDemandById.get("body").requiredQty, 4);
});
