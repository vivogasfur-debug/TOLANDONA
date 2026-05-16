import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get unique schools from Siswa
  const siswaSchools = await prisma.siswa.findMany({
    select: { namaSekolah: true },
    distinct: ['namaSekolah']
  });
  
  console.log('Sekolah dari data Siswa:', siswaSchools.length);
  
  // Get unique schools from Guru
  const guruSchools = await prisma.guru.findMany({
    select: { sekolah: true },
    distinct: ['sekolah']
  });
  
  console.log('Sekolah dari data Guru:', guruSchools.length);
  
  // Get unique posyandu
  const posyanduList = await prisma.posyandu.findMany({
    select: { posyandu: true },
    distinct: ['posyandu']
  });
  
  console.log('Posyandu:', posyanduList.length);
  
  // Count by category
  const siswaCount = await prisma.siswa.count();
  const guruCount = await prisma.guru.count();
  const posyanduCount = await prisma.posyandu.count();
  const relawanCount = await prisma.relawan.count();
  
  console.log('\n=== Database Summary ===');
  console.log('Total Siswa:', siswaCount);
  console.log('Total Guru:', guruCount);
  console.log('Total Posyandu:', posyanduCount);
  console.log('Total Relawan:', relawanCount);
  
  await prisma.$disconnect();
}

main();
