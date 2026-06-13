-- Wallet scan cache table
-- TTL: 1 hour (enforced in application layer)
-- address is PK — one cache row per wallet address

CREATE TABLE public.wallet_scan_cache (
  address text PRIMARY KEY,
  data jsonb NOT NULL,
  scanned_at timestamp with time zone NOT NULL DEFAULT timezone('utc', now())
);

-- RLS: users can only read/write their own cached scans
-- We use a user_id column so each user's cache is isolated
ALTER TABLE public.wallet_scan_cache ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.wallet_scan_cache DROP CONSTRAINT wallet_scan_cache_pkey;
ALTER TABLE public.wallet_scan_cache ADD PRIMARY KEY (user_id, address);

ALTER TABLE public.wallet_scan_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own wallet scan cache"
  ON public.wallet_scan_cache FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet scan cache"
  ON public.wallet_scan_cache FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet scan cache"
  ON public.wallet_scan_cache FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for fast TTL check
CREATE INDEX idx_wallet_scan_cache_user_scanned
  ON public.wallet_scan_cache (user_id, scanned_at DESC);
