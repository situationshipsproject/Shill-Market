const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const PRIVY_ID = 'did:privy:cmorra6j2001h0dl83ztdjg8a';

async function run() {
  // Step 1 — assign privyUserId to the existing 0xnullbyte seed user
  const emptyAccount = await prisma.user.findUnique({ where: { privyUserId: PRIVY_ID } });
  const nullbyteUser = await prisma.user.findUnique({ where: { username: '0xnullbyte' } });

  if (!nullbyteUser) {
    console.error('No user with username 0xnullbyte found. Run the original seed first.');
    await prisma.$disconnect();
    return;
  }

  if (emptyAccount && emptyAccount.id !== nullbyteUser.id) {
    // Move any listings/orders from real account -> 0xnullbyte account
    const moved = await prisma.listing.updateMany({ where: { sellerId: emptyAccount.id }, data: { sellerId: nullbyteUser.id } });
    if (moved.count) console.log('Moved', moved.count, 'listing(s) to 0xnullbyte');
    await prisma.order.updateMany({ where: { sellerId: emptyAccount.id }, data: { sellerId: nullbyteUser.id } });
    await prisma.order.updateMany({ where: { buyerId: emptyAccount.id }, data: { buyerId: nullbyteUser.id } });
    // Null out privyUserId so the unique constraint frees up
    await prisma.user.update({ where: { id: emptyAccount.id }, data: { privyUserId: null } });
    // Now assign it to 0xnullbyte
    await prisma.user.update({
      where: { id: nullbyteUser.id },
      data: {
        privyUserId: PRIVY_ID,
        displayName: '0xNullByte',
        bio: 'Solana dev. 3 years on-chain. Former auditor at a private security firm. 40+ programs audited, zero post-launch exploits on my watch.',
        tier: 'ELITE',
        isVerified: true,
      },
    });
    // Delete the now-empty stale account
    await prisma.user.delete({ where: { id: emptyAccount.id } });
    console.log('Cleaned up stale account, Privy ID now on 0xnullbyte:', nullbyteUser.id);
  } else {
    console.log('0xnullbyte already linked or no stale account found');
  }

  const me = nullbyteUser;

  // Step 3 — ensure other demo sellers exist (upsert by username since they're already seeded)
  const others = await Promise.all([
    prisma.user.upsert({ where: { username: 'degenghost' }, update: {}, create: { username: 'degenghost', displayName: 'DegenGhost', bio: 'KOL manager and Twitter spaces host. 50k+ followers across platforms. Specialized in memecoin launch campaigns and viral thread writing.', tier: 'VERIFIED', isVerified: true } }),
    prisma.user.upsert({ where: { username: 'pumpforge' }, update: {}, create: { username: 'pumpforge', displayName: 'PumpForge', bio: 'Community builder. Built and managed 15+ Telegram communities from 0 to 10k members. Moderation teams, engagement systems, the works.', tier: 'ELITE', isVerified: true } }),
    prisma.user.upsert({ where: { username: 'alphaxdesign' }, update: {}, create: { username: 'alphaxdesign', displayName: 'AlphaXDesign', bio: 'Crypto designer. PFPs, banners, meme packs, animated content. Fast delivery, degen aesthetic. 200+ projects shipped.', tier: 'VERIFIED', isVerified: true } }),
    prisma.user.upsert({ where: { username: 'rektking' }, update: {}, create: { username: 'rektking', displayName: 'RektKing', bio: 'Tokenomics architect and launch strategist. Helped structure 20+ token launches on pump.fun and Raydium. I make numbers go up.', tier: 'VERIFIED', isVerified: true } }),
    prisma.user.upsert({ where: { username: 'sigmaresearch' }, update: {}, create: { username: 'sigmaresearch', displayName: 'SigmaResearch', bio: 'On-chain analyst and alpha researcher. Market reports, competitor analysis, wallet tracking, narrative mapping. 48hr delivery guaranteed.', tier: 'ANON', isVerified: false } }),
  ]);
  console.log('Ensured', others.length, 'demo sellers exist');

  const sellers = [me, ...others];

  // Step 4 — skip listing creation if your account already has some
  const existingCount = await prisma.listing.count({ where: { sellerId: me.id } });
  if (existingCount > 0) {
    console.log(`Your account already owns ${existingCount} listings. Done.`);
    await prisma.$disconnect();
    return;
  }

  const listings = [
    {
      sellerId: me.id,
      title: 'Full Solana smart contract audit + mainnet deploy',
      description: 'I have audited and deployed 40+ Solana programs across DeFi, NFT, and memecoin projects. You get a full line-by-line security review, a written report of all vulnerabilities found, fixes applied, and a clean deploy to mainnet.\n\nEvery audit includes a public report you can share with your community to build trust. Have worked with teams on pump.fun, Magic Eden launchpad, and several private raises.',
      category: 'DEVELOPMENT',
      tags: ['solana', 'audit', 'smart contract', 'rust', 'deploy'],
      packages: [
        { name: 'Basic', description: 'Audit of a single program up to 500 lines. Written report. No deploy.', price: 150, currency: 'USDC', deliveryDays: 5, revisions: 1, features: ['Single program audit', 'Written vulnerability report', 'Up to 500 lines of code', '1 revision'] },
        { name: 'Standard', description: 'Full audit + fixes applied + mainnet deploy. Up to 2,000 lines.', price: 450, currency: 'USDC', deliveryDays: 7, revisions: 2, features: ['Full audit up to 2,000 lines', 'Fixes applied', 'Mainnet deploy', 'Public audit report', '2 revisions'] },
        { name: 'Premium', description: 'Full suite — audit, fixes, deploy, tokenomics review, 30-day monitoring.', price: 1200, currency: 'USDC', deliveryDays: 14, revisions: 5, features: ['Everything in Standard', 'Tokenomics review', '30-day post-launch monitoring', 'Priority comms', '5 revisions'] },
      ],
    },
    {
      sellerId: me.id,
      title: 'Custom Solana program development — DeFi, NFT, or token',
      description: 'Need a custom Solana program built from scratch? I handle the full lifecycle — architecture, development, testing, and deploy. Rust + Anchor framework. Have built staking programs, NFT minters, liquidity pools, and custom token mechanics.',
      category: 'DEVELOPMENT',
      tags: ['solana', 'rust', 'anchor', 'custom program', 'defi'],
      packages: [
        { name: 'Basic', description: 'Simple program up to 300 lines. Basic functionality only.', price: 500, currency: 'USDC', deliveryDays: 7, revisions: 2, features: ['Up to 300 lines', 'Basic functionality', 'Unit tests', '2 revisions'] },
        { name: 'Standard', description: 'Full custom program with complex logic, tests, and deploy.', price: 1500, currency: 'USDC', deliveryDays: 14, revisions: 3, features: ['Unlimited complexity', 'Full test suite', 'Mainnet deploy', 'Documentation', '3 revisions'] },
        { name: 'Premium', description: 'Enterprise-grade program with full audit, docs, and 60-day support.', price: 4000, currency: 'USDC', deliveryDays: 21, revisions: 10, features: ['Everything in Standard', 'Internal audit', '60-day support', 'Architecture consultation', 'NDA available'] },
      ],
    },
    {
      sellerId: sellers[1].id,
      title: 'Twitter spaces host + coordinated X thread campaign',
      description: 'I host Twitter/X spaces for crypto projects and run coordinated thread campaigns. My audience is 50k+ across platforms, majority crypto-native degens and DeFi participants.\n\nI have hosted spaces for pump.fun launches, NFT drops, and DAO announcements. I bring my own audience AND reach out to aligned callers to co-host.',
      category: 'CALLERS_KOLS',
      tags: ['twitter', 'spaces', 'kol', 'thread', 'marketing'],
      packages: [
        { name: 'Basic', description: 'One X thread written and posted from my account. No spaces.', price: 80, currency: 'USDC', deliveryDays: 2, revisions: 1, features: ['1 thread post', 'My 50k+ audience', 'Engagement for 24hrs', '1 revision'] },
        { name: 'Standard', description: 'X spaces host (1hr) + thread campaign. My full network.', price: 250, currency: 'USDC', deliveryDays: 3, revisions: 2, features: ['1hr Twitter space', '3 thread posts', 'Co-host outreach', 'Clip creation', '2 revisions'] },
        { name: 'Premium', description: 'Full coordinated campaign — spaces, threads, 5 aligned callers.', price: 800, currency: 'USDC', deliveryDays: 7, revisions: 3, features: ['2hr Twitter space', '5 coordinated callers', 'Thread campaign', 'Space recording', 'Post-launch follow-up', '3 revisions'] },
      ],
    },
    {
      sellerId: sellers[2].id,
      title: 'Telegram community setup, mod team + first 500 members',
      description: 'I build Telegram communities from zero. Not bots, not fake members — real engaged crypto people who actually talk. I set up the group structure, bots, rules, moderation team, and seed the initial community through my network.',
      category: 'COMMUNITY',
      tags: ['telegram', 'community', 'moderation', 'growth', 'discord'],
      packages: [
        { name: 'Basic', description: 'TG group setup with bots, rules, and starter content.', price: 100, currency: 'USDC', deliveryDays: 3, revisions: 1, features: ['Group setup', 'Bot configuration', 'Rules + pinned messages', 'Starter content pack'] },
        { name: 'Standard', description: 'Full setup + mod team + 500 real members in 2 weeks.', price: 350, currency: 'USDC', deliveryDays: 14, revisions: 2, features: ['Everything in Basic', '3-person mod team', '500 real members', 'Engagement seeding', 'Daily activity for 2 weeks'] },
        { name: 'Premium', description: 'Full community ecosystem — TG + Discord + Twitter + 1,000 members.', price: 900, currency: 'USDC', deliveryDays: 21, revisions: 3, features: ['Telegram + Discord', 'Twitter community', '1,000 members', '30-day management', 'Analytics reporting'] },
      ],
    },
    {
      sellerId: sellers[3].id,
      title: 'Memecoin brand kit — PFP, banner, meme pack + all assets',
      description: 'Full brand kit for your memecoin. I design the PFP character, banner, logo, and a starter meme pack (10 memes) ready to post. Fast delivery, pure degen aesthetic. No corporate garbage, no stock art.',
      category: 'DESIGN_ART',
      tags: ['design', 'pfp', 'meme', 'branding', 'art'],
      packages: [
        { name: 'Basic', description: 'PFP character design only. 3 variations, source files included.', price: 60, currency: 'USDC', deliveryDays: 3, revisions: 2, features: ['PFP character', '3 variations', 'Source files (PNG + SVG)', '2 revisions'] },
        { name: 'Standard', description: 'Full brand kit — PFP, banner, logo, and 10 meme templates.', price: 180, currency: 'USDC', deliveryDays: 5, revisions: 3, features: ['PFP + banner + logo', '10 meme templates', 'Twitter + TG optimized sizes', 'Source files', '3 revisions'] },
        { name: 'Premium', description: 'Everything + animated PFP, GIF pack, and full brand guidelines.', price: 450, currency: 'USDC', deliveryDays: 10, revisions: 5, features: ['Everything in Standard', 'Animated PFP', '20 GIFs', 'Brand style guide', 'Unlimited revisions for 30 days'] },
      ],
    },
    {
      sellerId: sellers[4].id,
      title: 'Pump.fun token launch strategy + tokenomics design',
      description: 'I design the full token launch strategy for pump.fun and Raydium launches. Tokenomics structure, launch timing, liquidity strategy, and community seeding plan. I have helped structure 20+ successful launches.',
      category: 'STRATEGY',
      tags: ['tokenomics', 'strategy', 'pump.fun', 'launch', 'defi'],
      packages: [
        { name: 'Basic', description: 'Tokenomics review + written report with recommendations.', price: 120, currency: 'USDC', deliveryDays: 3, revisions: 1, features: ['Tokenomics audit', 'Written recommendations', 'Distribution analysis', '1 revision'] },
        { name: 'Standard', description: 'Full launch strategy — tokenomics, timing, liquidity, community plan.', price: 350, currency: 'USDC', deliveryDays: 5, revisions: 2, features: ['Full tokenomics design', 'Launch timing strategy', 'Liquidity recommendations', 'Community seeding plan', '2 revisions'] },
        { name: 'Premium', description: 'End-to-end launch support — strategy + 30-day execution guidance.', price: 900, currency: 'USDC', deliveryDays: 7, revisions: 5, features: ['Everything in Standard', '30-day execution support', 'Weekly strategy calls', 'Real-time adjustments', 'Post-launch analysis'] },
      ],
    },
    {
      sellerId: sellers[5].id,
      title: 'Alpha research report — any sector, 48hr delivery',
      description: 'Deep dive research reports on any crypto sector, protocol, or narrative. Competitor analysis, on-chain data, wallet tracking, social sentiment, and forward-looking thesis.',
      category: 'RESEARCH_ALPHA',
      tags: ['research', 'alpha', 'on-chain', 'analysis', 'degen'],
      packages: [
        { name: 'Basic', description: 'Quick sector overview. 1-2 pages, key metrics only.', price: 50, currency: 'USDC', deliveryDays: 2, revisions: 1, features: ['Sector overview', 'Key metrics', 'Top 5 competitors', '1 revision'] },
        { name: 'Standard', description: 'Full research report with on-chain data and thesis.', price: 150, currency: 'USDC', deliveryDays: 3, revisions: 2, features: ['Full research report', 'On-chain data analysis', 'Investment thesis', 'Risk assessment', '2 revisions'] },
        { name: 'Premium', description: 'Deep dive — full report + wallet tracking + ongoing alpha for 30 days.', price: 400, currency: 'USDC', deliveryDays: 5, revisions: 3, features: ['Everything in Standard', 'Wallet tracking', '30-day alpha updates', 'Direct Telegram access', '3 revisions'] },
      ],
    },
  ];

  let created = 0;
  for (const l of listings) {
    const { packages, ...listingData } = l;
    await prisma.listing.create({
      data: { ...listingData, status: 'ACTIVE', isFeatured: Math.random() > 0.5, packages: { create: packages } },
    });
    created++;
    process.stdout.write('.');
  }

  console.log(`\nCreated ${created} listings`);
  console.log('Your account owns the first 2 (Solana audit + custom dev).');
  console.log('Go to /dashboard/listings to edit them.');
  await prisma.$disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
