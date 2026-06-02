import {
  pgTable, serial, varchar, text, integer, boolean, timestamp,
  pgEnum, real, json, uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ============================================
// Enums
// ============================================

export const postTypeEnum = pgEnum("post_type", ["poem", "story", "micro_tale"]);
export const moodEnum = pgEnum("mood_tag", [
  "melancholy", "joy", "longing", "rage", "serenity",
  "love", "nostalgia", "hope", "grief", "wonder",
]);
export const memoryTypeEnum = pgEnum("memory_type", ["best_line", "best_moment", "achievement", "milestone"]);
export const crushReactionEnum = pgEnum("crush_reaction", ["love", "relate", "curious"]);
export const readSourceEnum = pgEnum("read_source", ["feed", "profile", "direct", "search", "bottle"]);

// ============================================
// Users
// ============================================

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  bio: text("bio"),
  profilePic: text("profile_pic"),
  isVerified: boolean("is_verified").default(false),
  isAdmin: boolean("is_admin").default(false),
  isFeatured: boolean("is_featured").default(false),
  emailVerified: boolean("email_verified").default(false),
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: timestamp("deleted_at"),
  isBanned: boolean("is_banned").default(false),
  bannedAt: timestamp("banned_at"),
  banReason: text("ban_reason"),
  // Denormalized counters — maintained transactionally on the write path.
  followerCount: integer("follower_count").default(0).notNull(),
  followingCount: integer("following_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pendingRegistrations = pgTable("pending_registrations", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  verificationOtp: varchar("verification_otp", { length: 6 }),
  otpExpiresAt: timestamp("otp_expires_at"),
  otpAttempts: integer("otp_attempts").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// Posts
// ============================================

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  type: postTypeEnum("type").notNull().default("poem"),
  mood: moodEnum("mood"),
  views: integer("views").default(0),
  // Denormalized rating stats — maintained on the write path in /api/posts/[id]/ratings.
  ratingCount: integer("rating_count").default(0).notNull(),
  avgRating: real("avg_rating").default(0).notNull(),
  isPublished: boolean("is_published").default(false),
  isFeatured: boolean("is_featured").default(false),
  featuredAt: timestamp("featured_at"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("posts_author_idx").on(table.authorId),
  index("posts_author_published_idx").on(table.authorId, table.isPublished),
  index("posts_type_idx").on(table.type),
  index("posts_published_idx").on(table.isPublished),
  index("posts_featured_idx").on(table.isFeatured),
  // Feed sort: WHERE is_published=true ORDER BY published_at DESC
  index("posts_published_at_idx").on(table.publishedAt),
  // Trending sort: WHERE is_published=true ORDER BY views DESC
  index("posts_views_idx").on(table.views),
  // Trigram index for LIKE '%search%' on title (requires pg_trgm extension).
  // See drizzle/pg_trgm.sql for the one-time setup migration.
  index("posts_title_trgm_idx")
    .using("gin", sql`${table.title} gin_trgm_ops`),
]);

export const postImages = pgTable("post_images", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  position: integer("position").default(0),
});

// ============================================
// Ratings & Reviews
// ============================================

export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("ratings_unique_idx").on(table.postId, table.userId),
  // Analytics "recent likes": ORDER BY created_at DESC filtered by post.author
  index("ratings_post_idx").on(table.postId),
  index("ratings_created_idx").on(table.createdAt),
  // Post detail ratings feed: WHERE post_id = ? ORDER BY created_at DESC
  index("ratings_post_created_idx").on(table.postId, table.createdAt),
]);

// ============================================
// Social
// ============================================

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  followingId: integer("following_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("follows_unique_idx").on(table.followerId, table.followingId),
  // Profile "followers count" + "new followers this month"
  index("follows_following_created_idx").on(table.followingId, table.createdAt),
  index("follows_follower_idx").on(table.followerId),
]);

