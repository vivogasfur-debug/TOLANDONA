import { db } from '../src/lib/db';
import * as fs from 'fs';

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
  const relawanPath = '/home/z/my-project/upload/data pm tolandona fix - relawan.csv';
  
  if (fs.existsSync(relawanPath)) {
    const rows = parseCSV(fs.readFileSync(relawanPath, 'utf-8'));
    console.log(`Found ${rows.length} Relawan records to import...`);
    
    let imported = 0;
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
        imported++;
      } catch (e: unknown) {
        if (e instanceof Error) {
          console.log(`Error importing ${row.Nama}: ${e.message}`);
        }
      }
    }
    console.log(`Imported ${imported} Relawan records!`);
  } else {
    console.log('Relawan CSV file not found');
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
