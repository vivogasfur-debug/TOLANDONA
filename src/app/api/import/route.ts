import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Clean value from Excel errors and scientific notation
function cleanValue(value: string): string | null {
  if (!value || value.trim() === '') return null;
  
  const trimmed = value.trim();
  
  // Handle Excel errors
  if (trimmed === '#VALUE!' || trimmed === '#REF!' || trimmed === '#DIV/0!' || 
      trimmed === '#N/A' || trimmed === '#NAME?' || trimmed === '#NULL!' ||
      trimmed.startsWith('####')) {
    return null;
  }
  
  // Handle scientific notation like "1,54E+19" or "5.44E+19"
  if (/^\d+[,.]?\d*[eE][+-]?\d+$/.test(trimmed)) {
    // Try to convert scientific notation to regular number
    try {
      const num = parseFloat(trimmed.replace(',', '.'));
      if (!isNaN(num) && isFinite(num)) {
        return String(BigInt(Math.round(num)));
      }
    } catch {
      return null;
    }
  }
  
  // Remove commas from numbers (like "740,427,451")
  if (/^\d{1,3}(,\d{3})+$/.test(trimmed)) {
    return trimmed.replace(/,/g, '');
  }
  
  return trimmed;
}

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
    originalId: cleanValue(row['ID'] || row['id'] || ''),
    nama: cleanValue(row['Nama'] || row['nama'] || '') || '',
    jk: cleanValue(row['JK'] || row['jk'] || row['Jenis Kelamin'] || ''),
    sekolah: cleanValue(row['Sekolah'] || row['sekolah'] || ''),
    alamat: cleanValue(row['Alamat'] || row['alamat'] || ''),
    nuptk: cleanValue(row['NUPTK'] || row['nuptk'] || ''),
    jenisTendik: cleanValue(row['Jenis Tendik'] || row['jenisTendik'] || ''),
    nik: cleanValue(row['NIK'] || row['nik'] || ''),
    nip: cleanValue(row['NIP'] || row['nip'] || ''),
    tempatLahir: cleanValue(row['Tempat Lahir'] || row['tempatLahir'] || ''),
    tanggalLahir: cleanValue(row['Tanggal Lahir'] || row['tanggalLahir'] || ''),
    umur: cleanValue(row['Umur'] || row['umur'] || ''),
  };
}

// Map CSV row to Siswa data
function mapToSiswa(row: Record<string, string>): any {
  return {
    originalId: cleanValue(row['ID'] || row['id'] || ''),
    nama: cleanValue(row['Nama'] || row['nama'] || '') || '',
    jenjang: cleanValue(row['Jenjang'] || row['jenjang'] || ''),
    namaSekolah: cleanValue(row['Nama Sekolah'] || row['namaSekolah'] || ''),
    jk: cleanValue(row['JK'] || row['jk'] || row['Jenis Kelamin'] || ''),
    alamat: cleanValue(row['Alamat'] || row['alamat'] || ''),
    tempatLahir: cleanValue(row['Tempat Lahir'] || row['tempatLahir'] || ''),
    tanggalLahir: cleanValue(row['Tanggal Lahir'] || row['tanggalLahir'] || ''),
    nisn: cleanValue(row['NISN'] || row['nisn'] || ''),
    nik: cleanValue(row['NIK'] || row['nik'] || ''),
    kelas: cleanValue(row['Kelas'] || row['kelas'] || ''),
    umur: cleanValue(row['Umur'] || row['umur'] || ''),
  };
}

// Map CSV row to Posyandu data
function mapToPosyandu(row: Record<string, string>): any {
  return {
    originalId: cleanValue(row['ID'] || row['id'] || ''),
    nama: cleanValue(row['Nama'] || row['nama'] || '') || '',
    posyandu: cleanValue(row['Posyandu'] || row['posyandu'] || ''),
    alamat: cleanValue(row['Alamat'] || row['alamat'] || ''),
    kategori: cleanValue(row['Kategori'] || row['kategori'] || ''),
    jk: cleanValue(row['JK'] || row['jk'] || row['Jenis Kelamin'] || ''),
    nik: cleanValue(row['NIK'] || row['nik'] || ''),
    tempatLahir: cleanValue(row['Tempat Lahir'] || row['tempatLahir'] || ''),
    tanggalLahir: cleanValue(row['Tanggal Lahir'] || row['tanggalLahir'] || ''),
    umur: cleanValue(row['Umur'] || row['umur'] || ''),
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
      const dataToInsert = rows.map((row, index) => {
        try {
          const mapped = mapToGuru(row);
          // Only include rows with valid nama
          if (!mapped.nama || mapped.nama.trim() === '') {
            errors.push(`Baris ${index + 2}: Nama kosong, dilewati`);
            return null;
          }
          return mapped;
        } catch (e) {
          errors.push(`Baris ${index + 2}: ${e}`);
          return null;
        }
      }).filter(Boolean);

      if (dataToInsert.length > 0) {
        // Insert in batches of 100 to avoid memory issues
        const batchSize = 100;
        for (let i = 0; i < dataToInsert.length; i += batchSize) {
          const batch = dataToInsert.slice(i, i + batchSize);
          try {
            await db.guru.createMany({ data: batch });
            insertedCount += batch.length;
          } catch (batchError) {
            console.error('Batch insert error:', batchError);
            // Try inserting one by one if batch fails
            for (const item of batch) {
              try {
                await db.guru.create({ data: item });
                insertedCount++;
              } catch {
                // Skip duplicate or invalid records
              }
            }
          }
        }
      }
    } else if (type === 'siswa') {
      const dataToInsert = rows.map((row, index) => {
        try {
          const mapped = mapToSiswa(row);
          if (!mapped.nama || mapped.nama.trim() === '') {
            errors.push(`Baris ${index + 2}: Nama kosong, dilewati`);
            return null;
          }
          return mapped;
        } catch (e) {
          errors.push(`Baris ${index + 2}: ${e}`);
          return null;
        }
      }).filter(Boolean);

      if (dataToInsert.length > 0) {
        const batchSize = 100;
        for (let i = 0; i < dataToInsert.length; i += batchSize) {
          const batch = dataToInsert.slice(i, i + batchSize);
          try {
            await db.siswa.createMany({ data: batch });
            insertedCount += batch.length;
          } catch {
            for (const item of batch) {
              try {
                await db.siswa.create({ data: item });
                insertedCount++;
              } catch {
                // Skip
              }
            }
          }
        }
      }
    } else if (type === 'posyandu') {
      const dataToInsert = rows.map((row, index) => {
        try {
          const mapped = mapToPosyandu(row);
          if (!mapped.nama || mapped.nama.trim() === '') {
            errors.push(`Baris ${index + 2}: Nama kosong, dilewati`);
            return null;
          }
          return mapped;
        } catch (e) {
          errors.push(`Baris ${index + 2}: ${e}`);
          return null;
        }
      }).filter(Boolean);

      if (dataToInsert.length > 0) {
        const batchSize = 100;
        for (let i = 0; i < dataToInsert.length; i += batchSize) {
          const batch = dataToInsert.slice(i, i + batchSize);
          try {
            await db.posyandu.createMany({ data: batch });
            insertedCount += batch.length;
          } catch {
            for (const item of batch) {
              try {
                await db.posyandu.create({ data: item });
                insertedCount++;
              } catch {
                // Skip
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor ${insertedCount} data ${type}`,
      inserted: insertedCount,
      total: rows.length,
      skipped: rows.length - insertedCount,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // Show first 10 errors
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat import data: ' + String(error) },
      { status: 500 }
    );
  }
}
