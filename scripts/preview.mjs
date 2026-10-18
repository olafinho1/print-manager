import { createHash } from "node:crypto";
import { appendFile, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { SEED_STATE, replaceState } from "../functions/api/_lib/store.js";

export function previewIdentity(repository, number) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository || "") || !/^[1-9]\d*$/.test(String(number))) {
    throw new Error("A valid repository and positive PR number are required.");
  }
  const suffix = createHash("sha256").update(repository.toLowerCase()).digest("hex").slice(0, 8);
  const name = `print-manager-pr-${number}-${suffix}`;
  if (name.length > 58) throw new Error("PR number is too long.");
  return { name, repository, number: String(number), branch: `pr-${number}`, environment: `preview-pr-${number}` };
}

export function previewVars(identity) {
  return { APP_ENV: "preview", ALLOW_SAMPLE_RESET: "false", PREVIEW_REPOSITORY: identity.repository, PREVIEW_PR: identity.number };
}

export function assertOwnedProject(project, identity) {
  if (!project) return;
  const vars = project.deployment_configs?.preview?.env_vars;
  if (project.name !== identity.name || project.source ||
      vars?.PREVIEW_REPOSITORY?.value !== identity.repository || vars?.PREVIEW_PR?.value !== identity.number) {
    throw new Error(`Refusing to modify ${identity.name}: preview ownership does not match.`);
  }
}

export function assertPreviewDatabase(database, identity, protectedIds) {
  if (database?.name !== identity.name || !/^[a-f\d-]{36}$/i.test(database?.uuid || "") || protectedIds.includes(database.uuid)) {
    throw new Error("Refusing to use a database outside this PR preview.");
  }
}

