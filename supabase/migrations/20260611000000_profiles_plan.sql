-- =============================================
-- Erdrop Freemium: Profiles + Plan System
-- =============================================

-- 1. Drop existing profiles table if it exists (since old one uses UUID and we need TEXT for Privy DIDs)
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Create the proper profiles table
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,                                          -- Privy DID (did:privy:xxx)
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  plan_expires_at TIMESTAMPTZ,                                  -- NULL for free, set for pro
  subscription_id TEXT,                                         -- Midtrans/Xendit order ID (future)
  ai_analysis_count INT NOT NULL DEFAULT 0,                     -- AI analysis usage counter
  ai_plan_count INT NOT NULL DEFAULT 0,                         -- AI farming plan usage counter  
  ai_analysis_reset_at TIMESTAMPTZ DEFAULT NOW(),               -- When analysis counter resets
  ai_plan_reset_at TIMESTAMPTZ DEFAULT NOW(),                   -- When plan counter resets
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create market_cache table for CoinGecko / Cryptopanic data
CREATE TABLE IF NOT EXISTS market_cache (
  id TEXT PRIMARY KEY,                                          -- e.g. 'coingecko_trending', 'cryptopanic_news'
  data JSONB NOT NULL DEFAULT '{}',
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Index for quick plan lookups
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);

-- 5. RLS (profiles uses service role key, so RLS is technically bypassed, 
--    but we enable it for defense-in-depth)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_cache ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (our app uses service role key)
-- No user-facing policies needed since all access goes through server actions
