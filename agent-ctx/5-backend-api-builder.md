# Task 5 - Backend API Builder

## Summary
Built 7 API route handlers for the PredicTX app using Next.js 16 App Router, TypeScript, and Prisma with SQLite.

## Files Created

| Route | Method | Path | Purpose |
|-------|--------|------|---------|
| user | GET | `/api/user` | Get or create default user (VIPER TRADER) |
| bet | POST | `/api/bet` | Place a bet with validation |
| deposit | POST | `/api/wallet/deposit` | Deposit funds |
| withdraw | POST | `/api/wallet/withdraw` | Withdraw funds |
| bets | GET | `/api/bets?userId=` | Get recent bets (last 20) |
| stats | GET | `/api/stats` | Global stats (online, payouts, top winners) |
| price | GET | `/api/price` | Current price and history (40 points) |

## Key Design Decisions
- All mutating operations (bet, deposit, withdraw) use `db.$transaction()` for data consistency
- Bet placement validates: user exists, sufficient balance, no duplicate active bet per round
- Stats and price endpoints fall back to simulated data when no real data exists in the database
- User endpoint auto-creates a default user if none exists
- All routes have comprehensive error handling with appropriate HTTP status codes
- Lint check passed with zero errors

## Integration Notes for Frontend Agent
- `/api/user` returns `{ id, name, avatar, balance, winnings, bonus, profit, wins, totalBets, winRate, country }`
- `/api/bet` expects `{ userId, direction, amount }` and returns bet + round info
- `/api/wallet/deposit` and `/api/wallet/withdraw` expect `{ userId, amount, method }` and return `{ balance, transaction }`
- `/api/bets?userId=xxx` returns `{ bets: [...] }` with embedded round data
- `/api/stats` returns `{ usersOnline, totalPayoutsToday, topWinners }`
- `/api/price` returns `{ price, history, changeAbs, changePct, timestamp }`
