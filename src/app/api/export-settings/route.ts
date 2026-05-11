import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Default headers for each type
const defaultHeaders = {
  guru: [
    { key: 'originalId', label: 'ID', enabled: true },
    { key: 'nama', label: 'Nama', enabled: true },
    { key: 'jk', label: 'Jenis Kelamin', enabled: true },
    { key: 'sekolah', label: 'Sekolah', enabled: true },
    { key: 'alamat', label: 'Alamat', enabled: true },
    { key: 'nuptk', label: 'NUPTK', enabled: true },
    { key: 'jenisTendik', label: 'Jenis Tendik', enabled: true },
    { key: 'nik', label: 'NIK', enabled: true },
    { key: 'nip', label: 'NIP', enabled: true },
    { key: 'tempatLahir', label: 'Tempat Lahir', enabled: true },
    { key: 'tanggalLahir', label: 'Tanggal Lahir', enabled: true },
    { key: 'umur', label: 'Umur', enabled: true },
  ],
  siswa: [
    { key: 'originalId', label: 'ID', enabled: true },
    { key: 'nama', label: 'Nama', enabled: true },
    { key: 'jk', label: 'Jenis Kelamin', enabled: true },
    { key: 'jenjang', label: 'Jenjang', enabled: true },
    { key: 'namaSekolah', label: 'Nama Sekolah', enabled: true },
    { key: 'kelas', label: 'Kelas', enabled: true },
    { key: 'alamat', label: 'Alamat', enabled: true },
    { key: 'nisn', label: 'NISN', enabled: true },
    { key: 'nik', label: 'NIK', enabled: true },
    { key: 'tempatLahir', label: 'Tempat Lahir', enabled: true },
    { key: 'tanggalLahir', label: 'Tanggal Lahir', enabled: true },
    { key: 'umur', label: 'Umur', enabled: true },
  ],
  posyandu: [
    { key: 'originalId', label: 'ID', enabled: true },
    { key: 'nama', label: 'Nama', enabled: true },
    { key: 'jk', label: 'Jenis Kelamin', enabled: true },
    { key: 'posyandu', label: 'Posyandu', enabled: true },
    { key: 'kategori', label: 'Kategori', enabled: true },
    { key: 'alamat', label: 'Alamat', enabled: true },
    { key: 'nik', label: 'NIK', enabled: true },
    { key: 'tempatLahir', label: 'Tempat Lahir', enabled: true },
    { key: 'tanggalLahir', label: 'Tanggal Lahir', enabled: true },
    { key: 'umur', label: 'Umur', enabled: true },
  ],
};

// GET - Retrieve export settings for a type or all types
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type) {
      // Get settings for specific type
      const setting = await db.exportSetting.findUnique({
        where: { type },
      });

      if (setting) {
        return NextResponse.json({
          success: true,
          headers: JSON.parse(setting.headers),
        });
      }

      // Return default headers if no custom settings
      return NextResponse.json({
        success: true,
        headers: defaultHeaders[type as keyof typeof defaultHeaders] || [],
      });
    }

    // Get all export settings
    const settings = await db.exportSetting.findMany();
    const result: Record<string, any> = {};

    // Initialize with defaults
    for (const [key, headers] of Object.entries(defaultHeaders)) {
      const customSetting = settings.find(s => s.type === key);
      result[key] = customSetting ? JSON.parse(customSetting.headers) : headers;
    }

    return NextResponse.json({
      success: true,
      settings: result,
      defaults: defaultHeaders,
    });
  } catch (error) {
    console.error('Get export settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil pengaturan export' },
      { status: 500 }
    );
  }
}

// PUT - Update export settings for a type
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, headers } = body;

    if (!type || !headers) {
      return NextResponse.json(
        { success: false, error: 'Type dan headers diperlukan' },
        { status: 400 }
      );
    }

    const setting = await db.exportSetting.upsert({
      where: { type },
      update: { headers: JSON.stringify(headers) },
      create: { type, headers: JSON.stringify(headers) },
    });

    return NextResponse.json({
      success: true,
      message: 'Pengaturan export berhasil disimpan',
      data: setting,
    });
  } catch (error) {
    console.error('Update export settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan pengaturan export' },
      { status: 500 }
    );
  }
}

// DELETE - Reset export settings to default
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Type diperlukan' },
        { status: 400 }
      );
    }

    await db.exportSetting.delete({
      where: { type },
    });

    return NextResponse.json({
      success: true,
      message: 'Pengaturan export berhasil direset ke default',
      headers: defaultHeaders[type as keyof typeof defaultHeaders] || [],
    });
  } catch (error) {
    console.error('Delete export settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mereset pengaturan export' },
      { status: 500 }
    );
  }
}
