import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Pool construction does not open a connection — it defers until first query.
// We do NOT throw on missing DATABASE_URL here so that `next build` can bundle
// API route modules without live DB env vars. Runtime queries will fail clearly
// if DATABASE_URL is absent.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export type Database = typeof db;
