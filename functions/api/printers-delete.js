import { deletePrinter, readRequestJson, withMutationState } from "./_lib/store.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return new Response("Method not allowed.", { status: 405 });
  }

  return withMutationState(context, async (db) => {
    const payload = await readRequestJson(context.request);
    await deletePrinter(db, String(payload.id || ""));
  });
}
