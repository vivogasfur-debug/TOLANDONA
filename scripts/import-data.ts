import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Parse CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
}

// Parse CSV file
function parseCSV(filePath: string): { headers: string[], rows: string[][] } {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map(line => parseCSVLine(line));
  
  return { headers, rows };
}

async function importGuru() {
  console.log('Importing Guru data...');
  const filePath = path.join(__dirname, '../upload/data pm tolandona fix - Guru (3).csv');
  const { headers, rows } = parseCSV(filePath);
  
  let count = 0;
  for (const row of rows) {
    if (row.length < 2) continue;
    
    const data = {
      originalId: row[0] || null,
      nama: row[1] || '',
      jk: row[2] || null,
      sekolah: row[3] || null,
      alamat: row[4] || null,
      nuptk: row[5] || null,
      jenisTendik: row[6] || null,
      nik: row[7] || null,
      nip: row[8] || null,
      tempatLahir: row[9] || null,
      tanggalLahir: row[10] || null,
      umur: row[11] || null,
    };
    
    // Skip UJI ORGANOLEPTIK entries (they're not real teachers)
    if (data.jenisTendik === 'UJI ORGANOLEPTIK' || data.nama?.includes('UJI ORGANOLEPTIK')) {
      continue;
    }
    
    try {
      await prisma.guru.create({ data });
      count++;
    } catch (error) {
      console.error(`Error inserting guru ${data.originalId}:`, error);
    }
  }
  
  console.log(`Imported ${count} Guru records`);
  return count;
}

async function importSiswa() {
  console.log('Importing Siswa data...');
  const filePath = path.join(__dirname, '../upload/data pm tolandona fix - Siswa (4).csv');
  const { headers, rows } = parseCSV(filePath);
  
  let count = 0;
  for (const row of rows) {
    if (row.length < 2) continue;
    
    const data = {
      originalId: row[0] || null,
      nama: row[1] || '',
      namaSekolah: row[2] || null,
      jk: row[3] || null,
      alamat: row[4] || null,
      tempatLahir: row[5] || null,
      tanggalLahir: row[6] || null,
      nisn: row[7] || null,
      nik: row[8] || null,
      kelas: row[9] || null,
      umur: row[10] || null,
    };
    
    try {
      await prisma.siswa.create({ data });
      count++;
    } catch (error) {
      console.error(`Error inserting siswa ${data.originalId}:`, error);
    }
  }
  
  console.log(`Imported ${count} Siswa records`);
  return count;
}

async function importPosyandu() {
  console.log('Importing Posyandu data...');
  const filePath = path.join(__dirname, '../upload/data pm tolandona fix - Posyandu (3).csv');
  const { headers, rows } = parseCSV(filePath);
  
  let count = 0;
  for (const row of rows) {
    if (row.length < 2) continue;
    
    const data = {
      originalId: row[0] || null,
      nama: row[1] || '',
      posyandu: row[2] || null,
      alamat: row[3] || null,
      kategori: row[4] || null,
      jk: row[5] || null,
      nik: row[6] || null,
      tempatLahir: row[7] || null,
      tanggalLahir: row[8] || null,
      umur: row[9] || null,
    };
    
    // Skip UJI ORGANOLEPTIK entries
    if (data.kategori === 'UJI ORGANOLEPTIK' || data.nama?.includes('UJI ORGANOLEPTIK')) {
      continue;
    }
    
    try {
      await prisma.posyandu.create({ data });
      count++;
    } catch (error) {
      console.error(`Error inserting posyandu ${data.originalId}:`, error);
    }
  }
  
  console.log(`Imported ${count} Posyandu records`);
  return count;
}

async function importRelawan() {
  console.log('Importing Relawan data...');
  const filePath = path.join(__dirname, '../upload/data pm tolandona fix - relawan (3).csv');
  const { headers, rows } = parseCSV(filePath);
  
  let count = 0;
  for (const row of rows) {
    if (row.length < 2) continue;
    
    const data = {
      originalId: row[0] || null,
      nama: row[1] || '',
      jk: row[2] || null,
      divisi: row[3] || null,
      jabatan: row[4] || null,
      nik: row[5] || null,
      tempatLahir: row[6] || null,
      tanggalLahir: row[7] || null,
      umur: row[8] || null,
      gajiPokok: row[9] || null,
      hariKerja: row[10] || null,
      bonus: row[11] || null,
      totalGaji: row[12] || null,
    };
    
    try {
      await prisma.relawan.create({ data });
      count++;
    } catch (error) {
      console.error(`Error inserting relawan ${data.originalId}:`, error);
    }
  }
  
  console.log(`Imported ${count} Relawan records`);
  return count;
}

async function main() {
  console.log('Starting data import...\n');
  
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.guru.deleteMany({});
    await prisma.siswa.deleteMany({});
    await prisma.posyandu.deleteMany({});
    await prisma.relawan.deleteMany({});
    console.log('Existing data cleared.\n');
    
    // Import all data
    const guruCount = await importGuru();
    const siswaCount = await importSiswa();
    const posyanduCount = await importPosyandu();
    const relawanCount = await importRelawan();
    
    console.log('\n=== Import Summary ===');
    console.log(`Guru: ${guruCount} records`);
    console.log(`Siswa: ${siswaCount} records`);
    console.log(`Posyandu: ${posyanduCount} records`);
    console.log(`Relawan: ${relawanCount} records`);
    console.log('======================');
    
  } catch (error) {
    console.error('Import error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