// ============================================
// Messaging
// ============================================

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  user1Id: integer("user1_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  user2Id: integer("user2_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
}, (table) => [
  uniqueIndex("conversations_unique_idx").on(table.user1Id, table.user2Id),
  index("conversations_user1_idx").on(table.user1Id),
  index("conversations_user2_idx").on(table.user2Id),
  // Conversation list query: WHERE user*_id = ? ORDER BY last_message_at DESC
  index("conversations_user1_last_msg_idx").on(table.user1Id, table.lastMessageAt),
  index("conversations_user2_last_msg_idx").on(table.user2Id, table.lastMessageAt),
]);

export const directMessages = pgTable("direct_messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  receiverId: integer("receiver_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  // Stored at-rest in Postgres. Not end-to-end encrypted — see drizzle/0003 migration notes.
  // Column name retained as `encrypted_content` to avoid a destructive rename;
  // a future migration can rename to `content` once write paths are updated.
  encryptedContent: text("encrypted_content").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("dm_sender_idx").on(table.senderId),
  index("dm_receiver_idx").on(table.receiverId),
  index("dm_receiver_read_idx").on(table.receiverId, table.readAt),
  // Conversation list DISTINCT ON query
  index("dm_sender_receiver_created_idx").on(table.senderId, table.receiverId, table.createdAt),
  index("dm_receiver_sender_created_idx").on(table.receiverId, table.senderId, table.createdAt),
]);

// ============================================
// Notifications
// ============================================

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  message: text("message").notNull(),
  relatedPostId: integer("related_post_id"),
  relatedUserId: integer("related_user_id"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("notif_user_idx").on(table.userId),
  index("notif_user_read_created_idx").on(table.userId, table.read, table.createdAt),
]);

// ============================================
// Collaboration
// ============================================

export const collaborators = pgTable("collaborators", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  canEdit: boolean("can_edit").default(true),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => [
  uniqueIndex("collaborators_unique_idx").on(table.postId, table.userId),
]);

export const contributions = pgTable("contributions", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  contentBefore: text("content_before"),
  contentAfter: text("content_after"),
  charAdded: integer("char_added").default(0),
  charRemoved: integer("char_removed").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// Author Badges
// ============================================

export const authorBadges = pgTable("author_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  badgeName: varchar("badge_name", { length: 100 }).notNull(),
  badgeIcon: varchar("badge_icon", { length: 10 }),
  level: integer("level").default(1),
  description: text("description"),
  milestoneType: varchar("milestone_type", { length: 50 }),
  milestoneValue: integer("milestone_value"),
  achievedAt: timestamp("achieved_at").defaultNow(),
}, (table) => [
  index("badges_user_idx").on(table.userId),
]);

// ============================================
// Memory Wall
// ============================================

export const memoryWall = pgTable("memory_wall", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  postId: integer("post_id").references(() => posts.id, { onDelete: "set null" }),
  title: varchar("title", { length: 200 }),
  content: text("content"),
  memoryType: memoryTypeEnum("memory_type").notNull(),
  pinned: boolean("pinned").default(false),
  statsSnapshot: json("stats_snapshot"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("memory_user_idx").on(table.userId),
  // Bookmark lookups: (user_id, content='__bookmark__', post_id)
  index("memory_user_post_idx").on(table.userId, table.postId),
]);

// ============================================
// Unique Features
// ============================================

// Secret Crush Stories
export const secretCrushStories = pgTable("secret_crush_stories", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  isPublished: boolean("is_published").default(true),
  views: integer("views").default(0),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("crush_author_idx").on(table.authorId),
  // Secret Crush feed: WHERE is_published=true AND is_archived=false ORDER BY created_at DESC
  index("crush_visible_created_idx").on(table.isPublished, table.isArchived, table.createdAt),
]);

export const secretCrushReactions = pgTable("secret_crush_reactions", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => secretCrushStories.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  reactionType: crushReactionEnum("reaction_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("crush_reaction_unique_idx").on(table.storyId, table.userId),
  // Story reactions aggregation: GROUP BY story_id, reaction_type
  index("crush_story_reaction_idx").on(table.storyId, table.reactionType),
]);

// Bottles
export const bottles = pgTable("bottles", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  message: text("message").notNull(),
  wordCount: integer("word_count").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("bottles_sender_idx").on(table.senderId),
]);

