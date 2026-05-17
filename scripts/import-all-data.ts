import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface GuruCSV {
  ID: string;
  Nama: string;
  JK: string;
  Sekolah: string;
  Alamat: string;
  NUPTK: string;
  'Jenis Tendik': string;
  NIK: string;
  NIP: string;
  'Tempat Lahir': string;
  'Tanggal Lahir': string;
  Umur: string;
}

interface SiswaCSV {
  ID: string;
  Nama: string;
  NamaSekolah: string;
  JK: string;
  Alamat: string;
  'Tempat Lahir': string;
  'Tanggal Lahir': string;
  NISN: string;
  NIK: string;
  Kelas: string;
  Umur: string;
}

interface PosyanduCSV {
  ID: string;
  Nama: string;
  Posyandu: string;
  Alamat: string;
  KATEGORI: string;
  JK: string;
  NIK: string;
  'TEMPAT Lahir': string;
  'Tgl LAHIR': string;
  Umur: string;
}

interface RelawanCSV {
  ID: string;
  Nama: string;
  'Jenis Kelamin': string;
  Divisi: string;
  Jabatan: string;
  NIK: string;
  'Tempat Lahir': string;
  'Tanggal Lahir': string;
  Umur: string;
  'Gaji Pokok': string;
  'Hari Kerja': string;
  Bonus: string;
  'Total Gaji': string;
}

async function clearAllData() {
  console.log('🗑️  Clearing all data...');
  
  await prisma.payroll.deleteMany({});
  await prisma.distribusi.deleteMany({});
  await prisma.beritaAcaraDistribusi.deleteMany({});
  await prisma.beritaAcara.deleteMany({});
  await prisma.foodDiary.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.exportSetting.deleteMany({});
  await prisma.guru.deleteMany({});
  await prisma.siswa.deleteMany({});
  await prisma.posyandu.deleteMany({});
  await prisma.relawan.deleteMany({});
  
  console.log('✅ All data cleared');
}

async function importGuru() {
  console.log('📥 Importing Guru data...');
  
  const filePath = path.join(process.cwd(), 'upload', 'data pm tolandona fix - Guru (3).csv');
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as GuruCSV[];

  let count = 0;
  for (const row of records) {
    try {
      await prisma.guru.create({
        data: {
          originalId: row.ID,
          nama: row.Nama || '',
          jk: row.JK || null,
          sekolah: row.Sekolah || null,
          alamat: row.Alamat || null,
          nuptk: row.NUPTK || null,
          jenisTendik: row['Jenis Tendik'] || null,
          nik: row.NIK || null,
          nip: row.NIP || null,
          tempatLahir: row['Tempat Lahir'] || null,
          tanggalLahir: row['Tanggal Lahir'] || null,
          umur: row.Umur || null,
        }
      });
      count++;
    } catch (error) {
      console.error(`Error importing guru ${row.ID}:`, error);
    }
  }
  
  console.log(`✅ Imported ${count} Guru records`);
  return count;
}

async function importSiswa() {
  console.log('📥 Importing Siswa data...');
  
  const filePath = path.join(process.cwd(), 'upload', 'data pm tolandona fix - Siswa (4).csv');
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as SiswaCSV[];

  let count = 0;
  for (const row of records) {
    try {
      await prisma.siswa.create({
        data: {
          originalId: row.ID,
          nama: row.Nama || '',
          namaSekolah: row.NamaSekolah || null,
          jk: row.JK || null,
          alamat: row.Alamat || null,
          tempatLahir: row['Tempat Lahir'] || null,
          tanggalLahir: row['Tanggal Lahir'] || null,
          nisn: row.NISN || null,
          nik: row.NIK || null,
          kelas: row.Kelas || null,
          umur: row.Umur || null,
        }
      });
      count++;
    } catch (error) {
      console.error(`Error importing siswa ${row.ID}:`, error);
    }
  }
  
  console.log(`✅ Imported ${count} Siswa records`);
  return count;
}

async function importPosyandu() {
  console.log('📥 Importing Posyandu data...');
  
  const filePath = path.join(process.cwd(), 'upload', 'data pm tolandona fix - Posyandu (3).csv');
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as PosyanduCSV[];

  let count = 0;
  for (const row of records) {
    try {
      await prisma.posyandu.create({
        data: {
          originalId: row.ID,
          nama: row.Nama || '',
          posyandu: row.Posyandu || null,
          alamat: row.Alamat || null,
          kategori: row.KATEGORI || null,
          jk: row.JK || null,
          nik: row.NIK || null,
          tempatLahir: row['TEMPAT Lahir'] || null,
          tanggalLahir: row['Tgl LAHIR'] || null,
          umur: row.Umur || null,
        }
      });
      count++;
    } catch (error) {
      console.error(`Error importing posyandu ${row.ID}:`, error);
    }
  }
  
  console.log(`✅ Imported ${count} Posyandu records`);
  return count;
}

