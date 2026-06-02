import { db, schema } from "@/db";
import { and, eq, sql } from "drizzle-orm";

/**
 * Milestone definitions. Each badge is keyed by a unique `name` so we can
 * detect "already awarded" by name alone (no schema migration required).
 */
type Milestone = {
  name: string;
  icon: string;
  description: string;
  type: "posts" | "followers" | "views";
  value: number;
  level: number;
};

const MILESTONES: Milestone[] = [
  { name: "First Steps",       icon: "🌱", description: "Published your first piece",        type: "posts",     value: 1,     level: 1 },
  { name: "Wordsmith",         icon: "✍️", description: "Published 5 pieces",                type: "posts",     value: 5,     level: 2 },
  { name: "Storyteller",       icon: "📖", description: "Published 25 pieces",               type: "posts",     value: 25,    level: 3 },
  { name: "Prolific Writer",   icon: "🏆", description: "Published 100 pieces",              type: "posts",     value: 100,   level: 4 },

  { name: "First Fan",         icon: "💛", description: "Earned your first follower",       type: "followers", value: 1,     level: 1 },
  { name: "Rising Voice",      icon: "📣", description: "Reached 10 followers",              type: "followers", value: 10,    level: 2 },
  { name: "Community Voice",   icon: "🌟", description: "Reached 50 followers",              type: "followers", value: 50,    level: 3 },
  { name: "Beloved",           icon: "💖", description: "Reached 250 followers",             type: "followers", value: 250,   level: 4 },

  { name: "Read",              icon: "👁",  description: "Your work has been read 100 times",   type: "views",     value: 100,   level: 1 },
  { name: "Read Widely",       icon: "🔭", description: "Your work has been read 1,000 times", type: "views",     value: 1_000, level: 2 },
  { name: "Read Far",          icon: "🌍", description: "Your work has been read 10,000 times", type: "views",    value: 10_000, level: 3 },
];

/**
 * Check the user's current stats and insert any newly-earned badges.
 * Idempotent: badges already in the DB for this user (matched by badgeName)
 * are skipped. Safe to call after any milestone-relevant action.
 */
export async function checkAndAwardBadges(userId: number): Promise<void> {
  try {
    const [statsRow] = await db
      .select({
        posts: sql<number>`(select count(*)::int from ${schema.posts} where ${schema.posts.authorId} = ${userId} and ${schema.posts.isPublished} = true)`,
        followers: schema.users.followerCount,
        views: sql<number>`(select coalesce(sum(${schema.posts.views}),0)::int from ${schema.posts} where ${schema.posts.authorId} = ${userId} and ${schema.posts.isPublished} = true)`,
      })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!statsRow) return;

    const counts = {
      posts: statsRow.posts ?? 0,
      followers: statsRow.followers ?? 0,
      views: statsRow.views ?? 0,
    };

    const earned = MILESTONES.filter((m) => counts[m.type] >= m.value);
    if (earned.length === 0) return;

    const existing = await db
      .select({ name: schema.authorBadges.badgeName })
      .from(schema.authorBadges)
      .where(eq(schema.authorBadges.userId, userId));
    const have = new Set(existing.map((r) => r.name));

    const toInsert = earned
      .filter((m) => !have.has(m.name))
      .map((m) => ({
        userId,
        badgeName: m.name,
        badgeIcon: m.icon,
        level: m.level,
        description: m.description,
        milestoneType: m.type,
        milestoneValue: m.value,
      }));

    if (toInsert.length === 0) return;

    await db.insert(schema.authorBadges).values(toInsert);
  } catch (err) {
    // Never let badge bookkeeping break the parent request.
    console.error("checkAndAwardBadges failed:", err);
  }
}
