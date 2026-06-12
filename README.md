# Erdrop 💧

The ultimate tracking and analytics dashboard for crypto airdrop farming. Stop using messy spreadsheets and start managing your airdrop portfolio with intelligence.

![Erdrop Dashboard](public/og-image.png)

## Features

- **Portfolio Tracking**: Track token and NFT airdrops across multiple chains.
- **Activity Logs**: Keep a granular history of tasks (swaps, bridging, minting) and calculate estimated potential returns.
- **AI Masterplans**: Generate actionable 4-week farming plans based on your active projects using Gemini 2.5 Flash.
- **AI Project Analysis**: Automatically analyze projects for red flags, green flags, and potential scores.
- **Smart Import**: Upload your messy CSV spreadsheets, and let AI automatically map the columns into the Erdrop system.
- **Market Intelligence**: Real-time trending tokens, NFTs, and crypto news powered by CoinGecko and CryptoPanic.
- **Automated Alerts**: Hourly cron jobs to notify you via email (Resend) when a mint or claim deadline is approaching.
- **Web3 Auth**: Passwordless login via Email, Socials, or Crypto Wallets powered by Privy.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui + Material Design 3 Guidelines
- **Auth**: Privy Server Auth
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Google Generative AI (Gemini)
- **Emails**: Resend
- **Analytics**: Vercel Analytics

## Local Setup

### Prerequisites

You will need accounts for the following services:
- [Supabase](https://supabase.com/)
- [Privy](https://privy.io/)
- [Google AI Studio (Gemini)](https://aistudio.google.com/)
- [Resend](https://resend.com/)

### 1. Clone & Install

```bash
git clone https://github.com/herdisat29/Erdrop.git
cd Erdrop
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory based on `.env.example`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Privy
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret

# AI & Notifications
GEMINI_API_KEY=your_gemini_api_key
RESEND_API_KEY=your_resend_api_key

# Optional Market Data
CRYPTOPANIC_TOKEN=your_cryptopanic_token
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Schema

Erdrop requires the following Supabase tables. Migrations are managed manually or via the Supabase CLI.

- `profiles`: User subscription plans and AI usage limits.
- `projects`: Core farming projects tracked by the user.
- `logs`: Activity entries linked to projects.
- `ai_analyses`: AI generated scores and reviews for projects.
- `farming_plans`: Generated 4-week task plans.
- `market_cache`: Caching layer for external market data APIs to prevent rate-limiting.

## License

MIT

