-- Query performance indexes for pagination and inbox/feed patterns
CREATE INDEX IF NOT EXISTS "ratings_post_created_idx" ON "ratings" ("post_id", "created_at");

CREATE INDEX IF NOT EXISTS "conversations_user1_last_msg_idx" ON "conversations" ("user1_id", "last_message_at");
CREATE INDEX IF NOT EXISTS "conversations_user2_last_msg_idx" ON "conversations" ("user2_id", "last_message_at");

CREATE INDEX IF NOT EXISTS "crush_visible_created_idx" ON "secret_crush_stories" ("is_published", "is_archived", "created_at");
CREATE INDEX IF NOT EXISTS "crush_story_reaction_idx" ON "secret_crush_reactions" ("story_id", "reaction_type");

CREATE INDEX IF NOT EXISTS "bottle_recipient_inbox_idx" ON "bottle_recipients" ("receiver_id", "deleted_at", "received_at");

CREATE INDEX IF NOT EXISTS "verse_pending_queue_idx" ON "verse_exchanges" ("status", "second_author_id", "expires_at", "created_at");
CREATE INDEX IF NOT EXISTS "verse_first_author_created_idx" ON "verse_exchanges" ("first_author_id", "created_at");
CREATE INDEX IF NOT EXISTS "verse_second_author_created_idx" ON "verse_exchanges" ("second_author_id", "created_at");

CREATE INDEX IF NOT EXISTS "found_words_pool_created_idx" ON "found_word_submissions" ("pool_id", "created_at");