async function importRelawan() {
  console.log('📥 Importing Relawan data...');
  
  const filePath = path.join(process.cwd(), 'upload', 'data pm tolandona fix - relawan (3).csv');
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as RelawanCSV[];

  let count = 0;
  for (const row of records) {
    try {
      // Parse gaji - remove dots and convert to number
      const gajiPokok = row['Gaji Pokok'] ? row['Gaji Pokok'].replace(/\./g, '').replace(/,/g, '') : '0';
      const hariKerja = row['Hari Kerja'] || '0';
      const bonus = row.Bonus && row.Bonus !== '-' ? row.Bonus.replace(/\./g, '') : '0';
      const totalGaji = row['Total Gaji'] ? row['Total Gaji'].replace(/\./g, '') : '0';

      await prisma.relawan.create({
        data: {
          originalId: row.ID,
          nama: row.Nama || '',
          jk: row['Jenis Kelamin'] || null,
          divisi: row.Divisi || null,
          jabatan: row.Jabatan || null,
          nik: row.NIK || null,
          tempatLahir: row['Tempat Lahir'] || null,
          tanggalLahir: row['Tanggal Lahir'] || null,
          umur: row.Umur || null,
          gajiPokok: gajiPokok,
          hariKerja: hariKerja,
          bonus: bonus,
          totalGaji: totalGaji,
        }
      });
      count++;
    } catch (error) {
      console.error(`Error importing relawan ${row.ID}:`, error);
    }
  }
  
  console.log(`✅ Imported ${count} Relawan records`);
  return count;
}

