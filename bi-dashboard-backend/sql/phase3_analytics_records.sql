-- =============================================================================
-- Phase 3 Migration: analytics_records
-- Run against your datapulse database:
--   psql -U postgres -d datapulse -f sql/phase3_analytics_records.sql
-- =============================================================================

-- analytics_records stores the actual row data from every successful import.
-- Each row is one record from the uploaded file, linked back to its import.
CREATE TABLE IF NOT EXISTS analytics_records (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id   UUID         NOT NULL REFERENCES imports (id) ON DELETE CASCADE,
  dataset_id  UUID         NOT NULL REFERENCES datasets (id) ON DELETE CASCADE,
  row_index   INTEGER      NOT NULL CHECK (row_index >= 0),
  data        JSONB        NOT NULL,   -- the full row as key→value pairs
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  -- Guarantee row order is unique per import
  UNIQUE (import_id, row_index)
);

-- Fast slice for preview (first N rows of a given import)
CREATE INDEX IF NOT EXISTS idx_analytics_records_import_row
  ON analytics_records (import_id, row_index);

-- Fast full-dataset scan
CREATE INDEX IF NOT EXISTS idx_analytics_records_dataset
  ON analytics_records (dataset_id);

-- GIN index on the JSONB payload for future ad-hoc filtering
CREATE INDEX IF NOT EXISTS idx_analytics_records_data
  ON analytics_records USING GIN (data);

COMMENT ON TABLE analytics_records IS
  'One row per record in an uploaded CSV/Excel file. data column holds the raw key→value pairs.';
COMMENT ON COLUMN analytics_records.row_index IS
  '0-based row number within the source file, used for stable ordering and preview slicing.';
COMMENT ON COLUMN analytics_records.data IS
  'JSONB object where keys are the column headers and values are raw string cell values.';
