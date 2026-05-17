import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to generate random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper to generate random number
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to pick random item from array
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Date range
const START_DATE = new Date('2025-12-01');
const END_DATE = new Date('2026-05-31');

// Schools list
const SCHOOLS = [
  'SDN 1 SANGIA WAMBULU', 'SDN 2 SANGIA WAMBULU', 'SDN 3 SANGIA WAMBULU',
  'SDN 4 SANGIA WAMBULU', 'SDN 5 SANGIA WAMBULU', 'SDN 6 SANGIA WAMBULU',
  'SDN 7 SANGIA WAMBULU', 'SDN 8 SANGIA WAMBULU',
  'SMP 2 BUTON TENGAH', 'SMP 8 BUTON TENGAH',
  'SMAN 1 SANGIA WAMBULU', 'SMAS LAKINA LIMBO',
  'MI AL-AMIN', 'RA AL AMIN', 'RA AL MAWADAH', 'RA SHAFHA MARWAH',
  'TK HANDAYANI', 'TK MOLAGINA', 'TK MANDIRI ANALALAKI',
  'TK PKK DODA BAHARI', 'TK LAKINALIMBO 1', 'TK LAKINALIMBO 2'
];

const SPPG_NAMES = ['Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gunawan', 'Hani'];
const PENERIMA_NAMES = ['Kepala Sekolah', 'Guru', 'Staff TU', 'Ketua Komite', 'Wali Kelas'];
const JABATAN_LIST = ['Kepala Sekolah', 'Wakil Kepala', 'Guru', 'Staff TU', 'Koordinator'];

// Barang categories and items
const BARANG_CATEGORIES = [
  { nama: 'Bahan Makanan Segar', items: ['Beras Premium', 'Beras Medium', 'Telur Ayam', 'Ayam Broiler', 'Ikan Segar', 'Sayur Bayam', 'Sayur Kangkung', 'Wortel', 'Kentang', 'Tomat', 'Cabai Merah', 'Bawang Merah', 'Bawang Putih'] },
  { nama: 'Bahan Makanan Kering', items: ['Minyak Goreng', 'Gula Pasir', 'Tepung Terigu', 'Tepung Beras', 'Mie Instan', 'Bihun', 'Susu Bubuk', 'Kacang Tanah', 'Kacang Hijau'] },
  { nama: 'Bumbu Dapur', items: ['Garam', 'Merica Bubuk', 'Ketumbar', 'Jinten', 'Lengkuas', 'Serai', 'Daun Salam', 'Saus Tiram', 'Kecap Manis'] },
  { nama: 'Alat Konsumsi', items: ['Plastik Wrap', 'Wadah Makanan', 'Sendok Plastik', 'Garpu Plastik', 'Piring Kertas', 'Gelas Kertas', 'Tissue Makanan'] },
  { nama: 'Peralatan Dapur', items: ['Kompor Gas', 'Gas LPG 3kg', 'Panci', 'Wajan', 'Talenan', 'Pisau Dapur', 'Sutil', 'Saringan'] },
];

async function createBeritaAcaraDistribusi() {
  console.log('📝 Creating Berita Acara Distribusi (Dec 2025 - May 2026)...');
  
  let count = 0;
  let nomor = 1;
  
  // Get existing distribusi data
  const distribusiList = await prisma.distribusi.findMany({
    select: { id: true, namaSekolah: true, tanggal: true, jumlah: true },
    orderBy: { tanggal: 'asc' }
  });
  
  // Group by date
  const dateGroups = new Map<string, typeof distribusiList>();
  for (const d of distribusiList) {
    const dateKey = d.tanggal.toISOString().split('T')[0];
    if (!dateGroups.has(dateKey)) {
      dateGroups.set(dateKey, []);
    }
    dateGroups.get(dateKey)!.push(d);
  }
  
  // Create BA for each date
  for (const [dateKey, items] of dateGroups) {
    const date = new Date(dateKey);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Create BA for each school on this date
    for (const item of items) {
      const jam = `${String(randomInt(7, 10)).padStart(2, '0')}:${String(randomInt(0, 59)).padStart(2, '0')}`;
      
      await prisma.beritaAcaraDistribusi.create({
        data: {
          nomor: `BA/DS/${String(nomor).padStart(4, '0')}/PM-TLD/${year}`,
          tanggal: date,
          jam,
          namaSekolah: item.namaSekolah,
          jumlahPaket: item.jumlah,
          kondisi: randomPick(['Baik', 'Baik', 'Baik', 'Sebagian Rusak']),
          sppgNama: randomPick(SPPG_NAMES),
          sppgInstansi: 'PM TOLANDONA',
          penerimaNama: randomPick(PENERIMA_NAMES),
          penerimaJabatan: randomPick(JABATAN_LIST),
          keterangan: Math.random() > 0.7 ? 'Pengiriman tepat waktu' : null,
          status: 'selesai',
          distribusiId: item.id,
        }
      });
      count++;
      nomor++;
    }
  }
  
  console.log(`✅ Created ${count} Berita Acara Distribusi records`);
  return count;
}

