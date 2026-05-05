import {
  ApiError,
  adjustFinishedStock,
  assembleProduct,
  packProduct,
  readRequestJson,
  resolveRequestActor,
  setProductActive,
  withMutationState,
} from "./_lib/store.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return new Response("Method not allowed.", { status: 405 });
  }

  return withMutationState(context, async (db) => {
    const payload = await readRequestJson(context.request);
    const actor = resolveRequestActor(context, payload.actor);

    if (payload.action === "toggle") {
      await setProductActive(db, payload);
      return;
    }
    if (payload.action === "assemble") {
      await assembleProduct(db, { ...payload, actor });
      return;
    }
    if (payload.action === "adjust_finished_stock") {
      await adjustFinishedStock(db, { ...payload, actor });
      return;
    }
    if (payload.action === "pack") {
      await packProduct(db, { ...payload, actor });
      return;
    }

    throw new ApiError(400, "Unknown product action.");
  });
}