async function createDistribusiSimulation() {
  console.log('📊 Creating Distribusi simulation (Dec 2025 - May 2026)...');
  
  // Get unique schools from siswa data
  const siswa = await prisma.siswa.findMany({
    select: { namaSekolah: true, kelas: true, jk: true }
  });
  
  // Group by school
  const schoolMap = new Map<string, { kelas: Map<string, { L: number; P: number }> }>();
  
  for (const s of siswa) {
    if (!s.namaSekolah) continue;
    
    if (!schoolMap.has(s.namaSekolah)) {
      schoolMap.set(s.namaSekolah, { kelas: new Map() });
    }
    
    const school = schoolMap.get(s.namaSekolah)!;
    const kelas = s.kelas || '';
    
    if (!school.kelas.has(kelas)) {
      school.kelas.set(kelas, { L: 0, P: 0 });
    }
    
    const kelasData = school.kelas.get(kelas)!;
    if (s.jk === 'L') kelasData.L++;
    else if (s.jk === 'P') kelasData.P++;
  }
  
  // Get guru data per school
  const guru = await prisma.guru.findMany({
    select: { sekolah: true, jenisTendik: true, jk: true }
  });
  
  const guruMap = new Map<string, { kepsek: { L: number; P: number }; guru: { L: number; P: number }; tendik: { L: number; P: number }; nonTendik: { L: number; P: number } }>();
  
  for (const g of guru) {
    if (!g.sekolah) continue;
    
    if (!guruMap.has(g.sekolah)) {
      guruMap.set(g.sekolah, {
        kepsek: { L: 0, P: 0 },
        guru: { L: 0, P: 0 },
        tendik: { L: 0, P: 0 },
        nonTendik: { L: 0, P: 0 }
      });
    }
    
    const schoolGuru = guruMap.get(g.sekolah)!;
    const jk = g.jk === 'L' ? 'L' : g.jk === 'P' ? 'P' : null;
    
    if (g.jenisTendik?.toLowerCase().includes('kepala')) {
      if (jk === 'L') schoolGuru.kepsek.L++;
      else if (jk === 'P') schoolGuru.kepsek.P++;
    } else if (g.jenisTendik?.toLowerCase().includes('guru')) {
      if (jk === 'L') schoolGuru.guru.L++;
      else if (jk === 'P') schoolGuru.guru.P++;
    } else if (g.jenisTendik?.toLowerCase().includes('tendik')) {
      if (jk === 'L') schoolGuru.tendik.L++;
      else if (jk === 'P') schoolGuru.tendik.P++;
    } else {
      if (jk === 'L') schoolGuru.nonTendik.L++;
      else if (jk === 'P') schoolGuru.nonTendik.P++;
    }
  }
  
  // Generate dates from Dec 2025 to May 2026 (every 2 weeks)
  const dates: Date[] = [];
  const startDate = new Date('2025-12-01');
  const endDate = new Date('2026-05-31');
  
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 14); // Every 2 weeks
  }
  
  // Create distribusi records
  let count = 0;
  const schools = Array.from(schoolMap.entries());
  
  for (const date of dates) {
    // Distribute to random subset of schools each period
    const numSchools = Math.floor(schools.length * 0.6) + Math.floor(Math.random() * schools.length * 0.3);
    const selectedSchools = schools.sort(() => Math.random() - 0.5).slice(0, numSchools);
    
    for (const [schoolName, data] of selectedSchools) {
      const kelasData = data.kelas;
      
      // Calculate values with some variation (70-100% of actual)
      const variation = () => 0.7 + Math.random() * 0.3;
      
      const getValue = (kelas: string, jk: 'L' | 'P') => {
        const val = kelasData.get(kelas)?.[jk] || 0;
        return Math.floor(val * variation());
      };
      
      // Get guru data
      const gData = guruMap.get(schoolName) || { kepsek: { L: 0, P: 0 }, guru: { L: 0, P: 0 }, tendik: { L: 0, P: 0 }, nonTendik: { L: 0, P: 0 } };
      
      // Calculate totals
      const siswaTotal = 
        getValue('A', 'L') + getValue('A', 'P') +
        getValue('B', 'L') + getValue('B', 'P') +
        getValue('1', 'L') + getValue('1', 'P') +
        getValue('2', 'L') + getValue('2', 'P') +
        getValue('3', 'L') + getValue('3', 'P') +
        getValue('4', 'L') + getValue('4', 'P') +
        getValue('5', 'L') + getValue('5', 'P') +
        getValue('6', 'L') + getValue('6', 'P') +
        getValue('7', 'L') + getValue('7', 'P') +
        getValue('8', 'L') + getValue('8', 'P') +
        getValue('9', 'L') + getValue('9', 'P') +
        getValue('10', 'L') + getValue('10', 'P') +
        getValue('11', 'L') + getValue('11', 'P') +
        getValue('12', 'L') + getValue('12', 'P');
      
      const guruTotal = gData.kepsek.L + gData.kepsek.P + gData.guru.L + gData.guru.P + gData.tendik.L + gData.tendik.P + gData.nonTendik.L + gData.nonTendik.P;
      const ujiOrg = Math.floor(Math.random() * 5) + 1; // 1-5
      
      const jumlah = siswaTotal + guruTotal + ujiOrg;
      
      if (jumlah > 0) {
        await prisma.distribusi.create({
          data: {
            namaSekolah: schoolName,
            // TK/PAUD
            klsAL: getValue('A', 'L'),
            klsAP: getValue('A', 'P'),
            klsBL: getValue('B', 'L'),
            klsBP: getValue('B', 'P'),
            // SD
            kls1L: getValue('1', 'L'),
            kls1P: getValue('1', 'P'),
            kls2L: getValue('2', 'L'),
            kls2P: getValue('2', 'P'),
            kls3L: getValue('3', 'L'),
            kls3P: getValue('3', 'P'),
            kls4L: getValue('4', 'L'),
            kls4P: getValue('4', 'P'),
            kls5L: getValue('5', 'L'),
            kls5P: getValue('5', 'P'),
            kls6L: getValue('6', 'L'),
            kls6P: getValue('6', 'P'),
            // SMP
            kls7L: getValue('7', 'L'),
            kls7P: getValue('7', 'P'),
            kls8L: getValue('8', 'L'),
            kls8P: getValue('8', 'P'),
            kls9L: getValue('9', 'L'),
            kls9P: getValue('9', 'P'),
            // SMA
            kls10L: getValue('10', 'L'),
            kls10P: getValue('10', 'P'),
            kls11L: getValue('11', 'L'),
            kls11P: getValue('11', 'P'),
            kls12L: getValue('12', 'L'),
            kls12P: getValue('12', 'P'),
            // Guru
            kepsekL: gData.kepsek.L,
            kepsekP: gData.kepsek.P,
            guruL: gData.guru.L,
            guruP: gData.guru.P,
            tendikL: gData.tendik.L,
            tendikP: gData.tendik.P,
            nonTendikL: gData.nonTendik.L,
            nonTendikP: gData.nonTendik.P,
            // Other
            ujiOrganoleptik: ujiOrg,
            jumlah: jumlah,
            tanggal: date,
          }
        });
        count++;
      }
    }
  }
  
  console.log(`✅ Created ${count} Distribusi records`);
  return count;
}

