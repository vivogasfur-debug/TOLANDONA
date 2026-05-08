import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Convert data to CSV format
function toCSV(data: any[], columns: { key: string; header: string }[]): string {
  const headerRow = columns.map(c => c.header).join(',');
  const dataRows = data.map(item => {
    return columns.map(col => {
      const value = item[col.key] ?? '';
      // Escape quotes and wrap in quotes if contains comma or newline
      const strValue = String(value);
      if (strValue.includes(',') || strValue.includes('\n') || strValue.includes('"')) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    }).join(',');
  }).join('\n');
  
  return `${headerRow}\n${dataRows}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // guru, siswa, posyandu, all
    const format = searchParams.get('format') || 'csv'; // csv or json

    const result: Record<string, any> = {};

    // Define columns for each type
    const columnConfigs = {
      guru: [
        { key: 'originalId', header: 'ID' },
        { key: 'nama', header: 'Nama' },
        { key: 'jk', header: 'Jenis Kelamin' },
        { key: 'sekolah', header: 'Sekolah' },
        { key: 'alamat', header: 'Alamat' },
        { key: 'nuptk', header: 'NUPTK' },
        { key: 'jenisTendik', header: 'Jenis Tendik' },
        { key: 'nik', header: 'NIK' },
        { key: 'nip', header: 'NIP' },
        { key: 'tempatLahir', header: 'Tempat Lahir' },
        { key: 'tanggalLahir', header: 'Tanggal Lahir' },
        { key: 'umur', header: 'Umur' },
      ],
      siswa: [
        { key: 'originalId', header: 'ID' },
        { key: 'nama', header: 'Nama' },
        { key: 'jenjang', header: 'Jenjang' },
        { key: 'namaSekolah', header: 'Nama Sekolah' },
        { key: 'jk', header: 'Jenis Kelamin' },
        { key: 'alamat', header: 'Alamat' },
        { key: 'tempatLahir', header: 'Tempat Lahir' },
        { key: 'tanggalLahir', header: 'Tanggal Lahir' },
        { key: 'nisn', header: 'NISN' },
        { key: 'nik', header: 'NIK' },
        { key: 'kelas', header: 'Kelas' },
        { key: 'umur', header: 'Umur' },
      ],
      posyandu: [
        { key: 'originalId', header: 'ID' },
        { key: 'nama', header: 'Nama' },
        { key: 'posyandu', header: 'Posyandu' },
        { key: 'alamat', header: 'Alamat' },
        { key: 'kategori', header: 'Kategori' },
        { key: 'jk', header: 'Jenis Kelamin' },
        { key: 'nik', header: 'NIK' },
        { key: 'tempatLahir', header: 'Tempat Lahir' },
        { key: 'tanggalLahir', header: 'Tanggal Lahir' },
        { key: 'umur', header: 'Umur' },
      ],
    };

    if (type === 'all' || type === 'guru') {
      const guruData = await db.guru.findMany({ orderBy: { createdAt: 'asc' } });
      result.guru = {
        data: guruData,
        csv: format === 'csv' ? toCSV(guruData, columnConfigs.guru) : null,
        columns: columnConfigs.guru,
      };
    }

    if (type === 'all' || type === 'siswa') {
      const siswaData = await db.siswa.findMany({ orderBy: { createdAt: 'asc' } });
      result.siswa = {
        data: siswaData,
        csv: format === 'csv' ? toCSV(siswaData, columnConfigs.siswa) : null,
        columns: columnConfigs.siswa,
      };
    }

    if (type === 'all' || type === 'posyandu') {
      const posyanduData = await db.posyandu.findMany({ orderBy: { createdAt: 'asc' } });
      result.posyandu = {
        data: posyanduData,
        csv: format === 'csv' ? toCSV(posyanduData, columnConfigs.posyandu) : null,
        columns: columnConfigs.posyandu,
      };
    }

    if (format === 'csv') {
      // Return CSV format
      if (type !== 'all') {
        const typeData = result[type];
        return new NextResponse(typeData.csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${type}_data.csv"`,
          },
        });
      } else {
        // Return all as JSON with CSV strings
        return NextResponse.json({
          success: true,
          data: result,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat export data' },
      { status: 500 }
    );
  }
}
