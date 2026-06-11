-- =============================================================================
-- DataPulse BI Platform — Database Schema
-- Run once against your PostgreSQL database:
--   psql -U postgres -d datapulse -f schema.sql
-- =============================================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";     -- case-insensitive text for email

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

-- User roles
CREATE TYPE user_role AS ENUM ('admin', 'analyst', 'viewer');

-- Import processing status
CREATE TYPE import_status AS ENUM ('pending', 'processing', 'success', 'error');

-- Report status
CREATE TYPE report_status AS ENUM ('processing', 'ready', 'scheduled', 'failed');

-- Supported export formats
CREATE TYPE report_format AS ENUM ('PDF', 'CSV', 'Excel', 'JSON');

-- =============================================================================
-- TABLE: users
-- Core identity and auth table. Passwords are stored as bcrypt hashes.
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(120)  NOT NULL CHECK (char_length(trim(name)) >= 2),
  email         CITEXT        NOT NULL UNIQUE,
  password_hash TEXT          NOT NULL,
  role          user_role     NOT NULL DEFAULT 'analyst',
  department    VARCHAR(100),
  avatar_url    TEXT,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Fast lookups by email (login flow)
CREATE INDEX IF NOT EXISTS idx_users_email     ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active);

COMMENT ON TABLE  users              IS 'Platform users — passwords stored as bcrypt hashes, never plaintext';
COMMENT ON COLUMN users.email        IS 'CITEXT: stored as-entered but compared case-insensitively';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hash (12 rounds). NEVER store plaintext.';

-- =============================================================================
-- TABLE: datasets
-- Metadata for every data source registered on the platform.
-- Actual row data lives in separate tables or an external store.
-- =============================================================================

CREATE TABLE IF NOT EXISTS datasets (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(200) NOT NULL,
  description    TEXT,
  source_type    VARCHAR(50)  NOT NULL DEFAULT 'import'
                              CHECK (source_type IN ('import', 'api', 'database', 'manual')),
  schema_json    JSONB,                              -- column definitions detected at import time
  row_count      INTEGER      NOT NULL DEFAULT 0 CHECK (row_count >= 0),
  column_count   INTEGER      NOT NULL DEFAULT 0 CHECK (column_count >= 0),
  file_size_bytes BIGINT,
  tags           TEXT[]       NOT NULL DEFAULT '{}',
  is_archived    BOOLEAN      NOT NULL DEFAULT FALSE,
  created_by     UUID         NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_datasets_created_by  ON datasets (created_by);
CREATE INDEX IF NOT EXISTS idx_datasets_source_type ON datasets (source_type);
CREATE INDEX IF NOT EXISTS idx_datasets_tags        ON datasets USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_datasets_schema      ON datasets USING GIN (schema_json);

COMMENT ON TABLE  datasets            IS 'Metadata registry for every dataset ingested into the platform';
COMMENT ON COLUMN datasets.schema_json IS 'JSON array of {name, type, nullable} column descriptors';

-- =============================================================================
-- TABLE: imports
-- Tracks every file upload attempt end-to-end.
-- Links back to the dataset record created on success.
-- =============================================================================

CREATE TABLE IF NOT EXISTS imports (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  filename        VARCHAR(500)  NOT NULL,
  file_type       VARCHAR(10)   NOT NULL CHECK (file_type IN ('CSV', 'Excel')),
  file_size_bytes BIGINT        NOT NULL CHECK (file_size_bytes > 0),
  status          import_status NOT NULL DEFAULT 'pending',
  rows_imported   INTEGER       NOT NULL DEFAULT 0 CHECK (rows_imported >= 0),
  columns_found   INTEGER       NOT NULL DEFAULT 0 CHECK (columns_found >= 0),
  error_message   TEXT,                              -- populated when status = 'error'
  dataset_id      UUID          REFERENCES datasets (id) ON DELETE SET NULL,
  uploaded_by     UUID          NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- completed_at is only allowed when terminal
  CONSTRAINT chk_completed_at CHECK (
    completed_at IS NULL
    OR status IN ('success', 'error')
  )
);

CREATE INDEX IF NOT EXISTS idx_imports_uploaded_by ON imports (uploaded_by);
CREATE INDEX IF NOT EXISTS idx_imports_status      ON imports (status);
CREATE INDEX IF NOT EXISTS idx_imports_dataset_id  ON imports (dataset_id);
CREATE INDEX IF NOT EXISTS idx_imports_created_at  ON imports (created_at DESC);

COMMENT ON TABLE  imports              IS 'Audit trail of every file upload — one row per attempt';
COMMENT ON COLUMN imports.dataset_id   IS 'Populated only when status = success';
COMMENT ON COLUMN imports.error_message IS 'Human-readable failure reason; null on success';

-- =============================================================================
-- TABLE: reports
-- Generated or scheduled analytical reports.
-- =============================================================================

CREATE TABLE IF NOT EXISTS reports (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(300)  NOT NULL CHECK (char_length(trim(name)) >= 1),
  description  TEXT,
  status       report_status NOT NULL DEFAULT 'processing',
  format       report_format NOT NULL DEFAULT 'PDF',
  storage_key  TEXT,                                -- S3 / object-store key; null until ready
  file_size_bytes BIGINT,
  tags         TEXT[]        NOT NULL DEFAULT '{}',
  config_json  JSONB,                              -- report generation parameters
  scheduled_at TIMESTAMPTZ,                        -- set when status = scheduled
  generated_at TIMESTAMPTZ,                        -- set when status = ready
  created_by   UUID          NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_storage_key CHECK (
    storage_key IS NULL OR status = 'ready'
  )
);

CREATE INDEX IF NOT EXISTS idx_reports_created_by  ON reports (created_by);
CREATE INDEX IF NOT EXISTS idx_reports_status      ON reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_format      ON reports (format);
CREATE INDEX IF NOT EXISTS idx_reports_tags        ON reports USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_reports_created_at  ON reports (created_at DESC);

COMMENT ON TABLE  reports             IS 'Analytical reports — generated, scheduled, or failed';
COMMENT ON COLUMN reports.storage_key IS 'Object-store key (e.g. S3); null until report is ready';
COMMENT ON COLUMN reports.config_json IS 'Serialised parameters used to generate this report';

-- =============================================================================
-- TRIGGER: keep updated_at current on every UPDATE
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach to every table
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['users', 'datasets', 'imports', 'reports'] LOOP
    EXECUTE format(
      'CREATE OR REPLACE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
      tbl, tbl
    );
  END LOOP;
END;
$$;

-- =============================================================================
-- RELATIONSHIPS (summary)
-- =============================================================================
--
--  users ────────────┬──< datasets   (created_by → users.id)
--                    ├──< imports    (uploaded_by → users.id)
--                    └──< reports    (created_by  → users.id)
--
--  datasets ─────────┴──< imports    (dataset_id  → datasets.id, nullable)
--
-- =============================================================================
