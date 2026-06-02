-- Add ban fields to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_banned" boolean DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "banned_at" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "ban_reason" text;

-- Reports
DO $$ BEGIN
  CREATE TYPE "report_status" AS ENUM ('pending', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "reports" (
  "id" serial PRIMARY KEY,
  "post_id" integer NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "reporter_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "reason" varchar(100) NOT NULL,
  "details" text,
  "status" "report_status" DEFAULT 'pending',
  "created_at" timestamp DEFAULT now(),
  "resolved_at" timestamp,
  "resolved_by" integer REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "reports_post_reporter_unique_idx" ON "reports" ("post_id", "reporter_id");
CREATE INDEX IF NOT EXISTS "reports_status_idx" ON "reports" ("status");
CREATE INDEX IF NOT EXISTS "reports_post_idx" ON "reports" ("post_id");
