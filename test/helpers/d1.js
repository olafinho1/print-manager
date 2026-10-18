import { DatabaseSync } from "node:sqlite";

// Runs the real SQL with SQLite foreign keys and atomic batches, like D1.
export class TestD1 {
  constructor() {
    this.sqlite = new DatabaseSync(":memory:");
    this.sqlite.exec("PRAGMA foreign_keys = ON");
  }
  async exec(sql) {
    // D1 exec treats individual nonempty lines as statements.
    for (const line of sql.split("\n").filter((line) => line.trim())) this.sqlite.exec(line);
  }
  prepare(sql) { return new TestStatement(this, sql); }
  async batch(statements) {
    if (this.beforeMutationBatch && statements.some((statement) => statement.sql.includes("INSERT INTO mutation_receipts"))) {
      const hook = this.beforeMutationBatch;
      this.beforeMutationBatch = null;
      await hook();
    }
    this.sqlite.exec("BEGIN");
    try {
      const results = statements.map((statement) => statement.execute());
      this.sqlite.exec("COMMIT");
      return results;
    } catch (error) {
      this.sqlite.exec("ROLLBACK");
      throw error;
    }
  }
  close() { this.sqlite.close(); }
}

class TestStatement {
  constructor(db, sql, args = []) { Object.assign(this, { db, sql, args }); }
  bind(...args) { return new TestStatement(this.db, this.sql, args); }
  execute() {
    const statement = this.db.sqlite.prepare(this.sql);
    if (statement.columns().length) return { results: statement.all(...this.args), success: true };
    const result = statement.run(...this.args);
    return { results: [], success: true, meta: { changes: result.changes } };
  }
  async all() { return this.execute(); }
  async first() { return this.execute().results[0] || null; }
  async run() { return this.execute(); }
}
