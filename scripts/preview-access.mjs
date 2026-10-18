// Access is provisioned before any production data is copied into a preview.
export async function listAccess(api, path) {
  const rows = [];
  for (let page = 1; ; page++) {
    const batch = await api(`${path}?per_page=100&page=${page}`);
    rows.push(...batch);
    if (batch.length < 100) return rows;
  }
}

function domains(app) {
  return [...new Set([app.domain, ...(app.self_hosted_domains || []),
    ...(app.destinations || []).filter((entry) => entry.type === "public").map((entry) => entry.uri)].filter(Boolean))];
}

export function assertOwnedAccess(app, identity) {
  const expected = [`${identity.name}.pages.dev`, `*.${identity.name}.pages.dev`];
  if (app.name !== identity.name || app.type !== "self_hosted" ||
      domains(app).length !== 2 || domains(app).some((domain) => !expected.includes(domain)) ||
      app.destinations?.some((entry) => entry.overrides?.length)) {
    throw new Error("Refusing to change an Access application outside this PR preview.");
  }
}

export function copyAccessPolicy(policy) {
  if (!["allow", "deny", "non_identity"].includes(policy.decision)) {
    throw new Error("Production Access has a bypass policy; configure a private preview policy before copying data.");
  }
  const fields = ["decision", "include", "exclude", "require", "precedence", "session_duration",
    "approval_required", "approval_groups", "isolation_required", "purpose_justification_required",
    "purpose_justification_prompt", "mfa_config", "connection_rules"];
  return { name: `Production policy ${policy.id}`, ...Object.fromEntries(fields
    .filter((key) => policy[key] !== undefined).map((key) => [key, policy[key]])) };
}

export async function ensurePreviewAccess(api, identity, productionProject, sourceAppId) {
  const apps = await listAccess(api, "/access/apps");
  const project = await api(`/pages/projects/${productionProject}`);
  const customDomains = (project.domains || []).filter((domain) => !domain.endsWith(".pages.dev"));
  const sources = apps.filter((app) => sourceAppId ? app.id === sourceAppId :
    app.type === "self_hosted" && domains(app).some((domain) => customDomains.includes(domain)));
  if (sources.length !== 1) {
    throw new Error("Cannot identify production's Access application. Set the CLOUDFLARE_ACCESS_SOURCE_APP_ID Actions variable.");
  }
  const source = await api(`/access/apps/${sources[0].id}`);
  const policies = (await listAccess(api, `/access/apps/${source.id}/policies`)).map(copyAccessPolicy);
  if (!policies.some((policy) => policy.decision === "allow")) throw new Error("Production Access has no login policy to copy.");
  let app = apps.find((entry) => entry.name === identity.name);
  if (app) assertOwnedAccess(app, identity);
  const settings = Object.fromEntries(["allowed_idps", "auto_redirect_to_identity", "session_duration",
    "enable_binding_cookie", "http_only_cookie_attribute", "same_site_cookie_attribute", "mfa_config",
    "allow_authenticate_via_warp"].filter((key) => source[key] !== undefined).map((key) => [key, source[key]]));
  const body = { ...settings, name: identity.name, type: "self_hosted", app_launcher_visible: false,
    domain: `${identity.name}.pages.dev`, destinations: [
      { type: "public", uri: `${identity.name}.pages.dev` },
      { type: "public", uri: `*.${identity.name}.pages.dev` },
    ] };
  // A new application denies requests until its policies have been installed.
  app = await api(app ? `/access/apps/${app.id}` : "/access/apps", { method: app ? "PUT" : "POST", body });
  assertOwnedAccess(app, identity);
  const existing = await listAccess(api, `/access/apps/${app.id}/policies`);
  for (const policy of policies) {
    const previous = existing.find((entry) => entry.name === policy.name);
    await api(`/access/apps/${app.id}/policies${previous ? `/${previous.id}` : ""}`, {
      method: previous ? "PUT" : "POST", body: policy,
    });
  }
  for (const policy of existing.filter((entry) => !policies.some((next) => next.name === entry.name))) {
    await api(`/access/apps/${app.id}/policies/${policy.id}`, { method: "DELETE" });
  }
  return app;
}

export async function destroyPreviewAccess(api, identity) {
  const app = (await listAccess(api, "/access/apps")).find((entry) => entry.name === identity.name);
  if (!app) return;
  assertOwnedAccess(app, identity);
  await api(`/access/apps/${app.id}`, { method: "DELETE" });
}

export async function verifyAccess(urls, fetchImpl = fetch, pause = (ms) => new Promise((done) => setTimeout(done, ms))) {
  for (const url of urls) {
    let protectedUrl = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      try {
        const response = await fetchImpl(`${url}/api/state`, { redirect: "manual", signal: AbortSignal.timeout(10000) });
        const location = new URL(response.headers.get("location") || "/", url);
        protectedUrl = [302, 303, 307].includes(response.status) && location.protocol === "https:" &&
          location.hostname.endsWith(".cloudflareaccess.com") && location.pathname.startsWith("/cdn-cgi/access/login");
        if (protectedUrl) break;
      } catch { /* New Pages hostnames can need time for DNS/TLS and Access propagation. */ }
      if (attempt < 29) await pause(10000);
    }
    if (!protectedUrl) throw new Error(`Access protection was not verified for ${url}; no production snapshot may be exposed.`);
  }
}
