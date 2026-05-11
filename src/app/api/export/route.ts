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
    
    // Get search and filter parameters
    const search = searchParams.get('search') || '';
    const jk = searchParams.get('jk') || '';
    const sekolah = searchParams.get('sekolah') || '';
    const jenjang = searchParams.get('jenjang') || '';
    const namaSekolah = searchParams.get('namaSekolah') || '';
    const kategori = searchParams.get('kategori') || '';
    const posyandu = searchParams.get('posyandu') || '';

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

    // Build where clause for guru
    if (type === 'all' || type === 'guru') {
      const whereGuru: Record<string, unknown> = {};
      
      if (search) {
        whereGuru.OR = [
          { nama: { contains: search } },
          { nuptk: { contains: search } },
          { nik: { contains: search } },
          { nip: { contains: search } },
          { sekolah: { contains: search } },
          { alamat: { contains: search } },
        ];
      }
      if (jk) whereGuru.jk = jk;
      if (sekolah) whereGuru.sekolah = sekolah;
      
      const guruData = await db.guru.findMany({ 
        where: whereGuru,
        orderBy: { createdAt: 'asc' } 
      });
      result.guru = {
        data: guruData,
        csv: format === 'csv' ? toCSV(guruData, columnConfigs.guru) : null,
        columns: columnConfigs.guru,
      };
    }

    // Build where clause for siswa
    if (type === 'all' || type === 'siswa') {
      const whereSiswa: Record<string, unknown> = {};
      
      if (search) {
        whereSiswa.OR = [
          { nama: { contains: search } },
          { nisn: { contains: search } },
          { nik: { contains: search } },
          { namaSekolah: { contains: search } },
          { alamat: { contains: search } },
        ];
      }
      if (jk) whereSiswa.jk = jk;
      if (jenjang) whereSiswa.jenjang = jenjang;
      if (namaSekolah) whereSiswa.namaSekolah = namaSekolah;
      
      const siswaData = await db.siswa.findMany({ 
        where: whereSiswa,
        orderBy: { createdAt: 'asc' } 
      });
      result.siswa = {
        data: siswaData,
        csv: format === 'csv' ? toCSV(siswaData, columnConfigs.siswa) : null,
        columns: columnConfigs.siswa,
      };
    }

    // Build where clause for posyandu
    if (type === 'all' || type === 'posyandu') {
      const wherePosyandu: Record<string, unknown> = {};
      
      if (search) {
        wherePosyandu.OR = [
          { nama: { contains: search } },
          { nik: { contains: search } },
          { posyandu: { contains: search } },
          { alamat: { contains: search } },
        ];
      }
      if (jk) wherePosyandu.jk = jk;
      if (kategori) wherePosyandu.kategori = kategori;
      if (posyandu) wherePosyandu.posyandu = posyandu;
      
      const posyanduData = await db.posyandu.findMany({ 
        where: wherePosyandu,
        orderBy: { createdAt: 'asc' } 
      });
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
