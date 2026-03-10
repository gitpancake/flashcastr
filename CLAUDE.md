# Flashcastr

Flashcastr is the frontend web app for the Flash Invaders broadcasting system. Users can browse global flash feeds, view personal feeds, track progress, and manage their Farcaster-connected accounts.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS 3.4 with retro terminal/pixel aesthetic (Space Invaders font)
- **Data Fetching**: @tanstack/react-query 5 (infinite queries for pagination)
- **API**: GraphQL via axios POST to `NEXT_PUBLIC_FLASHCASTR_API_URL`
- **Auth**: next-auth with Neynar/Farcaster integration
- **Web3**: viem + wagmi for wallet/Farcaster frame support
- **Farcaster Frames**: @farcaster/frame-core, frame-node, frame-sdk, frame-wagmi-connector
- **Maps**: leaflet + react-leaflet (InvaderMap component)
- **Caching**: @upstash/redis (optional)
- **Dates**: date-fns
- **Deployment**: Vercel (`npm run deploy:vercel`)

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    api/                  # API routes (auth, neynar callbacks)
    flash/[id]/           # Individual flash detail page
    profile/[fid]/        # User profile page
    admin/                # Admin panel
  components/
    atom/                 # Header, Footer, ErrorBoundary
    molecule/             # GlobalFlashes, Feed, Leaderboard, Progress, Favorites, etc.
    organism/             # AppInitializer (main view router), Setup, UserProfile
    providers/            # Context providers (Frame)
    ui/                   # shadcn/ui base components
  hooks/
    api.flashcastrs.app/  # React Query hooks for API data fetching
  lib/
    api.flashcastr.app/   # API client classes (BaseApi, GlobalFlashesApi, FlashesApi, UsersApi)
    help/                 # Utilities: formatTimeAgo, getImageUrl, addCommasToNumber
    neynar/               # Farcaster/Neynar SDK integration
    constants.ts          # FETCH limits, IPFS gateway, feature flags
    badges.ts, favorites.ts, share.ts
  styles/                 # Global CSS
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/api.flashcastr.app/base.ts` | Base axios client (reads `NEXT_PUBLIC_FLASHCASTR_API_URL`) |
| `src/lib/api.flashcastr.app/globalFlashes.ts` | GlobalFlashesApi + UnifiedFlashesApi classes |
| `src/components/molecule/GlobalFlashes.tsx` | Global flash feed with infinite scroll + city filtering |
| `src/components/molecule/Feed.tsx` | Personal flash feed (authed user) |
| `src/components/molecule/Leaderboard.tsx` | Player leaderboard (sortable by flashes/cities) |
| `src/components/molecule/Progress.tsx` | User progress heatmap + streak tracking |
| `src/components/organism/AppInitializer.tsx` | Main view router (Feed/Global/Leaderboard) |
| `src/lib/help/formatTimeAgo.ts` | Time display: "JUST NOW", "5M AGO", "3 HR AGO", "YESTERDAY", "7 DAYS AGO" |
| `src/lib/help/getImageUrl.ts` | IPFS CID → Pinata gateway URL |
| `src/lib/constants.ts` | FETCH.LIMIT=20, IPFS gateway, ADMIN_FID |

## Commands

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run build:check   # Build without linting
npm run lint          # ESLint
npm run deploy:vercel # Deploy to Vercel
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FLASHCASTR_API_URL` | Yes | Backend GraphQL API URL (e.g., `https://api.flashcastr.app`) |
| `NEXT_PUBLIC_IPFS_GATEWAY` | No | IPFS gateway (default: Pinata `fuchsia-rich-lungfish-648.mypinata.cloud/ipfs`) |
| `NEYNAR_API_KEY` | Yes | Neynar API key for Farcaster |
| `NEYNAR_CLIENT_ID` | Yes | Neynar client ID |
| `NEXTAUTH_URL` | Yes | NextAuth base URL |
| `NEXTAUTH_SECRET` | Yes | NextAuth secret |
| `FLASHCASTR_API_KEY` | Yes | API key sent as `X-API-KEY` header |
| `NEXT_PUBLIC_ADMIN_FID` | No | Admin Farcaster ID for experimental features |

## Data Flow

1. **Global Flashes**: `GlobalFlashesApi.getGlobalFlashes()` → GraphQL `globalFlashes` query → backend returns from `flashes` table ordered by `timestamp DESC`
2. **Personal Feed**: `FlashesApi.getFlashes()` → GraphQL `flashes` query → joins `flashcastr_flashes` + `flashes` tables
3. **Timestamps**: API returns Unix seconds as strings → frontend parses with `parseInt()` → `fromUnixTime()` → `formatTimeAgo()`

## Path Alias

`~/` maps to `./src/` (configured in tsconfig.json)

## Pre-commit

Husky runs `npm run lint && npm run build:check` on pre-commit.
