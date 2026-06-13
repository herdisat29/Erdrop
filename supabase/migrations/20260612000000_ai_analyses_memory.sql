-- Additive migration: add new columns to ai_analyses
-- Old columns (summary, red_flags, green_flags, reasoning) are NOT removed
-- New columns are nullable so old rows remain valid

ALTER TABLE public.ai_analyses
  ADD COLUMN IF NOT EXISTS bull_case text,
  ADD COLUMN IF NOT EXISTS bear_case text,
  ADD COLUMN IF NOT EXISTS key_risks text[],
  ADD COLUMN IF NOT EXISTS funding_status text;

-- Index for fast timeline fetch per project
CREATE INDEX IF NOT EXISTS idx_ai_analyses_project_created
  ON public.ai_analyses (project_id, created_at DESC);
