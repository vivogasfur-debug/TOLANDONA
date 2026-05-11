import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as XLSX from 'xlsx';

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

// Convert data to Excel buffer
function toExcel(data: any[], columns: { key: string; header: string }[]): Buffer {
  const headers = columns.map(c => c.header);
  const rows = data.map(item => {
    return columns.map(col => item[col.key] ?? '');
  });
  
  const sheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  
  // Set column widths
  const colWidths = columns.map(col => ({ wch: Math.max(col.header.length, 15) }));
  worksheet['!cols'] = colWidths;
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

// Get custom headers from database or return defaults
async function getHeaders(type: string): Promise<{ key: string; header: string }[]> {
  const defaultHeaders: Record<string, { key: string; header: string }[]> = {
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
      { key: 'jk', header: 'Jenis Kelamin' },
      { key: 'jenjang', header: 'Jenjang' },
      { key: 'namaSekolah', header: 'Nama Sekolah' },
      { key: 'kelas', header: 'Kelas' },
      { key: 'alamat', header: 'Alamat' },
      { key: 'nisn', header: 'NISN' },
      { key: 'nik', header: 'NIK' },
      { key: 'tempatLahir', header: 'Tempat Lahir' },
      { key: 'tanggalLahir', header: 'Tanggal Lahir' },
      { key: 'umur', header: 'Umur' },
    ],
    posyandu: [
      { key: 'originalId', header: 'ID' },
      { key: 'nama', header: 'Nama' },
      { key: 'jk', header: 'Jenis Kelamin' },
      { key: 'posyandu', header: 'Posyandu' },
      { key: 'kategori', header: 'Kategori' },
      { key: 'alamat', header: 'Alamat' },
      { key: 'nik', header: 'NIK' },
      { key: 'tempatLahir', header: 'Tempat Lahir' },
      { key: 'tanggalLahir', header: 'Tanggal Lahir' },
      { key: 'umur', header: 'Umur' },
    ],
  };

  try {
    const setting = await db.exportSetting.findUnique({
      where: { type },
    });

    if (setting) {
      const customHeaders = JSON.parse(setting.headers);
      // Filter only enabled headers and convert to export format
      return customHeaders
        .filter((h: any) => h.enabled)
        .map((h: any) => ({ key: h.key, header: h.label }));
    }
  } catch (error) {
    console.error('Error fetching custom headers:', error);
  }

  return defaultHeaders[type] || [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // guru, siswa, posyandu, all
    const format = searchParams.get('format') || 'csv'; // csv, xlsx, or json
    
    // Get search and filter parameters
    const search = searchParams.get('search') || '';
    const jk = searchParams.get('jk') || '';
    const sekolah = searchParams.get('sekolah') || '';
    const jenjang = searchParams.get('jenjang') || '';
    const namaSekolah = searchParams.get('namaSekolah') || '';
    const kategori = searchParams.get('kategori') || '';
    const posyanduParam = searchParams.get('posyandu') || '';

    const result: Record<string, any> = {};

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
      
      const guruHeaders = await getHeaders('guru');
      result.guru = {
        data: guruData,
        headers: guruHeaders,
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
      
      const siswaHeaders = await getHeaders('siswa');
      result.siswa = {
        data: siswaData,
        headers: siswaHeaders,
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
      if (posyanduParam) wherePosyandu.posyandu = posyanduParam;
      
      const posyanduData = await db.posyandu.findMany({ 
        where: wherePosyandu,
        orderBy: { createdAt: 'asc' } 
      });
      
      const posyanduHeaders = await getHeaders('posyandu');
      result.posyandu = {
        data: posyanduData,
        headers: posyanduHeaders,
      };
    }

    // Return based on format
    if (format === 'xlsx') {
      // Create Excel file with multiple sheets if type is 'all', or single sheet
      const workbook = XLSX.utils.book_new();
      
      const typesToExport = type === 'all' ? ['guru', 'siswa', 'posyandu'] : [type];
      
      for (const t of typesToExport) {
        if (result[t]) {
          const { data, headers } = result[t];
          const sheetHeaders = headers.map((h: any) => h.header);
          const rows = data.map((item: any) => headers.map((h: any) => item[h.key] ?? ''));
          
          const sheetData = [sheetHeaders, ...rows];
          const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
          
          // Set column widths
          worksheet['!cols'] = headers.map((h: any) => ({ wch: Math.max(h.header.length, 15) }));
          
          XLSX.utils.book_append_sheet(workbook, worksheet, t.charAt(0).toUpperCase() + t.slice(1));
        }
      }
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${type === 'all' ? 'semua_data' : type + '_data'}.xlsx"`,
        },
      });
    }

    if (format === 'csv') {
      // Return CSV format
      if (type !== 'all') {
        const typeData = result[type];
        const csv = toCSV(typeData.data, typeData.headers);
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${type}_data.csv"`,
          },
        });
      } else {
        // Return all as JSON with CSV strings
        const csvData: Record<string, any> = {};
        for (const [key, value] of Object.entries(result)) {
          const v = value as any;
          csvData[key] = {
            csv: toCSV(v.data, v.headers),
            headers: v.headers,
          };
        }
        return NextResponse.json({
          success: true,
          data: csvData,
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
