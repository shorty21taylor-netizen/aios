/**
 * Auto-migration runner executed before `next start` on Railway.
 *
 * Reads every .sql file under src/db/migrations in lexicographic order and
 * applies it to the database referenced by DATABASE_URL. The SQL files are
 * authored by drizzle-kit and separated by `--> statement-breakpoint` markers.
 *
 * Idempotent: migrations use `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF
 * NOT EXISTS`. Any duplicate-object errors that leak through are swallowed so
 * re-running this script is safe.
 *
 * If DATABASE_URL is absent, the script exits 0 without touching anything so
 * preview builds and local `npm start` without a DB still boot.
 */
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const MIGRATIONS_DIR = path.join(__dirname, "..", "src", "db", "migrations");

// Postgres error codes that mean "object already exists" — safe to ignore.
const SAFE_SKIP_CODES = new Set([
  "42P07", // duplicate_table
  "42P06", // duplicate_schema
  "42710", // duplicate_object (index, constraint, etc.)
  "42701", // duplicate_column
]);

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log(
      "[migrate] DATABASE_URL not set — skipping migrations (app will still start)"
    );
    return;
  }

  const pool = new Pool({ connectionString });
  try {
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();
    console.log(`[migrate] Running ${files.length} migration file(s)`);

    for (const file of files) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      const statements = sql
        .split(/-->\s*statement-breakpoint/g)
        .map((s) => s.trim())
        .filter(Boolean);
      console.log(`[migrate] ${file} — ${statements.length} statement(s)`);

      for (const stmt of statements) {
        try {
          await pool.query(stmt);
        } catch (err) {
          if (SAFE_SKIP_CODES.has(err.code)) {
            console.log(
              `[migrate]   already exists, skipping (${err.code}): ${(err.message || "").slice(0, 120)}`
            );
            continue;
          }
          console.error(`[migrate]   ERROR in ${file}: ${err.message}`);
          throw err;
        }
      }
    }

    console.log("[migrate] All migrations applied successfully");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[migrate] FATAL:", err);
  process.exit(1);
});
