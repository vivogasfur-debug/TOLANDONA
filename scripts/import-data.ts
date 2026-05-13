import { db } from '../src/lib/db';
import * as fs from 'fs';
import * as path from 'path';

function parseCSV(content: string): any[] {
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of lines[i]) {
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
      else current += char;
    }
    values.push(current.trim());
    const row: any = {};
    headers.forEach((header, index) => { row[header] = values[index] || ''; });
    rows.push(row);
  }
  return rows;
}

async function main() {
  const uploadDir = '/home/z/my-project/upload';
  
  // Import Guru
  const guruPath = path.join(uploadDir, 'data pm tolandona fix - Guru.csv');
  if (fs.existsSync(guruPath)) {
    const rows = parseCSV(fs.readFileSync(guruPath, 'utf-8'))
      .filter(r => !r.Nama?.includes('UJI ORGANOLEPTIK'));
    console.log(`Importing ${rows.length} Guru records...`);
    
    for (const row of rows) {
      try {
        await db.guru.create({
          data: {
            originalId: row.ID || null,
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
      } catch (e) {}
    }
    console.log('Guru data imported!');
  }
  
  // Import Siswa (limit to 300)
  const siswaPath = path.join(uploadDir, 'data pm tolandona fix - Siswa.csv');
  if (fs.existsSync(siswaPath)) {
    const rows = parseCSV(fs.readFileSync(siswaPath, 'utf-8')).slice(0, 300);
    console.log(`Importing ${rows.length} Siswa records...`);
    
    for (const row of rows) {
      try {
        await db.siswa.create({
          data: {
            originalId: row.ID || null,
            nama: row.Nama || '',
            jenjang: row.Jenjang || null,
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
      } catch (e) {}
    }
    console.log('Siswa data imported!');
  }
  
  // Import Posyandu
  const posyanduPath = path.join(uploadDir, 'data pm tolandona fix - Posyandu.csv');
  if (fs.existsSync(posyanduPath)) {
    const rows = parseCSV(fs.readFileSync(posyanduPath, 'utf-8'))
      .filter(r => !r.Nama?.includes('UJI ORGANOLEPTIK'));
    console.log(`Importing ${rows.length} Posyandu records...`);
    
    for (const row of rows) {
      try {
        await db.posyandu.create({
          data: {
            originalId: row.ID || null,
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
      } catch (e) {}
    }
    console.log('Posyandu data imported!');
  }
  
  // Import Relawan
  const relawanPath = path.join(uploadDir, 'data pm tolandona fix - Relawan.csv');
  if (fs.existsSync(relawanPath)) {
    const rows = parseCSV(fs.readFileSync(relawanPath, 'utf-8'));
    console.log(`Importing ${rows.length} Relawan records...`);
    
    for (const row of rows) {
      try {
        await db.relawan.create({
          data: {
            originalId: row.ID || null,
            nama: row.Nama || '',
            divisi: row.Divisi || null,
            jabatan: row.Jabatan || null,
            gajiPokok: row['Gaji Pokok'] || null,
            jk: row.JK || null,
            nik: row.NIK || null,
            tempatLahir: row['TEMPAT Lahir'] || row['Tempat Lahir'] || null,
            tanggalLahir: row['Tgl LAHIR'] || row['Tanggal Lahir'] || null,
            umur: row.Umur || null,
            alamat: row.Alamat || null,
            hariKerja: row['Hari Kerja'] || null,
            bonus: row.Bonus || null,
            totalGaji: row['Total Gaji'] || null,
          }
        });
      } catch (e) {}
    }
    console.log('Relawan data imported!');
  }
  
  // Create admin user
  try {
    await db.user.create({
      data: { email: 'admin@tolandona.go.id', password: 'admin123', name: 'Administrator', role: 'admin' }
    });
    console.log('Admin user created!');
  } catch (e) { console.log('Admin user exists'); }
  
  // Create settings
  const settings = [
    { key: 'siteName', value: 'Sistem Informasi Data Kecamatan Tolandona' },
    { key: 'siteSubtitle', value: 'Dashboard Rekapitulasi & Distribusi Data' },
    { key: 'primaryColor', value: '#10b981' },
    { key: 'logoUrl', value: '' },
    { key: 'footerText', value: '© 2025 Kecamatan Tolandona - Kabupaten Buton Tengah' },
  ];
  for (const s of settings) {
    try { await db.setting.create({ data: s }); } catch (e) {}
  }
  
  console.log('Import completed!');
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
