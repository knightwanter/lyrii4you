import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is required. Refusing to start without an explicit database connection string."
  );
}

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const poolMax = Number(process.env.DATABASE_POOL_MAX ?? (process.env.NODE_ENV === "production" ? 5 : 10));

const client = globalForDb.conn ?? postgres(connectionString, {
  max: Number.isFinite(poolMax) && poolMax > 0 ? poolMax : 5,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
});

globalForDb.conn = client;

export const db = drizzle(client, { schema });
export { schema };
