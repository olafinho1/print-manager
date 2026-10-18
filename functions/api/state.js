import {
  ApiError,
  buildStateResponse,
  getDb,
  hasData,
  json,
  normalizeState,
  readRequestJson,
  readState,
  replaceState,
  seedStateIfEmpty,
} from "./_lib/store.js";

export async function onRequest(context) {
  try {
    const db = await getDb(context);

    if (context.request.method === "GET") {
      const state = await readState(db);
      if (hasData(state) || context.env.PREVIEW_DATA_SOURCE === "production snapshot") {
        return json(buildStateResponse(context, state));
      }
      return json(buildStateResponse(context, await seedStateIfEmpty(db)));
    }

    if (context.request.method === "PUT") {
      const nextState = normalizeState(await readRequestJson(context.request));
      await replaceState(db, nextState);
      return json(buildStateResponse(context, await readState(db)));
    }

    return json({ error: "Method not allowed." }, 405);
  } catch (error) {
    return json(
      {
        error: error instanceof ApiError ? error.message : error instanceof Error ? error.message : "Unknown error",
      },
      error instanceof ApiError ? error.status : 500,
    );
  }
}
