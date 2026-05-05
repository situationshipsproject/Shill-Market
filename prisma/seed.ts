import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Use connection pool to avoid Neon serverless timeout drops
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const SEED_LISTING_IDS = [
  'seed-listing-1', 'seed-listing-2', 'seed-listing-3', 'seed-listing-4',
  'seed-listing-5', 'seed-listing-6', 'seed-listing-7', 'seed-listing-8', 'seed-listing-9',
]
const SEED_ORDER_IDS = [
  'seed-order-1', 'seed-order-2', 'seed-order-3', 'seed-order-4',
  'seed-order-5', 'seed-order-6', 'seed-order-7',
]
const SEED_USERNAMES = [
  '0xnullbyte', 'degenghost', 'pumpforge', 'alphaxdesign',
  'sigmaresearch', 'nukekol', 'websterbrokers', 'rektking',
]

async function main() {
  console.log('Cleaning existing seed data...')
  await prisma.review.deleteMany({ where: { orderId: { in: SEED_ORDER_IDS } } })
  await prisma.order.deleteMany({ where: { id: { in: SEED_ORDER_IDS } } })
  await prisma.package.deleteMany({ where: { listingId: { in: SEED_LISTING_IDS } } })
  await prisma.listing.deleteMany({ where: { id: { in: SEED_LISTING_IDS } } })
  await prisma.user.deleteMany({ where: { username: { in: SEED_USERNAMES } } })

  console.log('Creating users...')
  const [nullbyte, degenghost, pumpforge, alphaxdesign, sigmaresearch, nukekol, websterbrokers, rektking] = await Promise.all([
    prisma.user.create({ data: { username: '0xnullbyte', displayName: '0xNullByte', bio: 'Solana dev. 3 years on-chain. Former auditor at a private security firm. 40+ programs audited, zero post-launch exploits on my watch.', walletAddress: '0xNuL1B8dead0000000000000000000000000000001', tier: 'ELITE', isVerified: true } }),
    prisma.user.create({ data: { username: 'degenghost', displayName: 'DegenGhost', bio: 'KOL with 180k followers across X and Telegram. 3 years pushing narratives. 50+ launches — from sub-$50k MC memes to eight-figure protocols.', walletAddress: '0xD3g3nGh0cafe0000000000000000000000000002', tier: 'VERIFIED', isVerified: true } }),
    prisma.user.create({ data: { username: 'pumpforge', displayName: 'PumpForge', bio: 'Community builder. Launched 20+ Telegram groups with real members. Mod team setup, engagement frameworks, anti-bot filters. I build communities that stay.', walletAddress: '0xPuMpF0rg3babe000000000000000000000000003', tier: 'ELITE', isVerified: true } }),
    prisma.user.create({ data: { username: 'alphaxdesign', displayName: 'AlphaXDesign', bio: 'Crypto-native designer. Meme packs, PFPs, banners, animated content. Have worked on $PEPE, $BRETT, $MOG campaigns. Fast, meme-fluent.', walletAddress: '0xA1phaf00d00000000000000000000000000000004', tier: 'VERIFIED', isVerified: false } }),
    prisma.user.create({ data: { username: 'sigmaresearch', displayName: 'SigmaResearch', bio: 'Anonymous alpha researcher. Sector deep-dives, on-chain analysis, competitor landscaping. 48-hour turnaround guaranteed.', tier: 'ANON', isVerified: false } }),
    prisma.user.create({ data: { username: 'nukekol', displayName: 'NukeKOL', bio: 'Coordinated KOL campaigns for token launches. Network of 10+ callers across tiers. Spaces hosting, X thread runs, coordinated drops. Results or refund.', walletAddress: '0xNuK3bead0000000000000000000000000000005', tier: 'ELITE', isVerified: true } }),
    prisma.user.create({ data: { username: 'websterbrokers', displayName: 'WebsterBrokers', bio: 'Crypto-specialized legal team. Cayman foundations, BVI companies, Swiss associations. Regulatory opinion letters. 12+ years in digital assets law.', email: 'legal@websterbrokers.io', tier: 'INSTITUTION', isVerified: true, kycCompleted: true } }),
    prisma.user.create({ data: { username: 'rektking', displayName: 'RektKing', bio: 'Tokenomics designer and launch strategist. 30+ token launches consulted on — pump.fun, Raydium, private raises. I write docs that close investors.', walletAddress: '0xR3ktbeaf0000000000000000000000000000006', tier: 'VERIFIED', isVerified: true } }),
  ])
  console.log('Users created.')

  console.log('Creating listings...')
  const listings = await Promise.all([
    prisma.listing.create({ data: { id: 'seed-listing-1', title: 'Full Solana smart contract audit + mainnet deploy', description: "I've audited and deployed 40+ Solana programs across DeFi, NFT, and memecoin projects. Full line-by-line security review, written report, fixes applied, and clean mainnet deploy.\n\nEvery audit includes a public report you can share with your community. Have worked with teams on pump.fun, Magic Eden launchpad, and private raises.", category: 'DEVELOPMENT', tags: ['solana', 'audit', 'deploy', 'rust', 'security'], isFeatured: true, sellerId: nullbyte.id } }),
    prisma.listing.create({ data: { id: 'seed-listing-2', title: 'Custom Rust smart contract development for Solana', description: 'Custom Solana programs built from scratch. Vesting contracts, bonding curves, staking, custom AMMs, NFT mechanics. Full testing suite and documentation included.', category: 'DEVELOPMENT', tags: ['rust', 'solana', 'custom', 'anchor'], isFeatured: false, sellerId: nullbyte.id } }),
    prisma.listing.create({ data: { id: 'seed-listing-3', title: 'Twitter spaces host + coordinated X thread campaign', description: 'I host Twitter spaces and write thread campaigns for token launches and protocol announcements. 30k+ X audience, clip packs, and native crypto voice. Have worked with Solana DeFi teams, Base memecoins, and L2 protocols.', category: 'CALLERS_KOLS', tags: ['twitter', 'spaces', 'kol', 'thread', 'campaign'], isFeatured: true, sellerId: degenghost.id } }),
    prisma.listing.create({ data: { id: 'seed-listing-4', title: 'Telegram community setup — mod team, bots, first 500 members', description: "I build Telegram communities that actually stay active. Setup includes channel architecture, bot configuration (anti-spam, welcome flows), hiring 3-5 moderators, and driving the first 500 real members. No bots for counts.", category: 'COMMUNITY', tags: ['telegram', 'community', 'mods', 'growth'], isFeatured: true, sellerId: pumpforge.id } }),
    prisma.listing.create({ data: { id: 'seed-listing-5', title: 'Memecoin brand kit — PFP, banner, meme pack (50 assets)', description: "Full brand identity for your memecoin. High-res PFP (static + animated), banner for X/TG/Discord, 50-piece meme template pack, brand guide PDF. Meme-fluent. Fast. I've worked on tokens that went viral.", category: 'DESIGN_ART', tags: ['design', 'pfp', 'memes', 'branding', 'memecoin'], isFeatured: true, sellerId: alphaxdesign.id } }),
    prisma.listing.create({ data: { id: 'seed-listing-6', title: 'Alpha research report — any crypto sector, 48hr delivery', description: 'Deep research: on-chain data, team backgrounds, VC connections, liquidity flows, social signals. Pre-investment due diligence, competitor analysis, sector entry thesis, influencer vetting. Clean PDF delivery.', category: 'RESEARCH_ALPHA', tags: ['research', 'alpha', 'due-diligence', 'analysis'], isFeatured: false, sellerId: sigmaresearch.id } }),
    prisma.listing.create({ data: { id: 'seed-listing-7', title: 'Coordinated KOL campaign — 10 callers, synchronized launch', description: "For serious launches only. 10+ KOLs synchronized across different tiers and audiences. Pre-launch hype, synchronized launch day posting, spaces coverage, 7-day post-launch engagement. I've run campaigns that went from $0 to $10M+ MC in 48 hours.", category: 'CALLERS_KOLS', tags: ['kol', 'campaign', 'callers', 'launch', 'coordinated'], isFeatured: true, sellerId: nukekol.id } }),
    prisma.listing.create({ data: { id: 'seed-listing-8', title: 'Cayman Islands legal entity setup for crypto project', description: 'Cayman Foundations and BVI companies structured for crypto projects, DAOs, and token issuers. Full incorporation, registered agent, bank intro, and regulatory opinion letter. 100+ crypto entities incorporated.', category: 'COMPLIANCE', tags: ['legal', 'cayman', 'entity', 'compliance', 'dao'], isFeatured: false, sellerId: websterbrokers.id } }),
    prisma.listing.create({ data: { id: 'seed-listing-9', title: 'Tokenomics design + launch strategy + litepaper', description: 'Token economies that make sense — supply structure, vesting schedules, allocation tables, emission curves, liquidity bootstrapping. Deliverables: tokenomics model, investor deck, litepaper, launch timeline. 30 launches consulted.', category: 'STRATEGY', tags: ['tokenomics', 'strategy', 'litepaper', 'launch'], isFeatured: true, sellerId: rektking.id } }),
  ])
  const [l1, _l2, l3, l4, l5, _l6, l7, _l8, l9] = listings
  console.log('Listings created. Creating packages...')

  await prisma.package.createMany({
    data: [
      // listing 1 - Solana audit
      { listingId: 'seed-listing-1', name: 'Basic', description: 'Single program audit up to 500 lines. Written report. No deploy.', price: 150, currency: 'USDC', deliveryDays: 5, revisions: 1, features: ['Single program audit', 'Written vulnerability report', 'Up to 500 lines', '1 revision'] },
      { listingId: 'seed-listing-1', name: 'Standard', description: 'Full audit + fixes applied + mainnet deploy. Up to 2,000 lines.', price: 450, currency: 'USDC', deliveryDays: 7, revisions: 2, features: ['Full audit up to 2,000 lines', 'Fixes applied', 'Mainnet deploy', 'Public audit report', '2 revisions'] },
      { listingId: 'seed-listing-1', name: 'Premium', description: 'Full suite — audit, fixes, deploy, tokenomics review, 30-day monitoring.', price: 1200, currency: 'USDC', deliveryDays: 14, revisions: 5, features: ['Everything in Standard', 'Tokenomics review', '30-day monitoring', 'Priority comms', '5 revisions', 'NDA available'] },
      // listing 2 - custom rust
      { listingId: 'seed-listing-2', name: 'Basic', description: 'Simple program up to 300 lines. Single instruction.', price: 400, currency: 'USDC', deliveryDays: 7, revisions: 2, features: ['Up to 300 lines', 'Single instruction', 'Basic tests', '2 revisions'] },
      { listingId: 'seed-listing-2', name: 'Standard', description: 'Full program with multiple instructions, testing suite, and deploy.', price: 1200, currency: 'USDC', deliveryDays: 14, revisions: 3, features: ['Full program', 'Multiple instructions', 'Testing suite', 'Mainnet deploy', 'Documentation'] },
      // listing 3 - spaces/X
      { listingId: 'seed-listing-3', name: 'Thread Only', description: 'One full X thread (10-15 tweets). Organic voice, timed drops.', price: 80, currency: 'USDC', deliveryDays: 2, revisions: 2, features: ['10-15 tweet thread', 'Organic crypto voice', 'Scheduling included', '2 revisions'] },
      { listingId: 'seed-listing-3', name: 'Spaces + Thread', description: 'Twitter spaces (60-90 min) + thread campaign + clip pack.', price: 180, currency: 'USDC', deliveryDays: 3, revisions: 1, features: ['60-90 min spaces', 'X thread campaign', 'Clip highlights', 'Post-spaces recap'] },
      { listingId: 'seed-listing-3', name: 'Full Campaign', description: '7-day campaign — daily threads, spaces, and engagement.', price: 650, currency: 'USDC', deliveryDays: 7, revisions: 3, features: ['7-day campaign', 'Daily thread content', '2 spaces events', 'AMA facilitation', 'Analytics report'] },
      // listing 4 - telegram
      { listingId: 'seed-listing-4', name: 'Setup Only', description: 'Full TG setup: architecture, bots, welcome flows, rules.', price: 120, currency: 'USDC', deliveryDays: 3, revisions: 2, features: ['Channel + group setup', 'Bot configuration', 'Welcome flows', 'Rules & pinned msgs'] },
      { listingId: 'seed-listing-4', name: 'Setup + Mods', description: 'Full setup + mod team hired and onboarded.', price: 320, currency: 'USDC', deliveryDays: 7, revisions: 2, features: ['Everything in Setup', '3-5 mods hired', 'Mod training', '30-day support'] },
      { listingId: 'seed-listing-4', name: 'Full Launch', description: 'Setup + mods + first 500 real members + growth support.', price: 750, currency: 'USDC', deliveryDays: 14, revisions: 3, features: ['Everything in Setup + Mods', '500 real members', 'Engagement seeding', '30-day growth plan'] },
      // listing 5 - brand kit
      { listingId: 'seed-listing-5', name: 'PFP Only', description: 'Custom PFP design — static + animated. All formats.', price: 45, currency: 'USDC', deliveryDays: 2, revisions: 3, features: ['Static PFP', 'Animated GIF', 'All formats (PNG, SVG)', '3 revisions'] },
      { listingId: 'seed-listing-5', name: 'Brand Kit', description: 'PFP + banner + 20-piece meme pack + brand guide.', price: 95, currency: 'USDC', deliveryDays: 5, revisions: 3, features: ['Custom PFP (static + animated)', 'X/TG/Discord banner', '20 meme templates', 'Brand guide PDF'] },
      { listingId: 'seed-listing-5', name: 'Full Launch Pack', description: 'Complete brand identity. 50 memes, all assets, commercial rights.', price: 220, currency: 'USDC', deliveryDays: 10, revisions: 5, features: ['Everything in Brand Kit', '50 meme templates', 'Commercial rights', 'Source files', 'Priority support'] },
      // listing 6 - research
      { listingId: 'seed-listing-6', name: 'Quick Scan', description: 'Single project or person scan. On-chain + social flags. 24hr.', price: 40, currency: 'USDC', deliveryDays: 1, revisions: 1, features: ['Single subject', 'On-chain analysis', 'Social footprint check', 'Red flag report'] },
      { listingId: 'seed-listing-6', name: 'Deep Report', description: 'Full sector or project deep-dive. 48hr. Cited PDF.', price: 75, currency: 'USDC', deliveryDays: 2, revisions: 2, features: ['Full deep-dive', 'Competitive landscape', 'On-chain + off-chain', 'Cited PDF report'] },
      { listingId: 'seed-listing-6', name: 'Monthly Retainer', description: '4 reports/month, priority turnaround.', price: 250, currency: 'USDC', deliveryDays: 30, revisions: 0, features: ['4 reports per month', 'Priority turnaround', 'Custom focus areas', 'Secure delivery'] },
      // listing 7 - KOL campaign
      { listingId: 'seed-listing-7', name: 'Starter', description: '5 callers, launch day push, 3-day follow-up.', price: 400, currency: 'USDC', deliveryDays: 7, revisions: 1, features: ['5 KOLs', 'Launch day coordination', '3-day follow-up', 'Basic analytics'] },
      { listingId: 'seed-listing-7', name: 'Full Campaign', description: '10 callers, pre-launch build, launch day, 7-day campaign.', price: 1200, currency: 'USDC', deliveryDays: 10, revisions: 2, features: ['10+ KOLs', 'Pre-launch hype', 'Synchronized launch', '7-day campaign', 'Spaces coverage', 'Analytics report'] },
      { listingId: 'seed-listing-7', name: 'Elite Launch', description: '15+ callers, full month campaign, strategy included.', price: 3500, currency: 'USDC', deliveryDays: 30, revisions: 3, features: ['15+ KOLs including elites', '30-day campaign', 'Strategy session', 'Full media kit', 'Weekly reports', 'Refund guarantee'] },
      // listing 8 - legal
      { listingId: 'seed-listing-8', name: 'Consultation', description: 'Strategy session: entity type advisory, jurisdiction selection, timeline.', price: 350, currency: 'USDC', deliveryDays: 3, revisions: 0, features: ['90-min strategy call', 'Entity recommendation', 'Jurisdiction comparison', 'Written summary'] },
      { listingId: 'seed-listing-8', name: 'Full Incorporation', description: 'End-to-end entity setup. Cayman Foundation or BVI Co.', price: 3500, currency: 'USDC', deliveryDays: 21, revisions: 2, features: ['Full incorporation', 'Registered agent', 'Bank intro', 'Regulatory opinion letter', 'Shareholder docs'] },
      // listing 9 - tokenomics
      { listingId: 'seed-listing-9', name: 'Tokenomics Model', description: 'Full tokenomics spreadsheet + allocation table + vesting schedule.', price: 200, currency: 'USDC', deliveryDays: 4, revisions: 3, features: ['Supply model', 'Allocation table', 'Vesting schedule', 'Emission curves', '3 revisions'] },
      { listingId: 'seed-listing-9', name: 'Strategy Package', description: 'Tokenomics + litepaper + launch timeline + investor deck.', price: 550, currency: 'USDC', deliveryDays: 7, revisions: 3, features: ['Full tokenomics model', 'Litepaper (10+ pages)', 'Launch timeline', 'Investor deck', 'Strategy call'] },
    ],
  })
  console.log('Packages created. Creating orders & reviews...')

  const getPkg = async (listingId: string, name: string) => {
    const pkg = await prisma.package.findFirst({ where: { listingId, name } })
    if (!pkg) throw new Error(`Package "${name}" not found on listing ${listingId}`)
    return pkg.id
  }

  // Orders
  const orders = await Promise.all([
    prisma.order.create({ data: { id: 'seed-order-1', status: 'COMPLETED', amount: 450, currency: 'USDC', paymentMethod: 'CRYPTO_WALLET', txHash: '5j8v1demo', escrowStatus: 'RELEASED', completedAt: new Date('2024-03-15'), buyerId: pumpforge.id, sellerId: nullbyte.id, listingId: l1.id, packageId: await getPkg(l1.id, 'Standard') } }),
    prisma.order.create({ data: { id: 'seed-order-2', status: 'COMPLETED', amount: 450, currency: 'USDC', paymentMethod: 'CRYPTO_WALLET', txHash: '5j8v2demo', escrowStatus: 'RELEASED', completedAt: new Date('2024-02-20'), buyerId: degenghost.id, sellerId: nullbyte.id, listingId: l1.id, packageId: await getPkg(l1.id, 'Standard') } }),
    prisma.order.create({ data: { id: 'seed-order-3', status: 'COMPLETED', amount: 180, currency: 'USDC', paymentMethod: 'CRYPTO_WALLET', txHash: '5j8v3demo', escrowStatus: 'RELEASED', completedAt: new Date('2024-04-01'), buyerId: pumpforge.id, sellerId: degenghost.id, listingId: l3.id, packageId: await getPkg(l3.id, 'Spaces + Thread') } }),
    prisma.order.create({ data: { id: 'seed-order-4', status: 'COMPLETED', amount: 320, currency: 'USDC', paymentMethod: 'CRYPTO_WALLET', txHash: '5j8v4demo', escrowStatus: 'RELEASED', completedAt: new Date('2024-03-28'), buyerId: rektking.id, sellerId: pumpforge.id, listingId: l4.id, packageId: await getPkg(l4.id, 'Setup + Mods') } }),
    prisma.order.create({ data: { id: 'seed-order-5', status: 'COMPLETED', amount: 95, currency: 'USDC', paymentMethod: 'CRYPTO_WALLET', txHash: '5j8v5demo', escrowStatus: 'RELEASED', completedAt: new Date('2024-04-10'), buyerId: degenghost.id, sellerId: alphaxdesign.id, listingId: l5.id, packageId: await getPkg(l5.id, 'Brand Kit') } }),
    prisma.order.create({ data: { id: 'seed-order-6', status: 'COMPLETED', amount: 1200, currency: 'USDC', paymentMethod: 'CRYPTO_WALLET', txHash: '5j8v6demo', escrowStatus: 'RELEASED', completedAt: new Date('2024-04-20'), buyerId: rektking.id, sellerId: nukekol.id, listingId: l7.id, packageId: await getPkg(l7.id, 'Full Campaign') } }),
    prisma.order.create({ data: { id: 'seed-order-7', status: 'COMPLETED', amount: 550, currency: 'USDC', paymentMethod: 'CRYPTO_WALLET', txHash: '5j8v7demo', escrowStatus: 'RELEASED', completedAt: new Date('2024-04-25'), buyerId: nullbyte.id, sellerId: rektking.id, listingId: l9.id, packageId: await getPkg(l9.id, 'Strategy Package') } }),
  ])

  // Reviews
  await prisma.review.createMany({
    data: [
      { orderId: orders[0].id, rating: 5, comment: 'Caught a critical reentrancy bug before we launched. Would have been a rug. Absolute legend.', reviewerId: pumpforge.id, revieweeId: nullbyte.id },
      { orderId: orders[1].id, rating: 5, comment: 'Fast, communicative, delivered early. The audit report was detailed enough to share publicly — boosted community trust significantly.', reviewerId: degenghost.id, revieweeId: nullbyte.id },
      { orderId: orders[2].id, rating: 5, comment: "Spaces hit 800 live listeners. Thread got 50k impressions. Best ROI on any marketing spend we've done.", reviewerId: pumpforge.id, revieweeId: degenghost.id },
      { orderId: orders[3].id, rating: 5, comment: 'Community went from 0 to 1,200 in two weeks. Mods are actually active. Real members, no bots.', reviewerId: rektking.id, revieweeId: pumpforge.id },
      { orderId: orders[4].id, rating: 5, comment: "Meme pack alone drove 200k+ impressions in 48hrs. The PFP became the community's avatar template.", reviewerId: degenghost.id, revieweeId: alphaxdesign.id },
      { orderId: orders[5].id, rating: 5, comment: 'Token hit $3M MC in 48 hours. Coordinated perfectly. Every caller posted on time. Will hire again for next launch.', reviewerId: rektking.id, revieweeId: nukekol.id },
      { orderId: orders[6].id, rating: 5, comment: "Litepaper was investor-ready from day one. Closed our private round in 2 weeks.", reviewerId: nullbyte.id, revieweeId: rektking.id },
    ],
  })

  console.log('Seed complete. Database is ready.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect().then(() => pool.end()))
