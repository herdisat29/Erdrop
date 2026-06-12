-- [NEW] Add rate limiting columns to farming_plans
-- generation_count: tracks how many times plan was generated within the 24h window
-- last_generated_at: timestamp of last generation, used to reset the window

ALTER TABLE farming_plans
  ADD COLUMN IF NOT EXISTS generation_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_generated_at timestamp with time zone;

-- Backfill existing rows: set last_generated_at to updated_at so existing users
-- don't get a phantom "5 gens used" on first load
UPDATE farming_plans
  SET last_generated_at = updated_at
  WHERE last_generated_at IS NULL;