export const bottleRecipients = pgTable("bottle_recipients", {
  id: serial("id").primaryKey(),
  bottleId: integer("bottle_id").references(() => bottles.id, { onDelete: "cascade" }).notNull(),
  receiverId: integer("receiver_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  receivedAt: timestamp("received_at").defaultNow(),
  viewedAt: timestamp("viewed_at"),
  deletedAt: timestamp("deleted_at"),
}, (table) => [
  uniqueIndex("bottle_recipient_unique_idx").on(table.bottleId, table.receiverId),
  // Inbox query: WHERE receiver_id = ? AND deleted_at IS NULL ORDER BY received_at DESC
  index("bottle_recipient_inbox_idx").on(table.receiverId, table.deletedAt, table.receivedAt),
]);

// Unsent Messages
export const unsentMessages = pgTable("unsent_messages", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  recipientName: varchar("recipient_name", { length: 200 }),
  isAnonymous: boolean("is_anonymous").default(true),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("unsent_author_idx").on(table.authorId),
]);

// Whisper Threads (ephemeral 24h posts)
export const whispers = pgTable("whispers", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: varchar("content", { length: 280 }).notNull(),
  echoCount: integer("echo_count").default(0),
  likeCount: integer("like_count").default(0),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("whispers_author_idx").on(table.authorId),
  index("whispers_expires_idx").on(table.expiresAt),
  // Feed: WHERE expires_at > now() ORDER BY created_at DESC
  index("whispers_expires_created_idx").on(table.expiresAt, table.createdAt),
]);

// ============================================
// Analytics Tables
// ============================================

// Detailed reading tracking
export const postReads = pgTable("post_reads", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  durationSeconds: integer("duration_seconds"),
  scrollDepth: real("scroll_depth"), // 0.0 to 1.0
  source: readSourceEnum("source"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("reads_post_idx").on(table.postId),
  index("reads_user_idx").on(table.userId),
]);

// Hourly aggregated view data for peak hours
export const hourlyPostViews = pgTable("hourly_post_views", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  authorId: integer("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  viewHour: integer("view_hour").notNull(), // 0-23
  viewDay: integer("view_day").notNull(), // 0-6 (Mon-Sun)
  viewDate: timestamp("view_date").notNull(),
  viewCount: integer("view_count").default(1),
}, (table) => [
  uniqueIndex("hourly_views_unique_idx").on(table.postId, table.viewHour, table.viewDate),
  index("hourly_views_author_idx").on(table.authorId),
]);

// Writer DNA cache (computed daily)
export const writerDnaCache = pgTable("writer_dna_cache", {
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).primaryKey(),
  vocabRichness: real("vocab_richness"),
  avgSentenceLength: real("avg_sentence_length"),
  avgWordLength: real("avg_word_length"),
  topWords: json("top_words"),
  toneDistribution: json("tone_distribution"),
  totalWordCount: integer("total_word_count"),
  postsAnalyzed: integer("posts_analyzed"),
  computedAt: timestamp("computed_at").defaultNow(),
});

// Writing activity (for heatmap)
export const writingActivity = pgTable("writing_activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  date: timestamp("date").notNull(),
  wordCount: integer("word_count").default(0),
  postsPublished: integer("posts_published").default(0),
}, (table) => [
  uniqueIndex("activity_user_date_unique_idx").on(table.userId, table.date),
  index("activity_user_date_idx").on(table.userId, table.date),
]);

// ============================================
// Verse Exchange
// ============================================

export const verseExchangeStatusEnum = pgEnum("verse_exchange_status", ["waiting", "completed", "expired"]);

export const verseExchanges = pgTable("verse_exchanges", {
  id: serial("id").primaryKey(),
  firstAuthorId: integer("first_author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  secondAuthorId: integer("second_author_id").references(() => users.id, { onDelete: "set null" }),
  firstStanza: text("first_stanza").notNull(),
  secondStanza: text("second_stanza"),
  status: verseExchangeStatusEnum("status").default("waiting"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("verse_first_author_idx").on(table.firstAuthorId),
  index("verse_status_idx").on(table.status),
  // Pending queue query: status + second_author_id + expiry + created ordering
  index("verse_pending_queue_idx").on(table.status, table.secondAuthorId, table.expiresAt, table.createdAt),
  // Personal history queries: first_author_id OR second_author_id, ordered by created_at
  index("verse_first_author_created_idx").on(table.firstAuthorId, table.createdAt),
  index("verse_second_author_created_idx").on(table.secondAuthorId, table.createdAt),
]);

// ============================================
// Collections / Anthologies
// ============================================

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  coverGradient: varchar("cover_gradient", { length: 100 }),
  isPublic: boolean("is_public").default(true),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("collections_author_idx").on(table.authorId),
]);