async function createBarangDanTransaksi() {
  console.log('📦 Creating Barang dan Transaksi Gudang...');
  
  // Check if barang already exists
  const existingBarang = await prisma.barang.count();
  if (existingBarang > 0) {
    console.log(`✅ Barang already has ${existingBarang} records, skipping...`);
    return { barangCount: existingBarang, transaksiCount: await prisma.barangTransaksi.count() };
  }
  
  let barangCount = 0;
  let transaksiCount = 0;
  
  // Create categories and items
  for (const category of BARANG_CATEGORIES) {
    // Create category
    const kat = await prisma.barangKategori.create({
      data: {
        nama: category.nama,
        deskripsi: `Kategori ${category.nama}`,
      }
    });
    
    // Create items in category
    for (const itemName of category.items) {
      const kode = `${category.nama.substring(0, 3).toUpperCase()}-${String(barangCount + 1).padStart(3, '0')}`;
      const stokAwal = randomInt(50, 500);
      const harga = randomInt(5000, 100000);
      
      await prisma.barang.create({
        data: {
          kode,
          nama: itemName,
          kategoriId: kat.id,
          satuan: randomPick(['kg', 'liter', 'pcs', 'dus', 'bungkus', 'botol']),
          stok: stokAwal,
          stokMin: randomInt(10, 50),
          harga,
          lokasi: `Gudang ${String.fromCharCode(65 + (barangCount % 5))}`,
          keterangan: null,
          status: 'aktif',
        }
      });
      barangCount++;
    }
  }
  
  console.log(`✅ Created ${barangCount} Barang records`);
  
  // Get all barang for transactions
  const barangList = await prisma.barang.findMany();
  
  // Create transactions from Dec 2025 to May 2026
  const current = new Date(START_DATE);
  while (current <= END_DATE) {
    // 3-8 transactions per day
    const numTrans = randomInt(3, 8);
    
    for (let i = 0; i < numTrans; i++) {
      const barang = randomPick(barangList);
      const jenis = Math.random() > 0.4 ? 'masuk' : 'keluar';
      const jumlah = randomInt(5, 100);
      
      await prisma.barangTransaksi.create({
        data: {
          barangId: barang.id,
          jenis,
          jumlah,
          hargaSatuan: barang.harga,
          totalHarga: jumlah * barang.harga,
          tanggal: new Date(current),
          keterangan: jenis === 'masuk' ? 'Pembelian dari supplier' : 'Distribusi ke sekolah',
          referensi: `INV/${String(transaksiCount + 1).padStart(5, '0')}`,
          penerima: jenis === 'keluar' ? randomPick(SCHOOLS) : null,
          pengirim: jenis === 'masuk' ? randomPick(['Supplier A', 'Supplier B', 'Supplier C', 'Distributor PM']) : null,
        }
      });
      transaksiCount++;
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  console.log(`✅ Created ${transaksiCount} Barang Transaksi records`);
  return { barangCount, transaksiCount };
}

async function createMorePayroll() {
  console.log('💰 Creating more Payroll records...');
  
  const relawan = await prisma.relawan.findMany();
  
  // Generate periods from Dec 2025 to May 2026 (2-week periods)
  const periods: { periode: number; tahun: number; mulai: Date; selesai: Date }[] = [];
  
  let periodeNum = 25; // Start from period 25 (second half of December 2025)
  let currentStart = new Date('2025-12-15');
  
  while (currentStart <= new Date('2026-05-31')) {
    const selesai = new Date(currentStart);
    selesai.setDate(selesai.getDate() + 13);
    
    const tahun = periodeNum > 26 ? 2026 : 2025;
    const periode = periodeNum > 26 ? periodeNum - 26 : periodeNum;
    
    periods.push({
      periode,
      tahun,
      mulai: new Date(currentStart),
      selesai: new Date(selesai),
    });
    
    currentStart.setDate(currentStart.getDate() + 14);
    periodeNum++;
    if (periodeNum > 26) periodeNum = 1;
  }
  
  // Check existing payroll
  const existingPayroll = await prisma.payroll.count();
  if (existingPayroll > 0) {
    console.log('✅ Payroll already exists, skipping...');
    return existingPayroll;
  }
  
  let count = 0;
  
  for (const rel of relawan) {
    const gajiPokok = parseInt(rel.gajiPokok || '0') || 150000;
    
    for (const period of periods) {
      // Random hari kerja (8-14 days)
      const hariKerja = randomInt(8, 14);
      const gajiHarian = Math.floor(gajiPokok / 12);
      const bonus = Math.random() > 0.8 ? randomInt(50000, 500000) : 0;
      const potongan = Math.random() > 0.9 ? randomInt(0, 200000) : 0;
      const totalGaji = (gajiHarian * hariKerja) + bonus - potongan;
      
      const isPaid = Math.random() > 0.2;
      const tanggalBayar = isPaid ? new Date(period.selesai.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000) : null;
      
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

async function createFoodDiary() {
  console.log('🍎 Creating Food Diary records (Dec 2025 - May 2026)...');
  
  // Check existing
  const existing = await prisma.foodDiary.count();
  if (existing > 0) {
    console.log('✅ Food Diary already exists, skipping...');
    return existing;
  }
  
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
    { name: 'Ikan Bakar', category: 'Protein', calories: 180, protein: 25, carbs: 0, fat: 8, fiber: 0 },
    { name: 'Sayur Sop', category: 'Sayuran', calories: 45, protein: 2, carbs: 8, fat: 1, fiber: 2 },
    { name: 'Nasi Goreng', category: 'Karbohidrat', calories: 300, protein: 8, carbs: 45, fat: 10, fiber: 2 },
    { name: 'Mie Goreng', category: 'Karbohidrat', calories: 280, protein: 6, carbs: 40, fat: 12, fiber: 1 },
    { name: 'Buah Apel', category: 'Buah', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
    { name: 'Susu UHT', category: 'Minuman', calories: 120, protein: 8, carbs: 12, fat: 5, fiber: 0 },
  ];
  
  const mealTypes = ['sarapan', 'makanSiang', 'makanMalam', 'snack'];
  const ageGroups = ['dewasa', 'anak'];
  
  let count = 0;
  const current = new Date(START_DATE);
  
  while (current <= END_DATE) {
    // 15-30 entries per day
    const numEntries = randomInt(15, 30);
    
    for (let i = 0; i < numEntries; i++) {
      const food = randomPick(foods);
      const amount = randomInt(50, 200);
      const multiplier = amount / 100;
      
      await prisma.foodDiary.create({
        data: {
          date: new Date(current),
          ageGroup: randomPick(ageGroups),
          foodId: foods.indexOf(food) + 1,
          foodName: food.name,
          category: food.category,
          amount,
          calories: Math.round(food.calories * multiplier),
          protein: Math.round(food.protein * multiplier * 10) / 10,
          carbs: Math.round(food.carbs * multiplier * 10) / 10,
          fat: Math.round(food.fat * multiplier * 10) / 10,
          fiber: Math.round(food.fiber * multiplier * 10) / 10,
          mealType: randomPick(mealTypes),
          notes: Math.random() > 0.7 ? 'Segar dan bergizi' : null,
        }
      });
      count++;
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  console.log(`✅ Created ${count} Food Diary records`);
  return count;
}

async function createBeritaAcara() {
  console.log('📝 Creating Berita Acara kegiatan...');
  
  // Check existing
  const existing = await prisma.beritaAcara.count();
  if (existing > 0) {
    console.log('✅ Berita Acara already exists, skipping...');
    return existing;
  }
  
  const judulList = [
    'Serah Terima Paket Makanan',
    'Koordinasi Distribusi Mingguan',
    'Rapat Evaluasi Program Makan Bergizi',
    'Pemeriksaan Kualitas Bahan Makanan',
    'Sosialisasi Gizi Seimbang',
    'Pendampingan Penyiapan Makanan',
    'Monitoring Distribusi ke Sekolah',
    'Rapat Koordinasi dengan Dinas Pendidikan',
    'Pelatihan Penanganan Makanan Aman',
    'Inspeksi Kesiapan Dapur',
    'Pengambilan Sample Makanan',
    'Konsultasi Ahli Gizi',
    'Rapat Internal Tim PM',
    'Verifikasi Data Penerima',
    'Audit Internal Program',
  ];
  
  const kategoriList = ['Distribusi', 'Rapat', 'Evaluasi', 'Sosialisasi', 'Monitoring', 'Pelatihan'];
  
  let count = 0;
  let nomor = 1;
  const current = new Date(START_DATE);
  
  while (current <= END_DATE) {
    // 2-4 BA per week
    const numBA = randomInt(2, 4);
    
    for (let i = 0; i < numBA; i++) {
      const judul = randomPick(judulList);
      const pesertaCount = randomInt(5, 20);
      const year = current.getFullYear();
      
      await prisma.beritaAcara.create({
        data: {
          nomor: `BA/${String(nomor).padStart(4, '0')}/PM-TLD/${year}`,
          tanggal: new Date(current),
          judul,
          lokasi: randomPick(['Kantor PM TOLANDONA', 'Aula Kecamatan', 'Dinas Pendidikan', 'Sekolah Tujuan']),
          peserta: String(pesertaCount),
          uraian: `<p>Kegiatan <strong>${judul}</strong> telah dilaksanakan dengan baik pada tanggal ${current.toLocaleDateString('id-ID')}.</p>
                   <p>Hadir dalam kegiatan ini sebanyak ${pesertaCount} peserta dari berbagai instansi terkait.</p>
                   <p>Kegiatan berlangsung dari pukul ${randomInt(8, 10)}:00 WITA sampai dengan pukul ${randomInt(12, 15)}:00 WITA.</p>`,
          kesimpulan: randomPick([
            'Kegiatan berjalan lancar sesuai rencana.',
            'Semua agenda terlaksana dengan baik.',
            'Koordinasi berjalan efektif dan efisien.',
            'Target kegiatan tercapai dengan baik.',
          ]),
          tindakLanjut: randomPick([
            'Melanjutkan kegiatan sesuai jadwal.',
            'Perlu koordinasi lanjutan minggu depan.',
            'Menyiapkan laporan hasil kegiatan.',
            'Evaluasi pelaksanaan di periode berikutnya.',
          ]),
          picNama: randomPick(['Ahmad Fadli', 'Siti Nurhaliza', 'Budi Santoso', 'Dewi Kartika', 'Eko Prasetyo']),
          picJabatan: randomPick(['Koordinator Program', 'Supervisor', 'Manajer Operasional', 'Staff Administrasi']),
          status: 'selesai',
          kategori: randomPick(kategoriList),
        }
      });
      count++;
      nomor++;
    }
    
    current.setDate(current.getDate() + 7);
  }
  
  console.log(`✅ Created ${count} Berita Acara records`);
  return count;
}

async function createDistribusiIfEmpty() {
  console.log('📦 Checking Distribusi data...');
  
  const existing = await prisma.distribusi.count();
  if (existing > 0) {
    console.log(`✅ Distribusi already has ${existing} records, skipping...`);
    return existing;
  }
  
  console.log('📦 Creating Distribusi data...');
  
  // Get schools from siswa
  const siswa = await prisma.siswa.findMany({
    select: { namaSekolah: true, kelas: true, jk: true }
  });
  
  const schoolMap = new Map<string, Map<string, { L: number; P: number }>>();
  
  for (const s of siswa) {
    if (!s.namaSekolah) continue;
    
    if (!schoolMap.has(s.namaSekolah)) {
      schoolMap.set(s.namaSekolah, new Map());
    }
    
    const school = schoolMap.get(s.namaSekolah)!;
    const kelas = s.kelas || '';
    
    if (!school.has(kelas)) {
      school.set(kelas, { L: 0, P: 0 });
    }
    
    const kelasData = school.get(kelas)!;
    if (s.jk === 'L') kelasData.L++;
    else if (s.jk === 'P') kelasData.P++;
  }
  
  // Get guru data
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
  
  // Generate dates every 2 weeks
  const dates: Date[] = [];
  const startDate = new Date(START_DATE);
  let currentDate = new Date(startDate);
  
  while (currentDate <= END_DATE) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 14);
  }
  
  let count = 0;
  const schools = Array.from(schoolMap.entries());
  
  for (const date of dates) {
    const numSchools = Math.floor(schools.length * 0.5) + randomInt(0, Math.floor(schools.length * 0.3));
    const selectedSchools = schools.sort(() => Math.random() - 0.5).slice(0, numSchools);
    
    for (const [schoolName, kelasData] of selectedSchools) {
      const getValue = (kelas: string, jk: 'L' | 'P') => {
        const val = kelasData.get(kelas)?.[jk] || 0;
        return Math.floor(val * (0.7 + Math.random() * 0.3));
      };
      
      const gData = guruMap.get(schoolName) || { kepsek: { L: 0, P: 0 }, guru: { L: 0, P: 0 }, tendik: { L: 0, P: 0 }, nonTendik: { L: 0, P: 0 } };
      
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
      const ujiOrg = randomInt(1, 5);
      const jumlah = siswaTotal + guruTotal + ujiOrg;
      
      if (jumlah > 0) {
        await prisma.distribusi.create({
          data: {
            namaSekolah: schoolName,
            klsAL: getValue('A', 'L'),
            klsAP: getValue('A', 'P'),
            klsBL: getValue('B', 'L'),
            klsBP: getValue('B', 'P'),
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
            kls7L: getValue('7', 'L'),
            kls7P: getValue('7', 'P'),
            kls8L: getValue('8', 'L'),
            kls8P: getValue('8', 'P'),
            kls9L: getValue('9', 'L'),
            kls9P: getValue('9', 'P'),
            kls10L: getValue('10', 'L'),
            kls10P: getValue('10', 'P'),
            kls11L: getValue('11', 'L'),
            kls11P: getValue('11', 'P'),
            kls12L: getValue('12', 'L'),
            kls12P: getValue('12', 'P'),
            kepsekL: gData.kepsek.L,
            kepsekP: gData.kepsek.P,
            guruL: gData.guru.L,
            guruP: gData.guru.P,
            tendikL: gData.tendik.L,
            tendikP: gData.tendik.P,
            nonTendikL: gData.nonTendik.L,
            nonTendikP: gData.nonTendik.P,
            ujiOrganoleptik: ujiOrg,
            jumlah,
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

async function main() {
  console.log('🚀 Starting comprehensive simulation data creation...\n');
  console.log('📅 Period: December 2025 - May 2026\n');
  
  // Create all simulation data
  await createDistribusiIfEmpty();
  await createBeritaAcaraDistribusi();
  const barangResult = await createBarangDanTransaksi();
  await createMorePayroll();
  await createFoodDiary();
  await createBeritaAcara();
  
  // Get final counts
  const counts = {
    distribusi: await prisma.distribusi.count(),
    baDistribusi: await prisma.beritaAcaraDistribusi.count(),
    barang: await prisma.barang.count(),
    barangTransaksi: await prisma.barangTransaksi.count(),
    payroll: await prisma.payroll.count(),
    foodDiary: await prisma.foodDiary.count(),
    beritaAcara: await prisma.beritaAcara.count(),
    guru: await prisma.guru.count(),
    siswa: await prisma.siswa.count(),
    posyandu: await prisma.posyandu.count(),
    relawan: await prisma.relawan.count(),
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL DATA SUMMARY');
  console.log('='.repeat(60));
  console.log(`👨‍🏫 Guru           : ${counts.guru} records`);
  console.log(`👨‍🎓 Siswa          : ${counts.siswa} records`);
  console.log(`👶 Posyandu       : ${counts.posyandu} records`);
  console.log(`🤝 Relawan        : ${counts.relawan} records`);
  console.log('-'.repeat(60));
  console.log(`📦 Distribusi     : ${counts.distribusi} records`);
  console.log(`📝 BA Distribusi  : ${counts.baDistribusi} records`);
  console.log(`💰 Payroll        : ${counts.payroll} records`);
  console.log(`🍎 Food Diary     : ${counts.foodDiary} records`);
  console.log(`📝 Berita Acara   : ${counts.beritaAcara} records`);
  console.log('-'.repeat(60));
  console.log(`🏪 Barang         : ${counts.barang} items`);
  console.log(`📊 Transaksi      : ${counts.barangTransaksi} records`);
  console.log('='.repeat(60));
  console.log('\n✅ All simulation data created successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
