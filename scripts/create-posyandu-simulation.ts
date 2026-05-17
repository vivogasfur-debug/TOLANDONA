import { db } from '../src/lib/db';

async function createPosyanduSimulation() {
  console.log('Creating posyandu distribution simulation data...');

  // Get posyandu list
  const posyanduData = await db.posyandu.findMany({
    select: { posyandu: true },
    distinct: ['posyandu'],
  });

  const posyanduList = posyanduData.map(p => p.posyandu).filter(Boolean) as string[];
  console.log(`Found ${posyanduList.length} posyandu:`, posyanduList);

  // Clear existing data
  await db.distribusiPosyandu.deleteMany();
  console.log('Cleared existing distribusi posyandu data');

  // Generate data for Dec 2025 - May 2026
  const startDate = new Date(2025, 11, 1); // Dec 1, 2025
  const endDate = new Date(2026, 4, 31); // May 31, 2026

  const records = [];

  // Generate daily records (only weekdays for simulation)
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();

    // Only create records for weekdays (1-5), and randomly skip some days
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && Math.random() > 0.3) {
      // For each posyandu, randomly decide if they have distribution today
      for (const posyandu of posyanduList) {
        if (Math.random() > 0.6) { // 40% chance of having distribution
          // Generate random numbers for each category
          const balitaL = Math.floor(Math.random() * 10) + 5; // 5-15
          const balitaP = Math.floor(Math.random() * 10) + 5; // 5-15
          const bumilP = Math.floor(Math.random() * 5) + 2; // 2-7
          const busuiP = Math.floor(Math.random() * 6) + 3; // 3-9
          const lansiaL = Math.floor(Math.random() * 4) + 1; // 1-5
          const lansiaP = Math.floor(Math.random() * 5) + 2; // 2-7
          const wusP = Math.floor(Math.random() * 8) + 4; // 4-12

          const jumlah = balitaL + balitaP + bumilP + busuiP + lansiaL + lansiaP + wusP;

          records.push({
            namaPosyandu: posyandu,
            balitaL,
            balitaP,
            bumilL: 0,
            bumilP,
            busuiL: 0,
            busuiP,
            lansiaL,
            lansiaP,
            wusL: 0,
            wusP,
            jumlah,
            tanggal: new Date(currentDate),
          });
        }
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Insert all records
  console.log(`Creating ${records.length} distribusi posyandu records...`);

  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await db.distribusiPosyandu.createMany({ data: batch });
    console.log(`Created ${Math.min(i + batchSize, records.length)}/${records.length} records`);
  }

  console.log('✅ Posyandu distribution simulation complete!');

  // Summary
  const totalRecords = await db.distribusiPosyandu.count();
  const uniquePosyandu = await db.distribusiPosyandu.groupBy({
    by: ['namaPosyandu'],
    _count: { id: true },
  });

  console.log('\n📊 Summary:');
  console.log(`  Total records: ${totalRecords}`);
  console.log(`  Unique posyandu: ${uniquePosyandu.length}`);
  uniquePosyandu.forEach(p => {
    console.log(`    - ${p.namaPosyandu}: ${p._count.id} records`);
  });
}

createPosyanduSimulation()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