export const collectionPosts = pgTable("collection_posts", {
  id: serial("id").primaryKey(),
  collectionId: integer("collection_id").references(() => collections.id, { onDelete: "cascade" }).notNull(),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  position: integer("position").default(0),
  addedAt: timestamp("added_at").defaultNow(),
}, (table) => [
  uniqueIndex("collection_post_unique_idx").on(table.collectionId, table.postId),
]);

// ============================================
// Found Words (Daily Challenge)
// ============================================

export const dailyWordPools = pgTable("daily_word_pools", {
  id: serial("id").primaryKey(),
  words: json("words").notNull(), // string[]
  date: timestamp("date").notNull(),
  participantCount: integer("participant_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("word_pool_date_unique_idx").on(table.date),
]);

export const foundWordSubmissions = pgTable("found_word_submissions", {
  id: serial("id").primaryKey(),
  poolId: integer("pool_id").references(() => dailyWordPools.id, { onDelete: "cascade" }).notNull(),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  usedWords: json("used_words").notNull(), // string[]
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("found_words_user_pool_unique_idx").on(table.poolId, table.userId),
  // Daily submissions feed: WHERE pool_id = ? ORDER BY created_at DESC
  index("found_words_pool_created_idx").on(table.poolId, table.createdAt),
]);

// ============================================
// Private Journals
// ============================================

export const journals = pgTable("journals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  content: text("content").notNull(),
  isTimeCapsule: boolean("is_time_capsule").default(false),
  publishAt: timestamp("publish_at"),
  wordCount: integer("word_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("journals_user_idx").on(table.userId),
]);

// ============================================
// Unsent Message Reactions
// ============================================

export const unsentMessageReactions = pgTable("unsent_message_reactions", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").references(() => unsentMessages.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("unsent_reaction_unique_idx").on(table.messageId, table.userId),
]);

// ============================================
// Reports
// ============================================

export const reportStatusEnum = pgEnum("report_status", ["pending", "resolved", "dismissed"]);

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  reporterId: integer("reporter_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  reason: varchar("reason", { length: 100 }).notNull(),
  details: text("details"),
  status: reportStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: integer("resolved_by").references(() => users.id, { onDelete: "set null" }),
}, (table) => [
  uniqueIndex("reports_post_reporter_unique_idx").on(table.postId, table.reporterId),
  index("reports_status_idx").on(table.status),
  index("reports_post_idx").on(table.postId),
]);

// ============================================
// Daily Writing Prompts
// ============================================

export const dailyPrompts = pgTable("daily_prompts", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  theme: varchar("theme", { length: 100 }),
  activeDate: timestamp("active_date").notNull(),
  isActive: boolean("is_active").default(true),
  responseCount: integer("response_count").default(0),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("daily_prompts_date_unique_idx").on(table.activeDate),
  index("daily_prompts_active_idx").on(table.isActive),
]);

export const promptResponses = pgTable("prompt_responses", {
  id: serial("id").primaryKey(),
  promptId: integer("prompt_id").references(() => dailyPrompts.id, { onDelete: "cascade" }).notNull(),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("prompt_response_user_unique_idx").on(table.promptId, table.userId),
  index("prompt_response_prompt_idx").on(table.promptId),
]);

// ============================================
// User Preferences
// ============================================

export const userPreferences = pgTable("user_preferences", {
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).primaryKey(),
  ghostMode: boolean("ghost_mode").default(false),
  showActivity: boolean("show_activity").default(true),
  emailNotifications: boolean("email_notifications").default(true),
  followNotifications: boolean("follow_notifications").default(true),
  ratingNotifications: boolean("rating_notifications").default(true),
  messageNotifications: boolean("message_notifications").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});
