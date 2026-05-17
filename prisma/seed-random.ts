import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper functions
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100;
const randomItem = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Data pools
const namaLaki = [
  'Ahmad Fauzi', 'Budi Santoso', 'Candra Wijaya', 'Dedi Kurniawan', 'Eko Prasetyo',
  'Faisal Rahman', 'Gunawan Setiawan', 'Hendra Putra', 'Irfan Hakim', 'Joko Widodo',
  'Krisna Murti', 'Lutfi Hakim', 'Made Suardana', 'Nurul Hidayat', 'Oki Setiawan',
  'Putra Mahendra', 'Rahmat Hidayat', 'Surya Dharma', 'Teguh Prasetyo', 'Umar Faruk',
  'Wahyu Nugroho', 'Yusuf Mansur', 'Zainal Abidin', 'Agus Salim', 'Bambang Susanto',
  'Cecep Supriatna', 'Dadan Hermawan', 'Endang Supriadi', 'Feri Gunawan', 'Galih Pratama',
  'Hadi Susanto', 'Ilham Maulana', 'Jajang Kusuma', 'Kiki Permana', 'Lili Suryadi',
  'Maman Suparman', 'Nana Supriatna', 'Opik Taufik', 'Pandu Wibowo', 'Rendi Pratama',
  'Slamet Riyadi', 'Toni Setiawan', 'Uun Sunarya', 'Vino Pratama', 'Wawan Setiawan',
  'Yayan Ruhiyat', 'Zulfikar Ali', 'Asep Supriadi', 'Beng Beng', 'Cahyo Purnomo'
];

const namaPerempuan = [
  'Siti Aminah', 'Dewi Lestari', 'Rina Susanti', 'Maya Sari', 'Putri Handayani',
  'Ani Wijaya', 'Ratna Dewi', 'Indah Permatasari', 'Fitri Handayani', 'Gita Savitri',
  'Hana Safira', 'Irma Susanti', 'Julia Perez', 'Kartika Sari', 'Lina Marlina',
  'Mira Kusuma', 'Nia Ramadhani', 'Oktaviani Putri', 'Puspa Indah', 'Qori Sandioriva',
  'Rani Wijaya', 'Siska Amelia', 'Tika Ramlan', 'Umi Kalsum', 'Vina Panduwinata',
  'Winda Kusuma', 'Yuni Shara', 'Zahra Putri', 'Ayu Tingting', 'Bella Safitri',
  'Citra Kirana', 'Dinda Kirana', 'Eka Gustiwana', 'Fanny Fabriana', 'Gracia Indri',
  'Helena Lim', 'Intan Ayu', 'Jihan Audy', 'Kezia Warouw', 'Lyodra Ginting',
  'Maudy Ayunda', 'Nagita Slavina', 'Olivia Jensen', 'Pevita Pearce', 'Queen Gita',
  'Raisa Andriana', 'Syifa Hadju', 'Tatjana Saphira', 'Ussy Sulistiawaty', 'Vanesha Prescilla'
];

const sekolahList = [
  'SD Negeri 1 To landona', 'SD Negeri 2 To landona', 'SD Negeri 3 To landona',
  'SMP Negeri 1 To landona', 'SMP Negeri 2 To landona',
  'SMA Negeri 1 To landona', 'SMA Negeri 2 To landona',
  'TK Pertiwi 1 To landona', 'TK Pertiwi 2 To landona',
  'PAUD Melati To landona', 'PAUD Mawar To landona',
  'MI Al-Ikhlas To landona', 'MTs Al-Ikhlas To landona',
  'SMK Negeri 1 To landona', 'SD Swasta Kartika'
];

const posyanduList = [
  'Posyandu Mawar', 'Posyandu Melati', 'Posyandu Dahlia', 'Posyandu Anggrek',
  'Posyandu Kenanga', 'Posyandu Cempaka', 'Posyandu Sekar', 'Posyandu Srikandi',
  'Posyandu Teratai', 'Posyandu Tulip', 'Posyandu Sakura', 'Posyandu Lavender'
];

