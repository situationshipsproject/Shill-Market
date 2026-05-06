const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const MERCHANT_WALLET = '0x8BC745c36B5E39bb0E9BF0129E197E55F28F4d48';
const MY_WALLET       = '0xc286b1956c7691d678520e370727D8aB57328556';
const MY_PRIVY_ID     = 'did:privy:cmorra6j2001h0dl83ztdjg8a';

async function run() {
  // --- Merchant: head super-admin (upsert by wallet) ---
  const merchant = await prisma.user.upsert({
    where: { walletAddress: MERCHANT_WALLET },
    update: { isAdmin: true, isSuperAdmin: true, tier: 'INSTITUTION', isVerified: true },
    create: {
      walletAddress: MERCHANT_WALLET,
      username: 'merchant',
      displayName: 'Merchant',
      tier: 'INSTITUTION',
      isVerified: true,
      isAdmin: true,
      isSuperAdmin: true,
    },
  });
  console.log('Merchant (super admin):', merchant.id, merchant.username);

  // --- Your account: find by privyUserId, promote to admin ---
  const me = await prisma.user.findUnique({ where: { privyUserId: MY_PRIVY_ID } });
  if (me) {
    await prisma.user.update({
      where: { id: me.id },
      data: {
        isAdmin: true,
        walletAddress: me.walletAddress ?? MY_WALLET,
      },
    });
    console.log('Your account promoted to admin:', me.id, me.username);
  } else {
    // Fallback: upsert by wallet if privyUserId not found yet
    const byWallet = await prisma.user.upsert({
      where: { walletAddress: MY_WALLET },
      update: { isAdmin: true },
      create: {
        walletAddress: MY_WALLET,
        isAdmin: true,
      },
    });
    console.log('Your account promoted to admin (by wallet):', byWallet.id);
  }

  await prisma.$disconnect();
  console.log('Done.');
}

run().catch(e => { console.error(e); process.exit(1); });
