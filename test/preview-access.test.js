import assert from "node:assert/strict";
import test from "node:test";
import { previewIdentity } from "../scripts/preview.mjs";
import { ensurePreviewAccess, destroyPreviewAccess, verifyAccess, copyAccessPolicy, assertOwnedAccess } from "../scripts/preview-access.mjs";

const identity = previewIdentity("olafinho1/print-manager", 12);
const source = { id: "source-id", name: "Production", type: "self_hosted", domain: "print.example.com", allowed_idps: ["idp-id"], session_duration: "12h" };
const policy = { id: "source-policy", name: "Operators", decision: "allow", include: [{ email_domain: { domain: "example.com" } }],
  exclude: [{ email: { email: "blocked@example.com" } }], require: [{ login_method: { id: "idp-id" } }], precedence: 1 };
function fixture() {
  const state = { apps: [structuredClone(source)], policies: { "source-id": [structuredClone(policy)] }, mutations: [] };
  const api = async (path, { method = "GET", body } = {}) => {
    if (method !== "GET") state.mutations.push({ path, method, body });
    if (path.startsWith("/access/apps?")) return state.apps;
    if (path === "/pages/projects/production") return { domains: [source.domain, "production.pages.dev"] };
    if (path === "/access/apps" && method === "POST") {
      const app = { ...body, id: "preview-id" }; state.apps.push(app); state.policies[app.id] = []; return app;
    }
    const match = path.match(/^\/access\/apps\/([^/?]+)(?:\/policies(?:\/([^/?]+))?)?(?:\?.*)?$/);
    if (!match) throw new Error(`Unexpected ${path}`);
    const [, id, policyId] = match;
    if (path.includes("/policies")) {
      const policies = state.policies[id];
      if (method === "POST") { const item = { ...body, id: "preview-policy" }; policies.push(item); return item; }
      if (method === "PUT") { Object.assign(policies.find((entry) => entry.id === policyId), body); return {}; }
      if (method === "DELETE") { state.policies[id] = policies.filter((entry) => entry.id !== policyId); return null; }
      return policies;
    }
    const app = state.apps.find((entry) => entry.id === id);
    if (method === "PUT") Object.assign(app, body);
    if (method === "DELETE") state.apps = state.apps.filter((entry) => entry.id !== id);
    return app;
  };
  return { state, api };
}

test("preview Access covers root and all aliases, preserves production restrictions, and is repeatable", async () => {
  const { state, api } = fixture();
  const app = await ensurePreviewAccess(api, identity, "production");
  assert.deepEqual(app.destinations.map((entry) => entry.uri), [`${identity.name}.pages.dev`, `*.${identity.name}.pages.dev`]);
  assert.deepEqual(app.allowed_idps, source.allowed_idps);
  assert.deepEqual(state.policies[app.id][0].require, policy.require);
  assert.deepEqual(state.policies[app.id][0].exclude, policy.exclude);
  await ensurePreviewAccess(api, identity, "production");
  assert.equal(state.apps.length, 2);
  assert.equal(state.policies[app.id].length, 1);
  assert(state.mutations.every((entry) => !entry.path.includes("source-id")));
  await destroyPreviewAccess(api, identity);
  await destroyPreviewAccess(api, identity);
  assert.deepEqual(state.apps, [source]);
});

test("Access protection rejects bypasses, ambiguous production applications, and unrelated resources", async () => {
  assert.throws(() => copyAccessPolicy({ ...policy, decision: "bypass" }), /bypass/);
  const { state, api } = fixture();
  state.apps.push({ ...source, id: "another-source" });
  await assert.rejects(ensurePreviewAccess(api, identity, "production"), /identify/);
  assert.equal(state.mutations.length, 0);
  const app = await ensurePreviewAccess(api, identity, "production", source.id);
  assert.throws(() => assertOwnedAccess({ ...app, domain: source.domain }, identity), /outside/);
  assert.throws(() => assertOwnedAccess({ ...app, destinations: [{ type: "public", uri: app.domain, overrides: [{ behavior: "public", path_pattern: "*" }] }] }, identity), /outside/);
});

test("protection check retries propagation and rejects public JSON, ordinary errors, and unrelated redirects", async () => {
  let calls = 0;
  const redirect = () => new Response(null, { status: 302, headers: { location: "https://team.cloudflareaccess.com/cdn-cgi/access/login/preview.pages.dev" } });
  await verifyAccess(["https://preview.pages.dev"], async () => ++calls === 1 ? Response.json({ private: "fixture" }) : redirect(), async () => {});
  assert.equal(calls, 2);
  for (const response of [Response.json({ parts: [] }), new Response(null, { status: 403 }),
    new Response(null, { status: 302, headers: { location: "https://example.com/login" } })]) {
    await assert.rejects(verifyAccess(["https://preview.pages.dev"], async () => response, async () => {}), /not verified/);
  }
});
