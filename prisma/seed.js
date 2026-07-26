const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  try {
    // 1. Create or ensure the production user account exists
    await p.user.upsert({
      where: { id: 'cmqz9h65j000050kwaa3pt6ac' },
      update: {},
      create: { 
        id: 'cmqz9h65j000050kwaa3pt6ac', 
        email: 'admin@PredicTX.com', 
        name: 'Saurabh', 
        balance: 50000 
      }
    });

    // 2. Initialize live dynamic rounds for the crypto dashboard
    await p.round.createMany({
      data: [
        { roundId: 'INIT_BTC', coin: 'BTCUSDT', entryPrice: 62220, duration: 30, status: 'OPEN' },
        { roundId: 'INIT_ETH', coin: 'ETHUSDT', entryPrice: 3450, duration: 30, status: 'OPEN' },
        { roundId: 'INIT_SOL', coin: 'SOLUSDT', entryPrice: 145, duration: 30, status: 'OPEN' }
      ],
      skipDuplicates: true
    });

    console.log('✅ DATABASE FIXED - PRODUCTION READY!');
  } catch (e) {
    console.error('Error seeding database:', e);
  } finally {
    await p.$disconnect();
  }
}

main();