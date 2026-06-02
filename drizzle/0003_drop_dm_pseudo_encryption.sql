-- Direct messages were never end-to-end encrypted; the `encrypted_key` and
-- `iv` columns implied a guarantee that was never delivered. Dropping them
-- so the schema reflects reality (server-side at-rest storage only).

ALTER TABLE "direct_messages" DROP COLUMN IF EXISTS "encrypted_key";
ALTER TABLE "direct_messages" DROP COLUMN IF EXISTS "iv";
