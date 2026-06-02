import pkg from "../../package.json";
import { db } from "@/db";
import { sql } from "drizzle-orm";

type RecoveryRow = {
  inRecovery: boolean;
};

export type DbHealth = {
  ok: boolean;
  ms: number;
  role: "primary" | "standby" | "unknown";
  inRecovery: boolean | null;
  error?: string;
};

export function appHealth() {
  return {
    ok: true,
    serverId: process.env.SERVER_ID || process.env.PATRONI_NODE_NAME || "unknown",
    version: pkg.version,
    uptimeSec: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  };
}

export async function checkDbHealth(): Promise<DbHealth> {
  const start = Date.now();

  try {
    const rows = await db.execute<RecoveryRow>(
      sql`select pg_is_in_recovery() as "inRecovery"`
    );
    const inRecovery = Boolean(rows[0]?.inRecovery);

    return {
      ok: true,
      ms: Date.now() - start,
      role: inRecovery ? "standby" : "primary",
      inRecovery,
    };
  } catch (err) {
    return {
      ok: false,
      ms: Date.now() - start,
      role: "unknown",
      inRecovery: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
