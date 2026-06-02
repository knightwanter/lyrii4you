-- Add featured columns to posts
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "is_featured" boolean DEFAULT false;
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "featured_at" timestamp;
CREATE INDEX IF NOT EXISTS "posts_featured_idx" ON "posts" ("is_featured");

-- Daily writing prompts
CREATE TABLE IF NOT EXISTS "daily_prompts" (
  "id" serial PRIMARY KEY,
  "prompt" text NOT NULL,
  "theme" varchar(100),
  "active_date" timestamp NOT NULL,
  "is_active" boolean DEFAULT true,
  "response_count" integer DEFAULT 0,
  "created_by" integer REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "daily_prompts_date_unique_idx" ON "daily_prompts" ("active_date");
CREATE INDEX IF NOT EXISTS "daily_prompts_active_idx" ON "daily_prompts" ("is_active");

-- Prompt responses (links a post to a prompt)
CREATE TABLE IF NOT EXISTS "prompt_responses" (
  "id" serial PRIMARY KEY,
  "prompt_id" integer NOT NULL REFERENCES "daily_prompts"("id") ON DELETE CASCADE,
  "post_id" integer NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "prompt_response_user_unique_idx" ON "prompt_responses" ("prompt_id", "user_id");
CREATE INDEX IF NOT EXISTS "prompt_response_prompt_idx" ON "prompt_responses" ("prompt_id");
