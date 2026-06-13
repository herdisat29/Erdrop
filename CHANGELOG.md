# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-06-13

### Added
- **Multi-Chain Wallet Scanner (Beta)**: Scan EVM addresses across 8 chains simultaneously using GoldRush API.
- **Smart Caching Layer**: Implemented Supabase caching for Wallet Scanner to optimize API limits.
- **AI Analysis Memory**: AI now remembers the last 3 analyses to track project evolution.
- **Advanced AI Context**: Added Bull Case, Bear Case, Key Risks, and Funding Status to AI reports.
- **Portfolio Ledger**: New `/report` dashboard for tracking Won, Pending, and Missed airdrops.
- **Trending Tokens Update**: Added 24h percentage changes and visual indicators.
- **Global Error Boundary**: Added custom `global-error.tsx` for layout-level crashes.

### Changed
- Transitioned from gimmick "Farmer Score" to concrete "Farmer Health" metrics (Win Rate, Completion Rate).
- Navigation restructuring: Added Portfolio/Ledger and Wallet tools to Sidebar and Mobile Nav.
- Database: Upgraded `ai_analyses` table to support additive metrics without breaking legacy data.

### Fixed
- Fixed critical cross-user data leakage in the Ledger page by enforcing `.eq('user_id')` on Supabase server client.
- Fixed Lucide icon type errors in WalletScanner.
- Fixed missing Mobile Nav links after feature merge.
