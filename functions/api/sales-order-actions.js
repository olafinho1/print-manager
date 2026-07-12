import {
  ApiError,
  cancelSalesOrder,
  packSalesOrder,
  readRequestJson,
  resolveRequestActor,
  withMutationState,
} from "./_lib/store.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return new Response("Method not allowed.", { status: 405 });
  }

  return withMutationState(context, async (db) => {
    const payload = await readRequestJson(context.request);
    const actor = resolveRequestActor(context, payload.actor);
    if (payload.action === "pack") {
      await packSalesOrder(db, { ...payload, actor });
      return;
    }
    if (payload.action === "cancel") {
      await cancelSalesOrder(db, { ...payload, actor });
      return;
    }
    throw new ApiError(400, "Unknown sales order action.");
  });
}
