import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { serverEnv } from "@/env";

import * as schema from "./schema";

/**
 * En desarrollo, el hot reload reevalúa los módulos; guardamos el pool en `globalThis`
 * para no abrir conexiones nuevas en cada recarga.
 */
const globalForDb = globalThis as unknown as { pgPool?: Pool };

const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString: serverEnv().DATABASE_URL,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pgPool = pool;

export const db = drizzle(pool, { schema });
export type Database = typeof db;
export { schema };