export function createCloudflareClient(accountId, token, fetchImpl = fetch) {
  if (!/^[a-f\d]{32}$/i.test(accountId || "") || !token) {
    throw new Error("Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in the repository's Actions secrets.");
  }
  return async (path, { method = "GET", body, allowMissing = false } = {}) => {
    const response = await fetchImpl(`https://api.cloudflare.com/client/v4/accounts/${accountId}${path}`, {
      method, redirect: "error", signal: AbortSignal.timeout(60000),
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (allowMissing && response.status === 404) return null;
    const data = await response.json();
    if (!response.ok || !data.success || (Array.isArray(data.result) && data.result.some((entry) => entry.success === false))) {
      throw new Error(`Cloudflare ${method} ${path}: ${data.errors?.map((error) => error.message).join("; ") || response.status}`);
    }
    return data.result;
  };
}

async function findDatabase(api, identity) {
  for (let page = 1; ; page++) {
    const rows = await api(`/d1/database?name=${identity.name}&per_page=100&page=${page}`);
    const database = rows.find((entry) => entry.name === identity.name);
    if (database) return database;
    if (rows.length < 100) return null;
  }
}

export async function ensurePreviewResources(api, identity, protectedIds, compatibilityDate) {
  const projectPath = `/pages/projects/${identity.name}`;
  let project = await api(projectPath, { allowMissing: true });
  assertOwnedProject(project, identity);
  let database = await findDatabase(api, identity);
  if (!database) database = await api("/d1/database", { method: "POST", body: { name: identity.name } });
  assertPreviewDatabase(database, identity, protectedIds);
  const boundId = project?.deployment_configs?.preview?.d1_databases?.DB?.id;
  if (boundId && boundId !== database.uuid) throw new Error("The preview project is bound to a different database.");
  if (!project) {
    const deploymentConfig = {
      compatibility_date: compatibilityDate,
      d1_databases: { DB: { id: database.uuid } },
      env_vars: Object.fromEntries(Object.entries(previewVars(identity)).map(([key, value]) => [key, { type: "plain_text", value }])),
    };
    project = await api("/pages/projects", { method: "POST", body: {
      name: identity.name, production_branch: "preview-project-only",
      deployment_configs: { preview: deploymentConfig, production: deploymentConfig },
    } });
    assertOwnedProject(project, identity);
  }
  return database;
}

export async function destroyPreviewResources(api, identity, protectedIds) {
  const projectPath = `/pages/projects/${identity.name}`;
  const project = await api(projectPath, { allowMissing: true });
  assertOwnedProject(project, identity);
  const database = await findDatabase(api, identity);
  if (database) assertPreviewDatabase(database, identity, protectedIds);
  const boundId = project?.deployment_configs?.preview?.d1_databases?.DB?.id;
  if (boundId && (protectedIds.includes(boundId) || (database && boundId !== database.uuid))) {
    throw new Error("Refusing cleanup: the project and database do not match.");
  }
  // Delete the serving app first. If this fails, leave its database available.
  if (project) await api(projectPath, { method: "DELETE", allowMissing: true });
  if (database) await api(`/d1/database/${database.uuid}`, { method: "DELETE", allowMissing: true });
  if (await api(projectPath, { allowMissing: true }) || await findDatabase(api, identity)) {
    throw new Error("Preview cleanup could not be verified. Retry this workflow run.");
  }
}

function sqlLiteral(value) {
  if (value === null) return "NULL";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string") return `'${value.replaceAll("'", "''")}'`;
  throw new Error("Unsupported seed value.");
}

export async function previewSeedSql() {
  const statements = [];
  // Reuse the real restore serializer, retaining only inserts. A retry never
  // deletes or overwrites operator-entered test data.
  const collector = {
    prepare(sql) { return { bind(...params) { return { sql, params }; } }; },
    async exec() {},
    async batch(batch) { statements.push(...batch); },
  };
  const sample = structuredClone(SEED_STATE);
  const timestamp = new Date().toISOString();
  for (const product of sample.products) if (!product.requiresAssembly) product.active = true;
  sample.salesOrders = sample.products.filter((product) => product.active).map((product, index) => ({
    id: `preview-order-${index + 1}`, orderNumber: `TEST-${index + 1}`, orderDate: timestamp.slice(0, 10),
    status: "open", createdAt: timestamp, updatedAt: timestamp, createdBy: "Preview seed", updatedBy: "Preview seed",
    items: [{ productId: product.id, quantity: 12 }],
  }));
  sample.salesOrderEvents = sample.salesOrders.map((order) => ({
    id: `preview-created-${order.id}`, orderId: order.id, action: "created", actor: "Preview seed", createdAt: timestamp,
    note: "Synthetic order for preview testing.",
  }));
  for (const filament of sample.filaments) filament.stockGrams = 250;
  for (const movement of sample.filamentInventoryMovements) movement.deltaGrams = 250;
  await replaceState(collector, sample);
  return statements.filter(({ sql }) => /^\s*INSERT INTO /i.test(sql)).map(({ sql, params }) => {
    let index = 0;
    const literal = sql.replace(/^\s*INSERT INTO /i, "INSERT OR IGNORE INTO ").replace(/\?/g, () => sqlLiteral(params[index++]));
    if (index !== params.length) throw new Error("Seed parameter mismatch.");
    return `${literal};`;
  }).join("\n") + "\nINSERT OR IGNORE INTO preview_seed (id) VALUES (1);\n";
}

export function previewConfig(identity, database, compatibilityDate, root) {
  return {
    name: identity.name, compatibility_date: compatibilityDate, pages_build_output_dir: "./dist",
    vars: previewVars(identity),
    d1_databases: [{ binding: "DB", database_name: identity.name, database_id: database.uuid, migrations_dir: join(root, "migrations") }],
  };
}

export async function runWrangler(args, { cwd = process.cwd(), root = process.cwd() } = {}) {
  console.log(`wrangler ${args.join(" ")}`);
  await new Promise((resolveRun, reject) => {
    const child = spawn(process.execPath, [join(root, "node_modules/wrangler/bin/wrangler.js"), ...args], {
      cwd, stdio: "inherit", env: { ...process.env, CI: "true", WRANGLER_SEND_METRICS: "false" },
    });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolveRun() : reject(new Error(`Wrangler exited with code ${code}.`)));
  });
}

export async function seedPreviewOnce(api, database, identity, protectedIds, seed) {
  assertPreviewDatabase(database, identity, protectedIds);
  const query = (sql) => api(`/d1/database/${database.uuid}/query`, { method: "POST", body: { sql } });
  await query("CREATE TABLE IF NOT EXISTS preview_seed (id INTEGER PRIMARY KEY CHECK (id = 1))");
  const result = await query("SELECT id FROM preview_seed WHERE id = 1");
  if (result[0]?.results?.length) return false;
  await seed();
  return true;
}

export async function buildPreviewBundle(stage, compatibilityDate, root = process.cwd()) {
  await mkdir(stage, { recursive: true });
  await cp(join(root, "dist"), join(stage, "dist"), { recursive: true });
  await runWrangler(["pages", "functions", "build", "functions", "--outdir", join(stage, "dist/_worker.js"),
    "--output-routes-path", join(stage, "dist/_routes.json"), "--compatibility-date", compatibilityDate], { root });
}

export async function verifyPreview(url, fetchImpl = fetch, pause = (ms) => new Promise((done) => setTimeout(done, ms))) {
  let lastError;
  for (let attempt = 0; attempt < 12; attempt++) {
    try {
      const response = await fetchImpl(`${url}/api/state`, { redirect: "error", signal: AbortSignal.timeout(10000) });
      const state = await response.json();
      if (!response.ok || state.meta?.app?.environment !== "preview" || !state.meta?.auth ||
          !Array.isArray(state.parts) || !Array.isArray(state.filaments) || !Array.isArray(state.salesOrders)) {
        throw new Error("Preview state or environment metadata is invalid.");
      }
      return;
    } catch (error) { lastError = error; }
    await pause(3000);
  }
  throw new Error(`Preview smoke check failed: ${lastError?.message}`);
}

async function github(path, { method = "GET", body } = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    method, redirect: "error", signal: AbortSignal.timeout(30000),
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`GitHub ${method} ${path}: ${response.status}`);
  return response.status === 204 ? null : response.json();
}

async function recordDeployment(identity, sha, url) {
  const base = `/repos/${identity.repository}/deployments`;
  const deployment = await github(base, { method: "POST", body: {
    ref: sha, auto_merge: false, required_contexts: [], environment: identity.environment,
    transient_environment: true, production_environment: false, description: `Isolated preview for PR #${identity.number}`,
  } });
  await github(`${base}/${deployment.id}/statuses`, { method: "POST", body: { state: "success", environment_url: url, auto_inactive: true } });
}

