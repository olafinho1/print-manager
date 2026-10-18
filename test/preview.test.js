import assert from "node:assert/strict";
import test from "node:test";
import {
  previewIdentity, previewVars, previewConfig, createCloudflareClient,
  ensurePreviewResources, destroyPreviewResources,
} from "../scripts/preview.mjs";

const productionId = "ebe1b46e-e722-44ea-ab21-5e309be0c7c0";
const testId = "11111111-2222-3333-4444-555555555555";
const identity = previewIdentity("olafinho1/print-manager", 12);

function cloudflareFixture() {
  const resources = { project: null, database: null, requests: [], seeded: false, failDeleteProject: false, failDeleteDatabase: false };
  const api = async (path, { method = "GET", body } = {}) => {
    resources.requests.push({ path, method, body });
    if (path.startsWith("/d1/database?")) return resources.database ? [resources.database] : [];
    if (path === "/d1/database" && method === "POST") return resources.database = { ...body, uuid: testId };
    if (path === "/pages/projects" && method === "POST") return resources.project = structuredClone(body);
    if (path === `/pages/projects/${identity.name}`) {
      if (method === "DELETE") {
        if (resources.failDeleteProject) throw new Error("project delete failed");
        resources.project = null;
      }
      return resources.project;
    }
    if (path === `/d1/database/${testId}` && method === "DELETE") {
      if (resources.failDeleteDatabase) throw new Error("database delete failed");
      resources.database = null;
      return null;
    }
    if (path === `/d1/database/${testId}/query`) {
      return [{ success: true, results: body.sql.startsWith("SELECT") && resources.seeded ? [{ id: 1 }] : [] }];
    }
    throw new Error(`Unexpected ${method} ${path}`);
  };
  return { api, resources };
}

test("PR resources have stable distinct names and never use branch text as a resource path", () => {
  assert.equal(identity.name, previewIdentity("olafinho1/print-manager", 12).name);
  assert.notEqual(identity.name, previewIdentity("olafinho1/print-manager", 13).name);
  assert.notEqual(identity.name, previewIdentity("someone/print-manager", 12).name);
  assert.throws(() => previewIdentity("olafinho1/print-manager", "../main"));
  assert.throws(() => previewIdentity("bad/repo/path", 12));
  const config = previewConfig(identity, { uuid: testId }, "2026-05-04", "/repo");
  assert.equal(config.vars.APP_ENV, "preview");
  assert.equal(config.d1_databases[0].database_id, testId);
  assert.equal(config.d1_databases[0].migrations_dir, "/repo/migrations");
  assert(!JSON.stringify(config).includes(productionId));
});

test("opened/reopened provisioning is idempotent and an update preserves D1", async () => {
  const { api, resources } = cloudflareFixture();
  const first = await ensurePreviewResources(api, identity, [productionId], "2026-05-04");
  const second = await ensurePreviewResources(api, identity, [productionId], "2026-05-04");
  assert.equal(first.uuid, second.uuid);
  assert.equal(resources.requests.filter((request) => request.method === "POST").length, 2);
  assert.equal(resources.project.deployment_configs.preview.d1_databases.DB.id, testId);
  assert.equal(resources.project.deployment_configs.preview.env_vars.PREVIEW_PR.value, "12");
  assert.notEqual(resources.project.production_branch, identity.branch);
});

test("provisioning resumes after a database was created but the Pages step failed", async () => {
  const { api, resources } = cloudflareFixture();
  resources.database = { name: identity.name, uuid: testId };
  await ensurePreviewResources(api, identity, [productionId], "2026-05-04");
  assert.equal(resources.requests.filter((request) => request.path === "/d1/database" && request.method === "POST").length, 0);
  assert(resources.project);
});

test("production IDs, unrelated projects and mismatched bindings block mutations", async () => {
  const { api, resources } = cloudflareFixture();
  resources.database = { name: identity.name, uuid: productionId };
  await assert.rejects(ensurePreviewResources(api, identity, [productionId], "2026-05-04"), /outside/);
  await assert.rejects(destroyPreviewResources(api, identity, [productionId]), /outside/);
  resources.database = { name: identity.name, uuid: testId };
  resources.project = { name: identity.name, source: { type: "github" } };
  await assert.rejects(destroyPreviewResources(api, identity, [productionId]), /ownership/);
  resources.project = null;
  await ensurePreviewResources(api, identity, [productionId], "2026-05-04");
  resources.project.deployment_configs.preview.d1_databases.DB.id = productionId;
  await assert.rejects(destroyPreviewResources(api, identity, [productionId]), /do not match/);
  assert.equal(resources.requests.filter((request) => request.method === "DELETE").length, 0);
});

test("close removes Pages before D1 and repeated cleanup succeeds", async () => {
  const { api, resources } = cloudflareFixture();
  await ensurePreviewResources(api, identity, [productionId], "2026-05-04");
  await destroyPreviewResources(api, identity, [productionId]);
  await destroyPreviewResources(api, identity, [productionId]);
  assert.equal(resources.project, null);
  assert.equal(resources.database, null);
  assert.deepEqual(resources.requests.filter((request) => request.method === "DELETE").map((request) => request.path), [
    `/pages/projects/${identity.name}`, `/d1/database/${testId}`,
  ]);
});

test("failed deletion retains the serving database and cleanup can resume after a partial failure", async () => {
  const { api, resources } = cloudflareFixture();
  await ensurePreviewResources(api, identity, [productionId], "2026-05-04");
  resources.failDeleteProject = true;
  await assert.rejects(destroyPreviewResources(api, identity, [productionId]), /project delete failed/);
  assert(resources.database);
  resources.failDeleteProject = false;
  resources.failDeleteDatabase = true;
  await assert.rejects(destroyPreviewResources(api, identity, [productionId]), /database delete failed/);
  assert.equal(resources.project, null);
  resources.failDeleteDatabase = false;
  await destroyPreviewResources(api, identity, [productionId]);
  assert.equal(resources.database, null);
});

test("API errors never masquerade as missing resources", async () => {
  const error = createCloudflareClient("a".repeat(32), "token", async () => new Response(JSON.stringify({ success: false, errors: [{ message: "Unauthorized" }] }), { status: 403 }));
  await assert.rejects(error("/pages/projects/test", { allowMissing: true }), /Unauthorized/);
  const missing = createCloudflareClient("a".repeat(32), "token", async () => new Response("", { status: 404 }));
  assert.equal(await missing("/pages/projects/test", { allowMissing: true }), null);
});
