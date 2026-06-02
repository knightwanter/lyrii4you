-- Denormalized counters: follower/following on users, rating stats on posts.
-- All maintained transactionally on the write path going forward.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "follower_count" integer NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "following_count" integer NOT NULL DEFAULT 0;

ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "rating_count" integer NOT NULL DEFAULT 0;
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "avg_rating" real NOT NULL DEFAULT 0;

-- Backfill from source-of-truth tables
UPDATE "users" u
SET "follower_count" = COALESCE((SELECT count(*) FROM "follows" WHERE "following_id" = u."id"), 0);

UPDATE "users" u
SET "following_count" = COALESCE((SELECT count(*) FROM "follows" WHERE "follower_id" = u."id"), 0);

UPDATE "posts" p
SET
  "rating_count" = COALESCE((SELECT count(*) FROM "ratings" WHERE "post_id" = p."id"), 0),
  "avg_rating"   = COALESCE((SELECT avg("rating")::real FROM "ratings" WHERE "post_id" = p."id"), 0);
