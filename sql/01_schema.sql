-- =============================================================
-- Grupo Farol — Database schema
-- Run in Supabase Dashboard → SQL Editor
-- =============================================================

-- Editable content fields managed via admin panel
CREATE TABLE IF NOT EXISTS content (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Talent slider creators
CREATE TABLE IF NOT EXISTS creators (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  category      TEXT        NOT NULL,
  photo_url     TEXT        NOT NULL,
  instagram_url TEXT,
  youtube_url   TEXT,
  tiktok_url    TEXT,
  position      INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partner logos
CREATE TABLE IF NOT EXISTS partners (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  logo_url   TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for creator ordering
CREATE INDEX IF NOT EXISTS creators_position_idx ON creators (position ASC);
