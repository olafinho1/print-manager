import { ApiError, readRequestJson, setPrinterActive, withMutationState } from "./_lib/store.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return new Response("Method not allowed.", { status: 405 });
  }

  return withMutationState(context, async (db) => {
    const payload = await readRequestJson(context.request);
    if (payload.action !== "toggle") {
      throw new ApiError(400, "Unknown printer action.");
    }
    await setPrinterActive(db, payload);
  });
}
