-- One-time extension setup for trigram-based LIKE '%x%' search on posts.title.
-- Run this ONCE against your database (as a superuser) BEFORE applying the
-- drizzle migration that creates posts_title_trgm_idx.
--
--     psql "$DATABASE_URL" -f drizzle/pg_trgm.sql
--
CREATE EXTENSION IF NOT EXISTS pg_trgm;
