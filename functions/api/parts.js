import { readRequestJson, resolveRequestActor, savePart, withMutationState } from "./_lib/store.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return new Response("Method not allowed.", { status: 405 });
  }

  return withMutationState(context, async (db) => {
    const payload = await readRequestJson(context.request);
    await savePart(db, payload.part || payload, resolveRequestActor(context, payload.actor));
  });
}
