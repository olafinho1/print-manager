import { appendFile, chmod, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureSchema, readState, buildStateResponse } from "../functions/api/_lib/store.js";

export const SNAPSHOT_TABLE = "preview_production_snapshot";

export async function snapshotStatus(api, databaseId, sourceId) {
  const query = (sql) => api(`/d1/database/${databaseId}/query`, { method: "POST", body: { sql } });
  const tables = (await query("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'"))[0].results;
  if (!tables.some((table) => table.name === SNAPSHOT_TABLE)) return { snapshot: null, dirty: tables.length > 0 };
  const snapshot = (await query(`SELECT source_database_id, copied_at FROM ${SNAPSHOT_TABLE} WHERE id = 1`))[0].results[0];
  if (!snapshot) return { snapshot: null, dirty: true };
  if (snapshot.source_database_id !== sourceId) throw new Error("The preview snapshot belongs to a different production database.");
  return { snapshot, dirty: false };
}

export async function cloneProductionDatabase({ sourceId, database, identity, protectedIds, compatibilityDate,
  targetConfig, runWrangler, assertPreviewDatabase, now = () => new Date().toISOString() }) {
  assertPreviewDatabase(database, identity, protectedIds);
  if (!/^[a-f\d-]{36}$/i.test(sourceId) || !protectedIds.includes(sourceId)) {
    throw new Error("The snapshot source must be the configured production database.");
  }
  const temporary = await mkdtemp(join(tmpdir(), "print-manager-snapshot-"));
  const copiedAt = now();
  try {
    const sourceConfig = join(temporary, "source.json");
    const dump = join(temporary, "snapshot.sql");
    await writeFile(sourceConfig, JSON.stringify({ compatibility_date: compatibilityDate,
      d1_databases: [{ binding: "SOURCE", database_name: "production-source", database_id: sourceId }] }), { mode: 0o600 });
    // Export is the only command ever run against the production configuration.
    // SQL and Wrangler diagnostics can contain private rows, so both commands run quietly.
    await runWrangler(["d1", "export", "SOURCE", "--remote", "--config", sourceConfig, "--output", dump], { quiet: true });
    await chmod(dump, 0o600);
    await appendFile(dump, `\nCREATE TABLE ${SNAPSHOT_TABLE} (id INTEGER PRIMARY KEY CHECK (id = 1), source_database_id TEXT NOT NULL, copied_at TEXT NOT NULL);\n` +
      `INSERT INTO ${SNAPSHOT_TABLE} VALUES (1, '${sourceId}', '${copiedAt}');\n`);
    await runWrangler(["d1", "execute", identity.name, "--remote", "--config", targetConfig, "--file", dump, "--yes"], { quiet: true });
    return { source_database_id: sourceId, copied_at: copiedAt };
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

// Exercise the actual read model against the isolated D1 without bypassing Access
// or logging production rows. Runtime additive compatibility matches GET /api/state.
export async function verifySnapshotState(api, database, identity, protectedIds, assertPreviewDatabase, vars) {
  assertPreviewDatabase(database, identity, protectedIds);
  const query = async (sql, params = []) => (await api(`/d1/database/${database.uuid}/query`, {
    method: "POST", body: { sql, params },
  }))[0];
  const statement = (sql, params = []) => ({
    bind: (...values) => statement(sql, values), all: () => query(sql, params),
    first: async () => (await query(sql, params)).results[0] || null,
  });
  const db = { exec: (sql) => query(sql), prepare: statement,
    batch: (statements) => Promise.all(statements.map((entry) => entry.all())) };
  await ensureSchema(db);
  const result = buildStateResponse({ request: new Request(`https://${identity.name}.pages.dev/api/state`), env: vars }, await readState(db));
  if (result.meta.app.environment !== "preview" || !result.meta.auth ||
      !Array.isArray(result.parts) || !Array.isArray(result.filaments) || !Array.isArray(result.salesOrders)) {
    throw new Error("The migrated snapshot did not produce valid application state.");
  }
}