async function createPayrollSimulation() {
  console.log('💰 Creating Payroll simulation (Dec 2025 - May 2026)...');
  
  const relawan = await prisma.relawan.findMany();
  
  // Generate periods from Dec 2025 to May 2026 (2-week periods)
  const periods: { periode: number; tahun: number; mulai: Date; selesai: Date }[] = [];
  
  let periodeNum = 25; // Start from period 25 (second half of December 2025)
  let currentStart = new Date('2025-12-15');
  
  while (currentStart <= new Date('2026-05-31')) {
    const selesai = new Date(currentStart);
    selesai.setDate(selesai.getDate() + 13);
    
    const tahun = currentStart.getFullYear();
    const periode = periodeNum > 26 ? periodeNum - 26 : periodeNum;
    
    periods.push({
      periode,
      tahun: periodeNum > 26 ? tahun : 2025,
      mulai: new Date(currentStart),
      selesai: new Date(selesai),
    });
    
    currentStart.setDate(currentStart.getDate() + 14);
    periodeNum++;
    if (periodeNum > 26) periodeNum = 1;
  }
  
  let count = 0;
  
  for (const rel of relawan) {
    const gajiPokok = parseInt(rel.gajiPokok || '0') || 150000;
    
    for (const period of periods) {
      // Random hari kerja (8-14 days)
      const hariKerja = Math.floor(Math.random() * 7) + 8;
      const gajiHarian = Math.floor(gajiPokok / 12); // Daily rate
      const bonus = Math.random() > 0.8 ? Math.floor(Math.random() * 500000) : 0;
      const potongan = Math.random() > 0.9 ? Math.floor(Math.random() * 200000) : 0;
      const totalGaji = (gajiHarian * hariKerja) + bonus - potongan;
      
      // Random status
      const isPaid = Math.random() > 0.2;
      const tanggalBayar = isPaid ? new Date(period.selesai.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null;
      
      await prisma.payroll.create({
        data: {
          relawanId: rel.id,
          periode: period.periode,
          tahun: period.tahun,
          tanggalMulai: period.mulai,
          tanggalSelesai: period.selesai,
          gajiHarian,
          hariKerja,
          bonus,
          potongan,
          totalGaji,
          status: isPaid ? 'paid' : 'pending',
          tanggalBayar,
          keterangan: isPaid ? 'Dibayar tepat waktu' : 'Menunggu pembayaran',
        }
      });
      count++;
    }
  }
  
  console.log(`✅ Created ${count} Payroll records`);
  return count;
}

async function createFoodDiarySimulation() {
  console.log('🍎 Creating Food Diary simulation (Dec 2025 - May 2026)...');
  
  const foods = [
    { name: 'Nasi Putih', category: 'Karbohidrat', calories: 180, protein: 4, carbs: 40, fat: 0.5, fiber: 0.6 },
    { name: 'Ayam Goreng', category: 'Protein', calories: 260, protein: 28, carbs: 2, fat: 16, fiber: 0 },
    { name: 'Sayur Bayam', category: 'Sayuran', calories: 23, protein: 3, carbs: 4, fat: 0.3, fiber: 2.4 },
    { name: 'Tempe Goreng', category: 'Protein', calories: 193, protein: 18, carbs: 8, fat: 11, fiber: 1.5 },
    { name: 'Tahu Goreng', category: 'Protein', calories: 139, protein: 9, carbs: 3, fat: 11, fiber: 0.5 },
    { name: 'Sop Ayam', category: 'Sup', calories: 150, protein: 15, carbs: 12, fat: 5, fiber: 2 },
    { name: 'Buah Pisang', category: 'Buah', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
    { name: 'Telur Rebus', category: 'Protein', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
    { name: 'Bubur Ayam', category: 'Karbohidrat', calories: 200, protein: 12, carbs: 25, fat: 6, fiber: 1 },
    { name: 'Es Teh Manis', category: 'Minuman', calories: 70, protein: 0, carbs: 18, fat: 0, fiber: 0 },
  ];
  
  const mealTypes = ['sarapan', 'makanSiang', 'makanMalam', 'snack'];
  const ageGroups = ['dewasa', 'anak'];
  
  let count = 0;
  const startDate = new Date('2025-12-01');
  const endDate = new Date('2026-05-31');
  
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    // Create random entries for each day
    const numEntries = Math.floor(Math.random() * 15) + 10; // 10-25 entries per day
    
    for (let i = 0; i < numEntries; i++) {
      const food = foods[Math.floor(Math.random() * foods.length)];
      const amount = Math.floor(Math.random() * 150) + 50; // 50-200g
      const multiplier = amount / 100;
      
      await prisma.foodDiary.create({
        data: {
          date: new Date(currentDate),
          ageGroup: ageGroups[Math.floor(Math.random() * ageGroups.length)],
          foodId: foods.indexOf(food) + 1,
          foodName: food.name,
          category: food.category,
          amount,
          calories: Math.round(food.calories * multiplier),
          protein: Math.round(food.protein * multiplier * 10) / 10,
          carbs: Math.round(food.carbs * multiplier * 10) / 10,
          fat: Math.round(food.fat * multiplier * 10) / 10,
          fiber: Math.round(food.fiber * multiplier * 10) / 10,
          mealType: mealTypes[Math.floor(Math.random() * mealTypes.length)],
          notes: Math.random() > 0.7 ? 'Catatan: segar dan bergizi' : null,
        }
      });
      count++;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  console.log(`✅ Created ${count} Food Diary records`);
  return count;
}

async function createBeritaAcaraSimulation() {
  console.log('📝 Creating Berita Acara simulation...');
  
  const judulList = [
    'Serah Terima Paket Makanan',
    'Koordinasi Distribusi',
    'Rapat Evaluasi Program',
    'Pemeriksaan Kualitas Makanan',
    'Sosialisasi Gizi Seimbang',
  ];
  
  let count = 0;
  const startDate = new Date('2025-12-01');
  const endDate = new Date('2026-05-31');
  
  let currentDate = new Date(startDate);
  let nomor = 1;
  
  while (currentDate <= endDate) {
    // Create 2-3 berita acara per week
    const numBA = Math.floor(Math.random() * 2) + 2;
    
    for (let i = 0; i < numBA; i++) {
      const judul = judulList[Math.floor(Math.random() * judulList.length)];
      
      await prisma.beritaAcara.create({
        data: {
          nomor: `BA/${String(nomor).padStart(3, '0')}/PM-TLD/${currentDate.getFullYear()}`,
          tanggal: new Date(currentDate),
          judul,
          lokasi: 'Kantor PM TOLANDONA',
          peserta: String(Math.floor(Math.random() * 10) + 5),
          uraian: `<p>Kegiatan ${judul} telah dilaksanakan dengan baik pada tanggal ${currentDate.toLocaleDateString('id-ID')}.</p><p>Hadir dalam kegiatan ini sebanyak ${Math.floor(Math.random() * 10) + 5} peserta.</p>`,
          kesimpulan: 'Kegiatan berjalan lancar sesuai rencana.',
          tindakLanjut: 'Melanjutkan kegiatan sesuai jadwal.',
          picNama: 'Koordinator Program',
          picJabatan: 'Koordinator',
          status: 'selesai',
          kategori: 'Distribusi',
        }
      });
      count++;
      nomor++;
    }
    
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  console.log(`✅ Created ${count} Berita Acara records`);
  return count;
}

async function ensureAdminUser() {
  console.log('👤 Ensuring admin user exists...');
  
  const existing = await prisma.user.findUnique({
    where: { email: 'admin@tolandona.go.id' }
  });
  
  if (!existing) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: 'admin@tolandona.go.id',
        name: 'Administrator',
        role: 'admin',
        password: hashedPassword,
      }
    });
    console.log('✅ Admin user created');
  } else {
    console.log('✅ Admin user already exists');
  }
}

async function main() {
  console.log('🚀 Starting full data import and simulation...\n');
  
  // Clear existing data
  await clearAllData();
  
  // Import CSV data
  const guruCount = await importGuru();
  const siswaCount = await importSiswa();
  const posyanduCount = await importPosyandu();
  const relawanCount = await importRelawan();
  
  // Create simulations
  const distribusiCount = await createDistribusiSimulation();
  const payrollCount = await createPayrollSimulation();
  const foodDiaryCount = await createFoodDiarySimulation();
  const baCount = await createBeritaAcaraSimulation();
  
  // Ensure admin user
  await ensureAdminUser();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`👨‍🏫 Guru      : ${guruCount} records`);
  console.log(`👨‍🎓 Siswa     : ${siswaCount} records`);
  console.log(`👶 Posyandu  : ${posyanduCount} records`);
  console.log(`🤝 Relawan   : ${relawanCount} records`);
  console.log(`📦 Distribusi: ${distribusiCount} records`);
  console.log(`💰 Payroll   : ${payrollCount} records`);
  console.log(`🍎 Food Diary: ${foodDiaryCount} records`);
  console.log(`📝 Berita Acara: ${baCount} records`);
  console.log('='.repeat(50));
  console.log('\n✅ All data imported and simulated successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
