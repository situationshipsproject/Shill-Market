# ShillMarket — Claude Code Instructions
# Feed this file to Claude Code at the start of every session

## PROJECT IDENTITY
- Name: ShillMarket
- Type: Decentralized crypto freelance marketplace (Fiverr for crypto)
- Live URL: https://shill-market.vercel.app
- Repo: https://github.com/situationshipsproject/Shill-Market
- Local path: C:\Users\shies\shillmarket\

## TECH STACK
- Framework: Next.js 16.2.4 (App Router, Turbopack)
- Language: TypeScript
- Styling: Tailwind CSS v4
- Components: shadcn/ui (Radix)
- Auth: Privy v3 (@privy-io/react-auth@3.23.1)
- Database: Neon PostgreSQL (serverless)
- ORM: Prisma 7 (with @prisma/adapter-pg)
- Package manager: pnpm
- Deploy: Vercel (auto-deploys on push to main)
- Font: Space Grotesk + JetBrains Mono (Google Fonts)
- Design: Dark theme, #0a0a0b background, #c8f135 lime accent

## CRITICAL KNOWN ISSUES & FIXES (read before touching anything)

### Prisma Import (SOLVED)
The correct import is:
  import { PrismaClient } from '@prisma/client'
NOT from '@/generated/prisma' or '../generated/prisma'
The prisma.config.ts handles connection via adapter pattern.

### Prisma Client Singleton (src/lib/prisma.ts)
Must use @prisma/adapter-pg with PrismaPg adapter.
DATABASE_URL comes from process.env.DATABASE_URL
Never add `url = env("DATABASE_URL")` to prisma/schema.prisma — Prisma 7 removed this.

### Privy Provider (src/app/providers.tsx)
Must always mount PrivyProvider unconditionally.
App ID fallback: process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? 'cmorft6s700hc0ek0jbq495jx'
The if (!appId) return children pattern breaks auth — never use it.

### Environment Variables on Vercel
NEXT_PUBLIC_ vars are baked at build time.
After adding/changing env vars in Vercel dashboard, always redeploy.
Required vars:
  DATABASE_URL=<neon connection string>
  NEXT_PUBLIC_PRIVY_APP_ID=cmorft6s700hc0ek0jbq495jx

### Build Script (package.json)
Must be: "build": "prisma generate && next build"
Prisma generate must run before next build on Vercel.

### Empty Stub Files
TypeScript build fails on empty .tsx/.ts files.
All stub pages must export at least: export default function Page() { return <div /> }

### Browser Console Noise (IGNORE)
These errors are wallet extension conflicts, NOT app bugs:
- MetaMask encountered an error setting the global Ethereum provider
- Cannot redefine property: ethereum
- t is not a function (solana.js, btc.js, sui.js)
These come from MetaMask + Phantom fighting over window.ethereum. Safe to ignore.

## FOLDER STRUCTURE
src/
  app/
    page.tsx                    ← Homepage
    layout.tsx                  ← Root layout with Providers
    providers.tsx               ← Privy + React Query providers
    globals.css
    marketplace/
      page.tsx                  ← Browse listings
      [category]/page.tsx       ← Category filter page
    listing/[id]/page.tsx       ← Listing detail + package selector
    profile/[username]/page.tsx ← Public seller profile
    dashboard/
      page.tsx                  ← Dashboard overview
      listings/
        page.tsx                ← My listings
        new/page.tsx            ← Create listing form
        [id]/edit/page.tsx      ← Edit listing
      orders/page.tsx           ← Orders (buying + selling tabs)
      earnings/page.tsx         ← Earnings (stub)
      settings/page.tsx         ← Settings (stub)
    onboarding/page.tsx         ← 5-step seller onboarding flow
    verify/page.tsx             ← Tier verification (stub)
    admin/
      page.tsx                  ← Admin overview (stub)
      disputes/page.tsx         ← Dispute management (stub)
      users/page.tsx            ← User management (stub)
    api/
      listings/route.ts         ← GET (browse) + POST (create)
      users/route.ts            ← POST (upsert on login)
      users/me/route.ts         ← GET (current user profile)
      escrow/route.ts           ← Escrow actions (stub)
      webhooks/
        stripe/route.ts         ← Stripe webhooks (stub)
        privy/route.ts          ← Privy webhooks (stub)
  components/
    shared/
      navbar/
        Navbar.tsx              ← Main nav with active link
        AuthButton.tsx          ← Privy login/logout buttons
      footer/Footer.tsx
      modals/
        ConnectModal.tsx
        EscrowModal.tsx
    listing/
      ListingCard.tsx
      ListingGrid.tsx
      ListingFilters.tsx
      PackageSelector.tsx
      CategoryBadge.tsx
      TierBadge.tsx
    profile/
      ProfileHeader.tsx
      ProfileStats.tsx
      ReviewList.tsx
      ReviewCard.tsx
    order/
      OrderCard.tsx
      EscrowStatus.tsx
      OrderTimeline.tsx
      DisputeForm.tsx
    dashboard/
      Sidebar.tsx               ← Dashboard sidebar with user card
      StatsBar.tsx
      EarningsChart.tsx
    onboarding/
      OnboardingFlow.tsx
      TierSelector.tsx
  lib/
    prisma.ts                   ← Prisma singleton with pg adapter
    utils.ts                    ← cn() helper
    escrow.ts                   ← Escrow logic (stub)
    stripe.ts                   ← Stripe client (stub)
    privy.ts                    ← Privy config + PRIVY_APP_ID export
  hooks/
    useUser.ts                  ← Syncs Privy user to DB on login
    useListings.ts
    useOrders.ts
    useEscrow.ts
  store/
    userStore.ts                ← Zustand user store
    listingStore.ts
  types/
    index.ts
    listing.ts                  ← Listing, Package, Category types
    user.ts                     ← User, UserTier types
    order.ts                    ← Order, EscrowStatus types
  config/
    categories.ts               ← CATEGORIES array with slugs + icons
    tiers.ts                    ← TIERS config with colors + limits
    constants.ts                ← Platform fee, supported chains, etc.

