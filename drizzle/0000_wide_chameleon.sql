CREATE TYPE "public"."crush_reaction" AS ENUM('love', 'relate', 'curious');--> statement-breakpoint
CREATE TYPE "public"."memory_type" AS ENUM('best_line', 'best_moment', 'achievement', 'milestone');--> statement-breakpoint
CREATE TYPE "public"."mood_tag" AS ENUM('melancholy', 'joy', 'longing', 'rage', 'serenity', 'love', 'nostalgia', 'hope', 'grief', 'wonder');--> statement-breakpoint
CREATE TYPE "public"."post_type" AS ENUM('poem', 'story', 'micro_tale');--> statement-breakpoint
CREATE TYPE "public"."read_source" AS ENUM('feed', 'profile', 'direct', 'search', 'bottle');--> statement-breakpoint
CREATE TYPE "public"."verse_exchange_status" AS ENUM('waiting', 'completed', 'expired');--> statement-breakpoint
CREATE TABLE "author_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"badge_name" varchar(100) NOT NULL,
	"badge_icon" varchar(10),
	"level" integer DEFAULT 1,
	"description" text,
	"milestone_type" varchar(50),
	"milestone_value" integer,
	"achieved_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bottle_recipients" (
	"id" serial PRIMARY KEY NOT NULL,
	"bottle_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"received_at" timestamp DEFAULT now(),
	"viewed_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "bottles" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer NOT NULL,
	"message" text NOT NULL,
	"word_count" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaborators" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"can_edit" boolean DEFAULT true,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collection_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"collection_id" integer NOT NULL,
	"post_id" integer NOT NULL,
	"position" integer DEFAULT 0,
	"added_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"cover_gradient" varchar(100),
	"is_public" boolean DEFAULT true,
	"view_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contributions" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content_before" text,
	"content_after" text,
	"char_added" integer DEFAULT 0,
	"char_removed" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user1_id" integer NOT NULL,
	"user2_id" integer NOT NULL,
	"last_message_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_word_pools" (
	"id" serial PRIMARY KEY NOT NULL,
	"words" json NOT NULL,
	"date" timestamp NOT NULL,
	"participant_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "direct_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"encrypted_content" text NOT NULL,
	"encrypted_key" text,
	"iv" text,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"follower_id" integer NOT NULL,
	"following_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "found_word_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"pool_id" integer NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"used_words" json NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hourly_post_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"view_hour" integer NOT NULL,
	"view_day" integer NOT NULL,
	"view_date" timestamp NOT NULL,
	"view_count" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "journals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(300) NOT NULL,
	"content" text NOT NULL,
	"is_time_capsule" boolean DEFAULT false,
	"publish_at" timestamp,
	"word_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "memory_wall" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"post_id" integer,
	"title" varchar(200),
	"content" text,
	"memory_type" "memory_type" NOT NULL,
	"pinned" boolean DEFAULT false,
	"stats_snapshot" json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"related_post_id" integer,
	"related_user_id" integer,
	"read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pending_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"verification_otp" varchar(6),
	"otp_expires_at" timestamp,
	"otp_attempts" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "post_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"description" text,
	"position" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "post_reads" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer,
	"duration_seconds" integer,
	"scroll_depth" real,
	"source" "read_source",
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"title" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"type" "post_type" DEFAULT 'poem' NOT NULL,
	"mood" "mood_tag",
	"views" integer DEFAULT 0,
	"is_published" boolean DEFAULT false,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "secret_crush_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"story_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"reaction_type" "crush_reaction" NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "secret_crush_stories" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"content" text NOT NULL,
	"is_published" boolean DEFAULT true,
	"views" integer DEFAULT 0,
	"is_archived" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "unsent_message_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "unsent_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"content" text NOT NULL,
	"recipient_name" varchar(200),
	"is_anonymous" boolean DEFAULT true,
	"views" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"ghost_mode" boolean DEFAULT false,
	"show_activity" boolean DEFAULT true,
	"email_notifications" boolean DEFAULT true,
	"follow_notifications" boolean DEFAULT true,
	"rating_notifications" boolean DEFAULT true,
	"message_notifications" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"bio" text,
	"profile_pic" text,
	"is_verified" boolean DEFAULT false,
	"is_admin" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"email_verified" boolean DEFAULT false,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verse_exchanges" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_author_id" integer NOT NULL,
	"second_author_id" integer,
	"first_stanza" text NOT NULL,
	"second_stanza" text,
	"status" "verse_exchange_status" DEFAULT 'waiting',
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "whispers" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"content" varchar(280) NOT NULL,
	"echo_count" integer DEFAULT 0,
	"like_count" integer DEFAULT 0,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "writer_dna_cache" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"vocab_richness" real,
	"avg_sentence_length" real,
	"avg_word_length" real,
	"top_words" json,
	"tone_distribution" json,
	"total_word_count" integer,
	"posts_analyzed" integer,
	"computed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "writing_activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"word_count" integer DEFAULT 0,
	"posts_published" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "author_badges" ADD CONSTRAINT "author_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bottle_recipients" ADD CONSTRAINT "bottle_recipients_bottle_id_bottles_id_fk" FOREIGN KEY ("bottle_id") REFERENCES "public"."bottles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bottle_recipients" ADD CONSTRAINT "bottle_recipients_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bottles" ADD CONSTRAINT "bottles_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_posts" ADD CONSTRAINT "collection_posts_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_posts" ADD CONSTRAINT "collection_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user1_id_users_id_fk" FOREIGN KEY ("user1_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user2_id_users_id_fk" FOREIGN KEY ("user2_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "found_word_submissions" ADD CONSTRAINT "found_word_submissions_pool_id_daily_word_pools_id_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."daily_word_pools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "found_word_submissions" ADD CONSTRAINT "found_word_submissions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "found_word_submissions" ADD CONSTRAINT "found_word_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hourly_post_views" ADD CONSTRAINT "hourly_post_views_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hourly_post_views" ADD CONSTRAINT "hourly_post_views_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journals" ADD CONSTRAINT "journals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_wall" ADD CONSTRAINT "memory_wall_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_wall" ADD CONSTRAINT "memory_wall_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_images" ADD CONSTRAINT "post_images_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reads" ADD CONSTRAINT "post_reads_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reads" ADD CONSTRAINT "post_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_crush_reactions" ADD CONSTRAINT "secret_crush_reactions_story_id_secret_crush_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."secret_crush_stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_crush_reactions" ADD CONSTRAINT "secret_crush_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_crush_stories" ADD CONSTRAINT "secret_crush_stories_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unsent_message_reactions" ADD CONSTRAINT "unsent_message_reactions_message_id_unsent_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."unsent_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unsent_message_reactions" ADD CONSTRAINT "unsent_message_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unsent_messages" ADD CONSTRAINT "unsent_messages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verse_exchanges" ADD CONSTRAINT "verse_exchanges_first_author_id_users_id_fk" FOREIGN KEY ("first_author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verse_exchanges" ADD CONSTRAINT "verse_exchanges_second_author_id_users_id_fk" FOREIGN KEY ("second_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whispers" ADD CONSTRAINT "whispers_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "writer_dna_cache" ADD CONSTRAINT "writer_dna_cache_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "writing_activity" ADD CONSTRAINT "writing_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "badges_user_idx" ON "author_badges" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bottle_recipient_unique_idx" ON "bottle_recipients" USING btree ("bottle_id","receiver_id");--> statement-breakpoint
CREATE INDEX "bottles_sender_idx" ON "bottles" USING btree ("sender_id");--> statement-breakpoint
CREATE UNIQUE INDEX "collaborators_unique_idx" ON "collaborators" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "collection_post_unique_idx" ON "collection_posts" USING btree ("collection_id","post_id");--> statement-breakpoint
CREATE INDEX "collections_author_idx" ON "collections" USING btree ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_unique_idx" ON "conversations" USING btree ("user1_id","user2_id");--> statement-breakpoint
CREATE INDEX "conversations_user1_idx" ON "conversations" USING btree ("user1_id");--> statement-breakpoint
CREATE INDEX "conversations_user2_idx" ON "conversations" USING btree ("user2_id");--> statement-breakpoint
CREATE UNIQUE INDEX "word_pool_date_unique_idx" ON "daily_word_pools" USING btree ("date");--> statement-breakpoint
CREATE INDEX "dm_sender_idx" ON "direct_messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "dm_receiver_idx" ON "direct_messages" USING btree ("receiver_id");--> statement-breakpoint
CREATE INDEX "dm_receiver_read_idx" ON "direct_messages" USING btree ("receiver_id","read_at");--> statement-breakpoint
CREATE INDEX "dm_sender_receiver_created_idx" ON "direct_messages" USING btree ("sender_id","receiver_id","created_at");--> statement-breakpoint
CREATE INDEX "dm_receiver_sender_created_idx" ON "direct_messages" USING btree ("receiver_id","sender_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "follows_unique_idx" ON "follows" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE INDEX "follows_following_created_idx" ON "follows" USING btree ("following_id","created_at");--> statement-breakpoint
CREATE INDEX "follows_follower_idx" ON "follows" USING btree ("follower_id");--> statement-breakpoint
CREATE UNIQUE INDEX "found_words_user_pool_unique_idx" ON "found_word_submissions" USING btree ("pool_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hourly_views_unique_idx" ON "hourly_post_views" USING btree ("post_id","view_hour","view_date");--> statement-breakpoint
CREATE INDEX "hourly_views_author_idx" ON "hourly_post_views" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "journals_user_idx" ON "journals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "memory_user_idx" ON "memory_wall" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "memory_user_post_idx" ON "memory_wall" USING btree ("user_id","post_id");--> statement-breakpoint
CREATE INDEX "notif_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notif_user_read_created_idx" ON "notifications" USING btree ("user_id","read","created_at");--> statement-breakpoint
CREATE INDEX "reads_post_idx" ON "post_reads" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "reads_user_idx" ON "post_reads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "posts_author_published_idx" ON "posts" USING btree ("author_id","is_published");--> statement-breakpoint
CREATE INDEX "posts_type_idx" ON "posts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "posts_published_idx" ON "posts" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "posts_published_at_idx" ON "posts" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "posts_views_idx" ON "posts" USING btree ("views");--> statement-breakpoint
CREATE UNIQUE INDEX "ratings_unique_idx" ON "ratings" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE INDEX "ratings_post_idx" ON "ratings" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "ratings_created_idx" ON "ratings" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "crush_reaction_unique_idx" ON "secret_crush_reactions" USING btree ("story_id","user_id");--> statement-breakpoint
CREATE INDEX "crush_author_idx" ON "secret_crush_stories" USING btree ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unsent_reaction_unique_idx" ON "unsent_message_reactions" USING btree ("message_id","user_id");--> statement-breakpoint
CREATE INDEX "unsent_author_idx" ON "unsent_messages" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "verse_first_author_idx" ON "verse_exchanges" USING btree ("first_author_id");--> statement-breakpoint
CREATE INDEX "verse_status_idx" ON "verse_exchanges" USING btree ("status");--> statement-breakpoint
CREATE INDEX "whispers_author_idx" ON "whispers" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "whispers_expires_idx" ON "whispers" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "whispers_expires_created_idx" ON "whispers" USING btree ("expires_at","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "activity_user_date_unique_idx" ON "writing_activity" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "activity_user_date_idx" ON "writing_activity" USING btree ("user_id","date");