# 💧 Erdrop - Track Every Drop

Erdrop is the ultimate airdrop farming and portfolio management platform. Designed for crypto enthusiasts who manage dozens of wallets across multiple chains, Erdrop streamlines your workflow, tracks your progress, and leverages AI to analyze potential opportunities.

![Erdrop Dashboard](public/og-image.png)

## Features

- **Portfolio Ledger**: Track your airdrop wins, pending tasks, and missed opportunities in a clean, comprehensive dashboard.
- **Multi-Chain Wallet Scanner [BETA]**: Scan `0x` EVM addresses across 8 major networks (Ethereum, Base, Arbitrum, Optimism, zkSync, Scroll, Linea, Zora) in seconds using the GoldRush API.
- **AI Analysis Engine**: Powered by Google's Gemini, get deep insights into airdrop projects including Bull Cases, Bear Cases, Key Risks, and Funding Status.
- **Historical Memory**: The AI remembers your previous analyses, creating a historical timeline of a project's evolution.
- **Market Intelligence**: Real-time trending tokens and NFT collections with 24h price changes.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Material Design 3 Tokens
- **Database & Auth**: Supabase (PostgreSQL) + Privy
- **AI**: Google Gemini Pro API
- **Web3 Data**: Covalent GoldRush API

## Local Setup

### 1. Prerequisites
- Node.js 18+
- Supabase account
- Privy account
- Gemini API Key
- Covalent GoldRush API Key

### 2. Clone & Install
```bash
git clone https://github.com/herdisat29/erdrop.git
cd erdrop
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Privy
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret

# APIs
GEMINI_API_KEY=your_gemini_api_key
GOLDRUSH_API_KEY=your_covalent_api_key
```

### 4. Database Setup (Supabase)
Run the SQL migrations found in `supabase/migrations/` in your Supabase SQL Editor to create the required tables:
1. `projects`
2. `logs`
3. `ai_analyses`
4. `wallet_scan_cache`

Make sure Row Level Security (RLS) is enabled for all tables!

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## License

MIT License. Copyright (c) 2026 Erdrop.