## DATABASE SCHEMA (Neon PostgreSQL via Prisma)
Tables: users, listings, packages, orders, reviews
Enums: UserTier (ANON/VERIFIED/ELITE/INSTITUTION)
       Category (DEVELOPMENT/DESIGN_ART/MARKETING/COMMUNITY/CALLERS_KOLS/STRATEGY/RESEARCH_ALPHA/BROKERAGE/COMPLIANCE)
       ListingStatus (ACTIVE/PAUSED/DRAFT/REMOVED)
       OrderStatus (PENDING/ACTIVE/DELIVERED/COMPLETED/DISPUTED/CANCELLED/REFUNDED)
       EscrowStatus (HOLDING/RELEASED/REFUNDED/DISPUTED)
       PaymentMethod (CRYPTO_WALLET/CREDIT_CARD/INTERNAL_BALANCE)

## DESIGN SYSTEM
Background: #0a0a0b (near black)
Card background: #111114
Accent: #c8f135 (lime green) — buttons, prices, highlights
Text: #e8e6e0 (off white)
Muted text: rgba(255,255,255,0.4)
Borders: rgba(255,255,255,0.07)
Fonts: Space Grotesk (body), JetBrains Mono (labels/mono)

Tier colors:
  ANON: text-white/40
  VERIFIED: text-lime-400 (#c8f135)
  ELITE: text-violet-400
  INSTITUTION: text-sky-400

## WHAT STILL NEEDS BUILDING
Priority order:
1. Real listings in DB — marketplace shows mock data, needs real Neon data
2. Admin panel — dispute management, user tiers, escrow release
3. Avatar/banner upload — X-style profile images (use Vercel Blob)
4. Order flow wired — Order Now button creates real order + escrow
5. Stripe integration — credit card payments for institutional buyers
6. Smart contract escrow — replace manual escrow with on-chain
7. Profile edit page — let sellers update bio, display name
8. Real reviews — post-order review submission flow

## DEBUGGING WORKFLOW
When something breaks:
1. Check browser console for actual errors (ignore extension noise listed above)
2. Check Vercel build logs for TypeScript errors
3. Check Network tab for failed API calls
4. Verify env vars are set in Vercel dashboard
5. After env var changes always redeploy (not just refresh)
6. For Prisma errors: run pnpm prisma generate locally, check adapter config
7. For Privy errors: check allowed origins in dashboard.privy.io

## GIT WORKFLOW
Always commit small focused changes:
  git add <specific files>
  git commit -m "fix: description of what changed"
  git push
Vercel auto-deploys on push to main branch.

## COMMANDS
pnpm dev              ← start local dev server
pnpm dev --port 3000  ← force port 3000 (use if 3001)
pnpm build            ← test production build locally
pnpm prisma generate  ← regenerate Prisma client after schema changes
pnpm prisma db push   ← push schema changes to Neon
pnpm prisma studio    ← visual DB browser

## PRIVY DASHBOARD
URL: https://dashboard.privy.io
App: ShillMarket
App ID: cmorft6s700hc0ek0jbq495jx
Allowed Origins:
  http://localhost:3000
  http://localhost:3001
  https://shill-market.vercel.app

## NEON DATABASE
URL: https://console.neon.tech
Project: shillmarket
Connection: See .env file for full connection string

## INSTRUCTIONS FOR CLAUDE CODE
You are the technical co-founder of ShillMarket. Your job is to:
1. Read this entire file before doing anything
2. Never break what already works — check existing code before editing
3. When debugging, fix root cause not symptoms
4. Ignore browser extension console errors (MetaMask/Phantom conflicts)
5. Always use TypeScript with proper types, never use 'any' unless necessary
6. Keep the dark design system consistent — never add light backgrounds
7. Test API routes by checking /api/listings in browser after changes
8. After fixing build errors, verify the Vercel deployment succeeds
9. When adding new pages, always export a proper default function
10. Keep pnpm as package manager, never use npm or yarn

When you encounter an error you haven't seen before:
- Read the full error message carefully
- Check which file is causing it
- Look at what the file imports
- Fix the import or the file, not a workaround
- Verify the fix works locally before pushing