const kategoriPosyandu = ['Balita', 'Ibu Hamil', 'Ibu Menyusui', 'Lansia', 'Bayi'];
const jenjangList = ['TK', 'SD', 'SMP', 'SMA', 'SMK'];
const kelasList = ['A', 'B', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const divisiList = ['Dapur', 'Distribusi', 'Admin', 'Keuangan', 'Logistik', 'Quality Control'];
const jabatanList = ['Kepala Bagian', 'Staff', 'Supervisor', 'Koordinator', 'Asisten'];
const jenisTendikList = ['Guru Tetap', 'Guru Tidak Tetap', 'Guru PNS', 'Guru Honorer', 'Tenaga Kependidikan'];
const tempatLahirList = ['Makassar', 'Jeneponto', 'Bantaeng', 'Bulukumba', 'Sinjai', 'Selayar', 'Takalar', 'Gowa', 'Maros', 'Pangkep'];

const alamatList = [
  'Jl. Pahlawan No. 1', 'Jl. Sudirman No. 15', 'Jl. Gatot Subroto No. 23',
  'Jl. Ahmad Yani No. 45', 'Jl. Diponegoro No. 12', 'Jl. Imam Bonjol No. 8',
  'Jl. Pemuda No. 33', 'Jl. Merdeka No. 7', 'Jl. Kartini No. 19',
  'Jl. RA Kartini No. 25', 'Jl. Hasanuddin No. 41', 'Jl. Sultan Alauddin No. 16',
  'Kampung Baru', 'Kelurahan Tengah', 'Desa Sukamaju', 'Desa Mekar Jaya'
];

const kategoriBarangList = [
  { nama: 'Bahan Makanan Segar', deskripsi: 'Sayuran, buah, daging, ikan segar' },
  { nama: 'Bahan Makanan Kering', deskripsi: 'Beras, tepung, gula, minyak' },
  { nama: 'Bumbu Dapur', deskripsi: 'Rempah-rempah dan bumbu masak' },
  { nama: 'Peralatan Masak', deskripsi: 'Panci, wajan, pisau, talenan' },
  { nama: 'Kemasan', deskripsi: 'Wadah makanan, plastik, kertas' },
  { nama: 'Peralatan Kebersihan', deskripsi: 'Sapu, pel, detergent' }
];

const barangList = [
  { kode: 'BRG001', nama: 'Beras Premium', satuan: 'kg', harga: 15000 },
  { kode: 'BRG002', nama: 'Minyak Goreng', satuan: 'liter', harga: 18000 },
  { kode: 'BRG003', nama: 'Gula Pasir', satuan: 'kg', harga: 14000 },
  { kode: 'BRG004', nama: 'Telur Ayam', satuan: 'kg', harga: 28000 },
  { kode: 'BRG005', nama: 'Ayam Potong', satuan: 'kg', harga: 35000 },
  { kode: 'BRG006', nama: 'Ikan Tongkol', satuan: 'kg', harga: 30000 },
  { kode: 'BRG007', nama: 'Sayur Bayam', satuan: 'kg', harga: 8000 },
  { kode: 'BRG008', nama: 'Wortel', satuan: 'kg', harga: 12000 },
  { kode: 'BRG009', nama: 'Kentang', satuan: 'kg', harga: 15000 },
  { kode: 'BRG010', nama: 'Tomat', satuan: 'kg', harga: 10000 },
  { kode: 'BRG011', nama: 'Bawang Merah', satuan: 'kg', harga: 25000 },
  { kode: 'BRG012', nama: 'Bawang Putih', satuan: 'kg', harga: 30000 },
  { kode: 'BRG013', nama: 'Cabai Merah', satuan: 'kg', harga: 40000 },
  { kode: 'BRG014', nama: 'Kecap Manis', satuan: 'botol', harga: 12000 },
  { kode: 'BRG015', nama: 'Kecap Asin', satuan: 'botol', harga: 10000 },
  { kode: 'BRG016', nama: 'Garam', satuan: 'kg', harga: 5000 },
  { kode: 'BRG017', nama: 'MSG', satuan: 'kg', harga: 20000 },
  { kode: 'BRG018', nama: 'Tepung Terigu', satuan: 'kg', harga: 12000 },
  { kode: 'BRG019', nama: 'Mie Instan', satuan: 'pack', harga: 3500 },
  { kode: 'BRG020', nama: 'Susu UHT', satuan: 'liter', harga: 18000 },
  { kode: 'BRG021', nama: 'Tempe', satuan: 'papan', harga: 5000 },
  { kode: 'BRG022', nama: 'Tahu', satuan: 'potong', harga: 1500 },
  { kode: 'BRG023', nama: 'Kangkung', satuan: 'ikat', harga: 3000 },
  { kode: 'BRG024', nama: 'Sawi', satuan: 'ikat', harga: 4000 },
  { kode: 'BRG025', nama: 'Kol', satuan: 'kg', harga: 8000 }
];

const foodItems = [
  { name: 'Nasi Putih', category: 'Karbohidrat', calories: 180, protein: 4, carbs: 40, fat: 0.5, fiber: 0.6 },
  { name: 'Ayam Goreng', category: 'Protein', calories: 260, protein: 25, carbs: 5, fat: 16, fiber: 0 },
  { name: 'Sayur Bayam', category: 'Sayuran', calories: 30, protein: 3, carbs: 5, fat: 0.3, fiber: 2.5 },
  { name: 'Telur Rebus', category: 'Protein', calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0 },
  { name: 'Tempe Goreng', category: 'Protein', calories: 150, protein: 9, carbs: 8, fat: 10, fiber: 1 },
  { name: 'Susu', category: 'Minuman', calories: 120, protein: 8, carbs: 12, fat: 5, fiber: 0 },
  { name: 'Pisang', category: 'Buah', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1 },
  { name: 'Apel', category: 'Buah', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4 },
  { name: 'Bubur Ayam', category: 'Karbohidrat', calories: 200, protein: 12, carbs: 28, fat: 5, fiber: 1 },
  { name: 'Soto Ayam', category: 'Makanan Utama', calories: 280, protein: 18, carbs: 20, fat: 15, fiber: 2 },
  { name: 'Mie Goreng', category: 'Karbohidrat', calories: 320, protein: 10, carbs: 45, fat: 12, fiber: 2 },
  { name: 'Nasi Goreng', category: 'Karbohidrat', calories: 350, protein: 8, carbs: 50, fat: 14, fiber: 1.5 },
  { name: 'Gado-gado', category: 'Makanan Utama', calories: 250, protein: 12, carbs: 25, fat: 12, fiber: 5 },
  { name: 'Lontong Sayur', category: 'Makanan Utama', calories: 300, protein: 10, carbs: 40, fat: 10, fiber: 3 },
  { name: 'Bubur Kacang', category: 'Snack', calories: 180, protein: 8, carbs: 30, fat: 4, fiber: 4 }
];

const mealTypes = ['sarapan', 'makanSiang', 'makanMalam', 'snack'];
const ageGroups = ['dewasa', 'anak'];

// Generate random NIK
const generateNIK = () => {
  const kecCode = randomInt(7301, 7320).toString();
  const dateCode = randomInt(1, 31).toString().padStart(2, '0');
  const monthCode = randomInt(1, 12).toString().padStart(2, '0');
  const yearCode = randomInt(70, 99).toString();
  const seq = randomInt(1, 9999).toString().padStart(4, '0');
  return `${kecCode}${dateCode}${monthCode}${yearCode}${seq}`;
};

// Generate random NISN
const generateNISN = () => {
  return randomInt(1000000000, 9999999999).toString();
};

// Generate random NUPTK
const generateNUPTK = () => {
  return randomInt(1000000000000000, 9999999999999999).toString();
};

// Generate random NIP
const generateNIP = () => {
  const year = randomInt(1970, 2000);
  const month = randomInt(1, 12).toString().padStart(2, '0');
  const day = randomInt(1, 28).toString().padStart(2, '0');
  const seq = randomInt(1, 999999).toString().padStart(6, '0');
  return `${year}${month}${day}${seq}`;
};

// Calculate age from birth date
const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Main seed function
async function main() {
  console.log('🌱 Starting seed process...');
  
  // Clear existing data
  console.log('🗑️ Clearing existing data...');
  await prisma.barangTransaksi.deleteMany();
  await prisma.barang.deleteMany();
  await prisma.barangKategori.deleteMany();
  await prisma.beritaAcaraDistribusi.deleteMany();
  await prisma.beritaAcara.deleteMany();
  await prisma.foodDiary.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.distribusi.deleteMany();
  await prisma.relawan.deleteMany();
  await prisma.posyandu.deleteMany();
  await prisma.siswa.deleteMany();
  await prisma.guru.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@tolandona.go.id',
      password: hashedPassword,
      name: 'Administrator',
      role: 'admin'
    }
  });

  // Date range: last 3 months
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);

  // ============================================
  // SEED GURU DATA (100 records)
  // ============================================
  console.log('👨‍🏫 Seeding Guru data (100 records)...');
  for (let i = 0; i < 100; i++) {
    const isLaki = Math.random() > 0.6;
    const nama = isLaki ? randomItem(namaLaki) : randomItem(namaPerempuan);
    const birthDate = randomDate(new Date(1970, 0, 1), new Date(1995, 11, 31));
    
    await prisma.guru.create({
      data: {
        originalId: `G${(i + 1).toString().padStart(4, '0')}`,
        nama,
        jk: isLaki ? 'L' : 'P',
        sekolah: randomItem(sekolahList),
        alamat: randomItem(alamatList),
        nuptk: generateNUPTK(),
        jenisTendik: randomItem(jenisTendikList),
        nik: generateNIK(),
        nip: Math.random() > 0.5 ? generateNIP() : null,
        tempatLahir: randomItem(tempatLahirList),
        tanggalLahir: birthDate.toISOString().split('T')[0],
        umur: `${calculateAge(birthDate)} tahun`,
        createdAt: randomDate(startDate, endDate)
      }
    });
  }

  // ============================================
  // SEED SISWA DATA (500 records)
  // ============================================
  console.log('👨‍🎓 Seeding Siswa data (500 records)...');
  for (let i = 0; i < 500; i++) {
    const isLaki = Math.random() > 0.5;
    const nama = isLaki ? randomItem(namaLaki) : randomItem(namaPerempuan);
    const jenjang = randomItem(jenjangList);
    const birthDate = randomDate(new Date(2008, 0, 1), new Date(2022, 11, 31));
    
    let kelas = '';
    if (jenjang === 'TK') kelas = randomItem(['A', 'B']);
    else if (jenjang === 'SD') kelas = randomItem(['1', '2', '3', '4', '5', '6']);
    else if (jenjang === 'SMP') kelas = randomItem(['7', '8', '9']);
    else kelas = randomItem(['10', '11', '12']);
    
    await prisma.siswa.create({
      data: {
        originalId: `S${(i + 1).toString().padStart(4, '0')}`,
        nama,
        jenjang,
        namaSekolah: randomItem(sekolahList.filter(s => {
          if (jenjang === 'TK' || jenjang === 'PAUD') return s.includes('TK') || s.includes('PAUD');
          if (jenjang === 'SD') return s.includes('SD') || s.includes('MI');
          if (jenjang === 'SMP') return s.includes('SMP') || s.includes('MTs');
          return s.includes('SMA') || s.includes('SMK');
        })),
        jk: isLaki ? 'L' : 'P',
        alamat: randomItem(alamatList),
        tempatLahir: randomItem(tempatLahirList),
        tanggalLahir: birthDate.toISOString().split('T')[0],
        nisn: generateNISN(),
        nik: generateNIK(),
        kelas,
        umur: `${calculateAge(birthDate)} tahun`,
        createdAt: randomDate(startDate, endDate)
      }
    });
  }

  // ============================================
  // SEED POSYANDU DATA (200 records)
  // ============================================
  console.log('👶 Seeding Posyandu data (200 records)...');
  for (let i = 0; i < 200; i++) {
    const isLaki = Math.random() > 0.5;
    const nama = isLaki ? randomItem(namaLaki) : randomItem(namaPerempuan);
    const kategori = randomItem(kategoriPosyandu);
    
    let birthDate: Date;
    if (kategori === 'Balita') birthDate = randomDate(new Date(2022, 0, 1), new Date(2025, 11, 31));
    else if (kategori === 'Bayi') birthDate = randomDate(new Date(2024, 0, 1), new Date(2025, 11, 31));
    else birthDate = randomDate(new Date(1970, 0, 1), new Date(2000, 11, 31));
    
    await prisma.posyandu.create({
      data: {
        originalId: `P${(i + 1).toString().padStart(4, '0')}`,
        nama,
        posyandu: randomItem(posyanduList),
        alamat: randomItem(alamatList),
        kategori,
        jk: isLaki ? 'L' : 'P',
        nik: generateNIK(),
        tempatLahir: randomItem(tempatLahirList),
        tanggalLahir: birthDate.toISOString().split('T')[0],
        umur: `${calculateAge(birthDate)} tahun`,
        createdAt: randomDate(startDate, endDate)
      }
    });
  }

  // ============================================
  // SEED RELAWAN DATA (30 records)
  // ============================================
  console.log('👷 Seeding Relawan data (30 records)...');
  const relawanIds: string[] = [];
  for (let i = 0; i < 30; i++) {
    const isLaki = Math.random() > 0.4;
    const nama = isLaki ? randomItem(namaLaki) : randomItem(namaPerempuan);
    const divisi = randomItem(divisiList);
    const jabatan = randomItem(jabatanList);
    const gajiPokok = randomInt(1500000, 3500000);
    const birthDate = randomDate(new Date(1980, 0, 1), new Date(2000, 11, 31));
    
    const relawan = await prisma.relawan.create({
      data: {
        originalId: `R${(i + 1).toString().padStart(3, '0')}`,
        nama,
        divisi,
        jabatan,
        gajiPokok: gajiPokok.toString(),
        jk: isLaki ? 'L' : 'P',
        nik: generateNIK(),
        tempatLahir: randomItem(tempatLahirList),
        tanggalLahir: birthDate.toISOString().split('T')[0],
        umur: `${calculateAge(birthDate)} tahun`,
        alamat: randomItem(alamatList),
        hariKerja: '22',
        bonus: '0',
        totalGaji: gajiPokok.toString(),
        createdAt: randomDate(startDate, endDate)
      }
    });
    relawanIds.push(relawan.id);
  }

  // ============================================
  // SEED DISTRIBUSI DATA (90 days)
  // ============================================
  console.log('📦 Seeding Distribusi data (90 days)...');
  const distribusiIds: string[] = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Skip weekends randomly
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }
    
    // 3-5 schools per day
    const schoolsToday = randomInt(3, 5);
    const usedSchools = new Set<string>();
    
    for (let i = 0; i < schoolsToday; i++) {
      let sekolah = randomItem(sekolahList);
      while (usedSchools.has(sekolah)) {
        sekolah = randomItem(sekolahList);
      }
      usedSchools.add(sekolah);
      
      const klsAL = randomInt(5, 20);
      const klsAP = randomInt(5, 20);
      const klsBL = randomInt(5, 15);
      const klsBP = randomInt(5, 15);
      const kls1L = sekolah.includes('SD') ? randomInt(15, 35) : 0;
      const kls1P = sekolah.includes('SD') ? randomInt(15, 35) : 0;
      const kls2L = sekolah.includes('SD') ? randomInt(15, 35) : 0;
      const kls2P = sekolah.includes('SD') ? randomInt(15, 35) : 0;
      const kls3L = sekolah.includes('SD') ? randomInt(15, 35) : 0;
      const kls3P = sekolah.includes('SD') ? randomInt(15, 35) : 0;
      const kls4L = sekolah.includes('SD') ? randomInt(15, 35) : 0;
      const kls4P = sekolah.includes('SD') ? randomInt(15, 35) : 0;
      const kls5L = sekolah.includes('SD') ? randomInt(15, 35) : 0;
      const kls5P = sekolah.includes('SD') ? randomInt(15, 35) : 0;
      const kls6L = sekolah.includes('SD') ? randomInt(15, 35) : 0;
      const kls6P = sekolah.includes('SD') ? randomInt(15, 35) : 0;
      const kls7L = sekolah.includes('SMP') || sekolah.includes('MTs') ? randomInt(20, 40) : 0;
      const kls7P = sekolah.includes('SMP') || sekolah.includes('MTs') ? randomInt(20, 40) : 0;
      const kls8L = sekolah.includes('SMP') || sekolah.includes('MTs') ? randomInt(20, 40) : 0;
      const kls8P = sekolah.includes('SMP') || sekolah.includes('MTs') ? randomInt(20, 40) : 0;
      const kls9L = sekolah.includes('SMP') || sekolah.includes('MTs') ? randomInt(20, 40) : 0;
      const kls9P = sekolah.includes('SMP') || sekolah.includes('MTs') ? randomInt(20, 40) : 0;
      const kls10L = sekolah.includes('SMA') || sekolah.includes('SMK') ? randomInt(25, 45) : 0;
      const kls10P = sekolah.includes('SMA') || sekolah.includes('SMK') ? randomInt(25, 45) : 0;
      const kls11L = sekolah.includes('SMA') || sekolah.includes('SMK') ? randomInt(25, 45) : 0;
      const kls11P = sekolah.includes('SMA') || sekolah.includes('SMK') ? randomInt(25, 45) : 0;
      const kls12L = sekolah.includes('SMA') || sekolah.includes('SMK') ? randomInt(25, 45) : 0;
      const kls12P = sekolah.includes('SMA') || sekolah.includes('SMK') ? randomInt(25, 45) : 0;
      
      const kepsekL = randomInt(0, 1);
      const kepsekP = randomInt(0, 1);
      const guruL = randomInt(3, 15);
      const guruP = randomInt(5, 20);
      const tendikL = randomInt(1, 5);
      const tendikP = randomInt(1, 8);
      const nonTendikL = randomInt(0, 3);
      const nonTendikP = randomInt(0, 3);
      
      const jumlah = klsAL + klsAP + klsBL + klsBP + 
        kls1L + kls1P + kls2L + kls2P + kls3L + kls3P +
        kls4L + kls4P + kls5L + kls5P + kls6L + kls6P +
        kls7L + kls7P + kls8L + kls8P + kls9L + kls9P +
        kls10L + kls10P + kls11L + kls11P + kls12L + kls12P +
        kepsekL + kepsekP + guruL + guruP + tendikL + tendikP + nonTendikL + nonTendikP;
      
      const distribusi = await prisma.distribusi.create({
        data: {
          namaSekolah: sekolah,
          klsAL, klsAP, klsBL, klsBP,
          kls1L, kls1P, kls2L, kls2P, kls3L, kls3P,
          kls4L, kls4P, kls5L, kls5P, kls6L, kls6P,
          kls7L, kls7P, kls8L, kls8P, kls9L, kls9P,
          kls10L, kls10P, kls11L, kls11P, kls12L, kls12P,
          kepsekL, kepsekP, guruL, guruP, tendikL, tendikP, nonTendikL, nonTendikP,
          ujiOrganoleptik: randomInt(jumlah - 5, jumlah),
          jumlah,
          tanggal: new Date(currentDate),
          createdAt: new Date(currentDate)
        }
      });
      distribusiIds.push(distribusi.id);
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // ============================================
  // SEED BERITA ACARA DISTRIBUSI
  // ============================================
  console.log('📝 Seeding Berita Acara Distribusi...');
  let baCount = 1;
  for (const distribusiId of distribusiIds.slice(0, 200)) {
    const distribusi = await prisma.distribusi.findUnique({
      where: { id: distribusiId }
    });
    
    if (distribusi && Math.random() > 0.3) {
      const date = new Date(distribusi.tanggal);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const nomor = `BA/MBG/${year}/${month}/${String(baCount).padStart(3, '0')}`;
      baCount++;
      
      await prisma.beritaAcaraDistribusi.create({
        data: {
          nomor,
          tanggal: distribusi.tanggal,
          jam: `${randomInt(7, 11)}:${randomInt(0, 59).toString().padStart(2, '0')}`,
          namaSekolah: distribusi.namaSekolah,
          jumlahPaket: distribusi.jumlah,
          kondisi: randomItem(['Baik', 'Baik', 'Baik', 'Cukup Baik']),
          sppgNama: randomItem(['Ahmad', 'Budi', 'Candra', 'Dewi', 'Eka']),
          sppgInstansi: 'SPPG To landona',
          penerimaNama: randomItem(namaLaki.slice(0, 10).concat(namaPerempuan.slice(0, 10))),
          penerimaJabatan: 'Kepala Sekolah',
          status: Math.random() > 0.2 ? 'selesai' : 'draft',
          distribusiId: distribusi.id,
          createdAt: new Date(distribusi.tanggal)
        }
      });
    }
  }

  // ============================================
  // SEED PAYROLL DATA (6 periodes x 3 months)
  // ============================================
  console.log('💰 Seeding Payroll data...');
  const periodes = [
    { periode: 1, mulai: new Date(2026, 1, 1), selesai: new Date(2026, 1, 14) },
    { periode: 2, mulai: new Date(2026, 1, 15), selesai: new Date(2026, 1, 28) },
    { periode: 3, mulai: new Date(2026, 2, 1), selesai: new Date(2026, 2, 14) },
    { periode: 4, mulai: new Date(2026, 2, 15), selesai: new Date(2026, 2, 28) },
    { periode: 5, mulai: new Date(2026, 3, 1), selesai: new Date(2026, 3, 14) },
    { periode: 6, mulai: new Date(2026, 3, 15), selesai: new Date(2026, 3, 30) },
  ];

  for (const periode of periodes) {
    for (const relawanId of relawanIds) {
      const relawan = await prisma.relawan.findUnique({ where: { id: relawanId } });
      if (!relawan) continue;
      
      const gajiHarian = parseInt(relawan.gajiPokok || '0') / 22;
      const hariKerja = randomInt(10, 14);
      const bonus = randomInt(0, 500000);
      const potongan = randomInt(0, 200000);
      const totalGaji = Math.round(gajiHarian * hariKerja) + bonus - potongan;
      const isPaid = periode.periode < 5 ? true : Math.random() > 0.3;
      
      await prisma.payroll.create({
        data: {
          relawanId,
          periode: periode.periode,
          tahun: 2026,
          tanggalMulai: periode.mulai,
          tanggalSelesai: periode.selesai,
          gajiHarian: Math.round(gajiHarian),
          hariKerja,
          bonus,
          potongan,
          totalGaji,
          status: isPaid ? 'paid' : 'pending',
          tanggalBayar: isPaid ? new Date(periode.selesai.getTime() + randomInt(1, 5) * 24 * 60 * 60 * 1000) : null,
          keterangan: isPaid ? 'Dibayar tepat waktu' : 'Menunggu persetujuan'
        }
      });
    }
  }

  // ============================================
  // SEED BARANG KATEGORI & BARANG
  // ============================================
  console.log('📦 Seeding Barang Kategori & Barang...');
  for (const kategori of kategoriBarangList) {
    await prisma.barangKategori.create({
      data: {
        nama: kategori.nama,
        deskripsi: kategori.deskripsi
      }
    });
  }

  const kategoriDb = await prisma.barangKategori.findMany();
  for (const barang of barangList) {
    const kategori = kategoriDb.find(k => 
      (barang.nama.includes('Beras') || barang.nama.includes('Tepung') || barang.nama.includes('Gula') || barang.nama.includes('Mie')) && k.nama === 'Bahan Makanan Kering' ||
      (barang.nama.includes('Minyak') || barang.nama.includes('Kecap') || barang.nama.includes('Garam') || barang.nama.includes('MSG')) && k.nama === 'Bumbu Dapur' ||
      (barang.nama.includes('Sayur') || barang.nama.includes('Wortel') || barang.nama.includes('Kentang') || barang.nama.includes('Tomat') || barang.nama.includes('Bawang') || barang.nama.includes('Cabai') || barang.nama.includes('Kangkung') || barang.nama.includes('Sawi') || barang.nama.includes('Kol')) && k.nama === 'Bahan Makanan Segar' ||
      (barang.nama.includes('Telur') || barang.nama.includes('Ayam') || barang.nama.includes('Ikan') || barang.nama.includes('Tempe') || barang.nama.includes('Tahu')) && k.nama === 'Bahan Makanan Segar' ||
      (barang.nama.includes('Susu') || barang.nama.includes('Pisang') || barang.nama.includes('Apel')) && k.nama === 'Bahan Makanan Segar'
    ) || kategoriDb[0];

    const stok = randomInt(10, 100);
    await prisma.barang.create({
      data: {
        kode: barang.kode,
        nama: barang.nama,
        kategoriId: kategori?.id,
        satuan: barang.satuan,
        stok,
        stokMin: randomInt(5, 20),
        harga: barang.harga,
        lokasi: `Rak ${String.fromCharCode(65 + randomInt(0, 5))}-${randomInt(1, 10)}`,
        status: 'aktif'
      }
    });
  }

  // ============================================
  // SEED BARANG TRANSAKSI (90 days)
  // ============================================
  console.log('📊 Seeding Barang Transaksi...');
  const barangDb = await prisma.barang.findMany();
  currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (currentDate.getDay() === 0) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }
    
    // 3-8 transactions per day
    const transCount = randomInt(3, 8);
    for (let i = 0; i < transCount; i++) {
      const barang = randomItem(barangDb);
      const jenis = Math.random() > 0.4 ? 'masuk' : 'keluar';
      const jumlah = jenis === 'masuk' ? randomInt(20, 100) : randomInt(5, 30);
      
      await prisma.barangTransaksi.create({
        data: {
          barangId: barang.id,
          jenis,
          jumlah,
          hargaSatuan: barang.harga,
          totalHarga: jumlah * barang.harga,
          tanggal: new Date(currentDate),
          keterangan: jenis === 'masuk' ? 'Pembelian dari supplier' : 'Pengambilan untuk produksi',
          referensi: `INV-${randomInt(10000, 99999)}`,
          penerima: jenis === 'keluar' ? randomItem(['Dapur 1', 'Dapur 2', 'Gudang Utama']) : null,
          pengirim: jenis === 'masuk' ? randomItem(['PT. Sumber Makmur', 'CV. Sejahtera', 'UD. Berkah']) : null,
          createdAt: new Date(currentDate)
        }
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // ============================================
  // SEED FOOD DIARY (90 days)
  // ============================================
  console.log('🍽️ Seeding Food Diary...');
  currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // 10-20 food entries per day
    const foodCount = randomInt(10, 20);
    for (let i = 0; i < foodCount; i++) {
      const food = randomItem(foodItems);
      const mealType = randomItem(mealTypes);
      const ageGroup = randomItem(ageGroups);
      const amount = randomInt(50, 200);
      
      await prisma.foodDiary.create({
        data: {
          date: new Date(currentDate),
          ageGroup,
          foodId: randomInt(1, 100),
          foodName: food.name,
          category: food.category,
          amount,
          calories: Math.round(food.calories * amount / 100),
          protein: Math.round(food.protein * amount / 100 * 10) / 10,
          carbs: Math.round(food.carbs * amount / 100 * 10) / 10,
          fat: Math.round(food.fat * amount / 100 * 10) / 10,
          fiber: Math.round(food.fiber * amount / 100 * 10) / 10,
          mealType,
          notes: `Pencatatan ${mealType} - ${ageGroup}`,
          createdAt: new Date(currentDate)
        }
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // ============================================
  // SEED ACTIVITY LOGS
  // ============================================
  console.log('📋 Seeding Activity Logs...');
  const actions = [
    'Login berhasil',
    'Menambah data guru',
    'Mengubah data siswa',
    'Menghapus data posyandu',
    'Export data distribusi',
    'Import data guru',
    'Menambah data distribusi',
    'Membuat berita acara',
    'Update pengaturan',
    'Menambah user baru'
  ];

  for (let i = 0; i < 100; i++) {
    await prisma.activityLog.create({
      data: {
        action: randomItem(actions),
        details: `Aktivitas sistem pada ${randomDate(startDate, endDate).toLocaleDateString('id-ID')}`,
        createdAt: randomDate(startDate, endDate)
      }
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log(`
📊 Summary:
- Guru: 100 records
- Siswa: 500 records
- Posyandu: 200 records
- Relawan: 30 records
- Distribusi: ~400 records (3 bulan)
- Berita Acara Distribusi: ~150 records
- Payroll: 180 records (6 periode x 30 relawan)
- Barang Kategori: 6 records
- Barang: 25 records
- Barang Transaksi: ~500 records
- Food Diary: ~1500 records
- Activity Logs: 100 records
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
