/**
 * Buffered view-count tracker.
 *
 * If Redis is available, view increments are written to Redis keys and
 * periodically flushed to Postgres in a single batched UPDATE. This removes
 * the per-read row contention on `posts.views` (and equivalents).
 *
 * If Redis is NOT available, falls through to a direct fire-and-forget
 * Postgres update — same behavior as the existing code.
 *
 * Flush is triggered lazily (on-demand) when a request happens after the
 * flush interval has elapsed. For a guaranteed cadence, hit
 * GET /api/cron/flush-views from a system cron every minute.
 */

import { db, schema } from "@/db";
import { sql, inArray } from "drizzle-orm";
import { getRedis } from "@/lib/redis";

const FLUSH_INTERVAL_MS = 60_000;
const KEY_PREFIX = "lyrii:views:post:";
const SET_KEY = "lyrii:views:dirty-posts";

let lastFlush = 0;
let flushInFlight: Promise<void> | null = null;

export async function bumpPostView(postId: number): Promise<void> {
  const redis = await getRedis();

  if (!redis.enabled) {
    // Fallback: direct DB write (existing behavior).
    void db
      .update(schema.posts)
      .set({ views: sql`${schema.posts.views} + 1` })
      .where(sql`${schema.posts.id} = ${postId}`)
      .catch((err) => console.error("View increment failed:", err));
    return;
  }

  // Buffered path: increment a per-post counter, register dirtiness.
  await redis.incr(`${KEY_PREFIX}${postId}`);
  await redis.set(`${SET_KEY}:${postId}`, "1", 24 * 60 * 60);

  // Opportunistic flush.
  if (Date.now() - lastFlush > FLUSH_INTERVAL_MS) {
    void flushPostViews();
  }
}

export async function flushPostViews(): Promise<{ flushed: number }> {
  if (flushInFlight) {
    await flushInFlight;
    return { flushed: 0 };
  }
  let resolveFlight!: () => void;
  flushInFlight = new Promise((r) => { resolveFlight = r; });
  try {
    lastFlush = Date.now();
    const redis = await getRedis();
    if (!redis.enabled) return { flushed: 0 };

    const dirtyKeys = await redis.keys(`${SET_KEY}:*`);
    if (dirtyKeys.length === 0) return { flushed: 0 };

    const updates: Array<{ id: number; delta: number }> = [];
    for (const dk of dirtyKeys) {
      const idStr = dk.slice((SET_KEY + ":").length);
      const id = Number(idStr);
      if (!Number.isFinite(id)) continue;
      const countStr = await redis.get(`${KEY_PREFIX}${id}`);
      const delta = Number(countStr) || 0;
      if (delta > 0) updates.push({ id, delta });
      await redis.del(`${KEY_PREFIX}${id}`);
      await redis.del(dk);
    }

    if (updates.length === 0) return { flushed: 0 };

    // Batched UPDATE … FROM (VALUES …) — one round trip.
    const valuesSql = sql.join(
      updates.map((u) => sql`(${u.id}::int, ${u.delta}::int)`),
      sql`, `
    );
    await db.execute(sql`
      UPDATE ${schema.posts} AS p
      SET views = COALESCE(p.views, 0) + v.delta
      FROM (VALUES ${valuesSql}) AS v(id, delta)
      WHERE p.id = v.id
    `);

    return { flushed: updates.length };
  } catch (err) {
    console.error("[view-buffer] flush failed:", err);
    return { flushed: 0 };
  } finally {
    resolveFlight();
    flushInFlight = null;
  }
}
