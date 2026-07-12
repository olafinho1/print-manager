export function buildDemandModel({ parts = [], products = [], salesOrders = [] } = {}) {
  const openDemandByProductId = new Map();
  const oldestOrderDateByProductId = new Map();

  salesOrders
    .filter((order) => order.status === "open")
    .forEach((order) => {
      const orderDate = String(order.orderDate || "");
      (order.items || []).forEach((item) => {
        const remainingQty = Math.max(toInteger(item.quantity) - toInteger(item.fulfilledQuantity), 0);
        if (!item.productId || remainingQty <= 0) {
          return;
        }
        openDemandByProductId.set(
          item.productId,
          (openDemandByProductId.get(item.productId) || 0) + remainingQty,
        );
        const previousDate = oldestOrderDateByProductId.get(item.productId);
        if (orderDate && (!previousDate || orderDate < previousDate)) {
          oldestOrderDateByProductId.set(item.productId, orderDate);
        }
      });
    });

  const productDemandById = new Map();
  const rawPartDemandById = new Map();

  products.forEach((product) => {
    const salesDemand = openDemandByProductId.get(product.id) || 0;
    const finishedStock = product.requiresAssembly ? toInteger(product.finishedStock) : 0;
    const salesUnitsToProduce = product.requiresAssembly
      ? Math.max(salesDemand - finishedStock, 0)
      : salesDemand;

    const productDemand = {
      productId: product.id,
      salesDemand,
      salesUnitsToProduce,
      totalUnitsToProduce: salesUnitsToProduce,
      oldestOrderDate: oldestOrderDateByProductId.get(product.id) || "",
    };
    productDemandById.set(product.id, productDemand);

    (product.partRequirements || []).forEach((requirement) => {
      const perUnit = toInteger(requirement.quantity);
      if (!requirement.partId || perUnit <= 0) {
        return;
      }
      const existing = rawPartDemandById.get(requirement.partId) || {
        partId: requirement.partId,
        orderRequiredQty: 0,
        sources: [],
        oldestOrderDate: "",
      };
      const orderQuantity = salesUnitsToProduce * perUnit;
      existing.orderRequiredQty += orderQuantity;
      if (orderQuantity > 0) {
        existing.sources.push({
          sourceType: "sales_order",
          productId: product.id,
          productName: product.name,
          quantity: orderQuantity,
        });
        const orderDate = oldestOrderDateByProductId.get(product.id) || "";
        if (orderDate && (!existing.oldestOrderDate || orderDate < existing.oldestOrderDate)) {
          existing.oldestOrderDate = orderDate;
        }
      }
      rawPartDemandById.set(requirement.partId, existing);
    });
  });

  const partDemandById = new Map();
  parts.forEach((part) => {
    const raw = rawPartDemandById.get(part.id) || {
      partId: part.id,
      orderRequiredQty: 0,
      sources: [],
      oldestOrderDate: "",
    };
    const inventoryQty = toInteger(part.inventoryQty);
    const inventoryForOrders = Math.min(inventoryQty, raw.orderRequiredQty);
    const orderShortageQty = Math.max(raw.orderRequiredQty - inventoryForOrders, 0);

    partDemandById.set(part.id, {
      ...raw,
      requiredQty: raw.orderRequiredQty,
      orderShortageQty,
      shortageQty: orderShortageQty,
    });
  });

  return {
    openDemandByProductId,
    productDemandById,
    partDemandById,
  };
}

function toInteger(value) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}