async function deactivateDeployments(identity) {
  for (let page = 1; ; page++) {
    const base = `/repos/${identity.repository}/deployments`;
    const deployments = await github(`${base}?environment=${identity.environment}&per_page=100&page=${page}`);
    for (const deployment of deployments) await github(`${base}/${deployment.id}/statuses`, {
      method: "POST", body: { state: "inactive", description: "PR closed; preview and D1 removed." },
    });
    if (deployments.length < 100) return;
  }
}

async function main() {
  const root = process.cwd();
  const baseConfig = await readFile(join(root, "wrangler.toml"), "utf8");
  const compatibilityDate = baseConfig.match(/^compatibility_date\s*=\s*"([\d-]+)"/m)?.[1];
  const protectedIds = [...baseConfig.matchAll(/^database_id\s*=\s*"([^"]+)"/gm)].map((match) => match[1]);
  if (!compatibilityDate || !protectedIds.length) throw new Error("Cannot identify the production configuration; refusing preview operations.");
  if (process.argv[2] === "build") {
    await buildPreviewBundle(resolve(".preview/local-build"), compatibilityDate);
    return;
  }
  const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, "utf8"));
  const identity = previewIdentity(process.env.GITHUB_REPOSITORY, event.pull_request?.number);
  const pr = await github(`/repos/${identity.repository}/pulls/${identity.number}`);
  if (pr.head.repo?.full_name !== identity.repository || pr.base.repo?.full_name !== identity.repository) {
    throw new Error("Cloudflare credentials are only used for PRs within this repository.");
  }
  const api = createCloudflareClient(process.env.CLOUDFLARE_ACCOUNT_ID, process.env.CLOUDFLARE_API_TOKEN);
  if (pr.state === "closed") {
    await destroyPreviewResources(api, identity, protectedIds);
    await deactivateDeployments(identity);
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `### Preview removed\n\nPR #${identity.number}: Pages project and D1 \`${identity.name}\` are deleted.\n`);
    return;
  }
  if (pr.head.sha !== event.pull_request.head.sha || event.action === "closed") {
    console.log("Skipping stale PR event; the latest PR run owns this preview.");
    return;
  }
  const database = await ensurePreviewResources(api, identity, protectedIds, compatibilityDate);
  const stage = resolve(".preview", identity.name);
  await mkdir(stage, { recursive: true });
  const configPath = join(stage, "wrangler.json");
  await writeFile(configPath, JSON.stringify(previewConfig(identity, database, compatibilityDate, root), null, 2));
  await runWrangler(["d1", "migrations", "apply", identity.name, "--remote", "--config", configPath]);
  const seeded = await seedPreviewOnce(api, database, identity, protectedIds, async () => {
    const seedPath = join(stage, "seed.sql");
    await writeFile(seedPath, await previewSeedSql());
    await runWrangler(["d1", "execute", identity.name, "--remote", "--config", configPath, "--file", seedPath, "--yes"]);
  });
  await buildPreviewBundle(stage, compatibilityDate);
  await runWrangler(["pages", "deploy", "dist", "--project-name", identity.name, "--branch", identity.branch,
    "--commit-hash", pr.head.sha, "--commit-message", `PR ${identity.number} preview`, "--commit-dirty=true"], { cwd: stage, root });
  const deployments = await api(`/pages/projects/${identity.name}/deployments?env=preview`);
  const deployment = deployments.find((entry) => entry.deployment_trigger?.metadata?.commit_hash === pr.head.sha && entry.deployment_trigger?.metadata?.branch === identity.branch);
  if (!deployment?.url) throw new Error("Cannot locate the uploaded preview deployment.");
  await verifyPreview(deployment.url);
  const alias = `https://${identity.branch}.${identity.name}.pages.dev`;
  const url = deployment.aliases?.includes(alias) ? alias : deployment.url;
  await recordDeployment(identity, pr.head.sha, url);
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `### PR preview ready\n\n[Open preview](${url})\n\n- Commit: \`${pr.head.sha}\`\n- Pages project and D1: \`${identity.name}\`\n- Test data: ${seeded ? "seeded" : "preserved"}\n- State and environment smoke check: passed\n\nSample data only. Updates preserve this database; closing the PR deletes it.\n`);
  console.log(`Preview ready: ${url}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
