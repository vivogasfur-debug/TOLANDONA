import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Parse CSV string to array of objects
function parseCSV(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Parse CSV with proper quote handling
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

// Map CSV row to Guru data
function mapToGuru(row: Record<string, string>): any {
  return {
    originalId: row['ID'] || row['id'] || null,
    nama: row['Nama'] || row['nama'] || '',
    jk: row['Jenis Kelamin'] || row['JK'] || row['jk'] || null,
    sekolah: row['Sekolah'] || row['sekolah'] || null,
    alamat: row['Alamat'] || row['alamat'] || null,
    nuptk: row['NUPTK'] || row['nuptk'] || null,
    jenisTendik: row['Jenis Tendik'] || row['jenisTendik'] || null,
    nik: row['NIK'] || row['nik'] || null,
    nip: row['NIP'] || row['nip'] || null,
    tempatLahir: row['Tempat Lahir'] || row['tempatLahir'] || null,
    tanggalLahir: row['Tanggal Lahir'] || row['tanggalLahir'] || null,
    umur: row['Umur'] || row['umur'] || null,
  };
}

// Map CSV row to Siswa data
function mapToSiswa(row: Record<string, string>): any {
  return {
    originalId: row['ID'] || row['id'] || null,
    nama: row['Nama'] || row['nama'] || '',
    jenjang: row['Jenjang'] || row['jenjang'] || null,
    namaSekolah: row['Nama Sekolah'] || row['namaSekolah'] || null,
    jk: row['Jenis Kelamin'] || row['JK'] || row['jk'] || null,
    alamat: row['Alamat'] || row['alamat'] || null,
    tempatLahir: row['Tempat Lahir'] || row['tempatLahir'] || null,
    tanggalLahir: row['Tanggal Lahir'] || row['tanggalLahir'] || null,
    nisn: row['NISN'] || row['nisn'] || null,
    nik: row['NIK'] || row['nik'] || null,
    kelas: row['Kelas'] || row['kelas'] || null,
    umur: row['Umur'] || row['umur'] || null,
  };
}

// Map CSV row to Posyandu data
function mapToPosyandu(row: Record<string, string>): any {
  return {
    originalId: row['ID'] || row['id'] || null,
    nama: row['Nama'] || row['nama'] || '',
    posyandu: row['Posyandu'] || row['posyandu'] || null,
    alamat: row['Alamat'] || row['alamat'] || null,
    kategori: row['Kategori'] || row['kategori'] || null,
    jk: row['Jenis Kelamin'] || row['JK'] || row['jk'] || null,
    nik: row['NIK'] || row['nik'] || null,
    tempatLahir: row['Tempat Lahir'] || row['tempatLahir'] || null,
    tanggalLahir: row['Tanggal Lahir'] || row['tanggalLahir'] || null,
    umur: row['Umur'] || row['umur'] || null,
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const type = formData.get('type') as string; // guru, siswa, posyandu
    const clearExisting = formData.get('clearExisting') === 'true';
    const file = formData.get('file') as File;

    if (!file || !type) {
      return NextResponse.json(
        { success: false, error: 'File dan tipe data harus disertakan' },
        { status: 400 }
      );
    }

    const validTypes = ['guru', 'siswa', 'posyandu'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Tipe data tidak valid. Gunakan: guru, siswa, atau posyandu' },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();
    const { headers, rows } = parseCSV(fileContent);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'File kosong atau tidak memiliki data yang valid' },
        { status: 400 }
      );
    }

    // Clear existing data if requested
    if (clearExisting) {
      if (type === 'guru') {
        await db.guru.deleteMany({});
      } else if (type === 'siswa') {
        await db.siswa.deleteMany({});
      } else if (type === 'posyandu') {
        await db.posyandu.deleteMany({});
      }
    }

    // Map and insert data
    let insertedCount = 0;
    const errors: string[] = [];

    if (type === 'guru') {
      const dataToInsert = rows.map(row => {
        try {
          return mapToGuru(row);
        } catch (e) {
          errors.push(`Row ${insertedCount + 1}: ${e}`);
          return null;
        }
      }).filter(Boolean);

      if (dataToInsert.length > 0) {
        await db.guru.createMany({
          data: dataToInsert,
          skipDuplicates: true,
        });
        insertedCount = dataToInsert.length;
      }
    } else if (type === 'siswa') {
      const dataToInsert = rows.map(row => {
        try {
          return mapToSiswa(row);
        } catch (e) {
          errors.push(`Row ${insertedCount + 1}: ${e}`);
          return null;
        }
      }).filter(Boolean);

      if (dataToInsert.length > 0) {
        await db.siswa.createMany({
          data: dataToInsert,
          skipDuplicates: true,
        });
        insertedCount = dataToInsert.length;
      }
    } else if (type === 'posyandu') {
      const dataToInsert = rows.map(row => {
        try {
          return mapToPosyandu(row);
        } catch (e) {
          errors.push(`Row ${insertedCount + 1}: ${e}`);
          return null;
        }
      }).filter(Boolean);

      if (dataToInsert.length > 0) {
        await db.posyandu.createMany({
          data: dataToInsert,
          skipDuplicates: true,
        });
        insertedCount = dataToInsert.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor ${insertedCount} data ${type}`,
      inserted: insertedCount,
      total: rows.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat import data' },
      { status: 500 }
    );
  }
}
