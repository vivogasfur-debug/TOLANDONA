import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch single berita acara by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const item = await db.beritaAcara.findUnique({
      where: { id },
    });
    
    if (!item) {
      return NextResponse.json({ success: false, error: 'Data tidak ditemukan' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Error fetching berita acara:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// PUT - Update berita acara
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      nomor,
      tanggal,
      judul,
      lokasi,
      peserta,
      uraian,
      kesimpulan,
      tindakLanjut,
      picNama,
      picJabatan,
      status,
      kategori,
      lampiran,
    } = body;
    
    const data = await db.beritaAcara.update({
      where: { id },
      data: {
        nomor,
        tanggal: new Date(tanggal),
        judul,
        lokasi: lokasi || null,
        peserta: peserta || null,
        uraian,
        kesimpulan: kesimpulan || null,
        tindakLanjut: tindakLanjut || null,
        picNama: picNama || null,
        picJabatan: picJabatan || null,
        status: status || 'draft',
        kategori: kategori || null,
        lampiran: lampiran || null,
      },
    });
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating berita acara:', error);
    return NextResponse.json({ success: false, error: 'Gagal memperbarui data' }, { status: 500 });
  }
}

// DELETE - Delete berita acara
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.beritaAcara.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true, message: 'Data berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting berita acara:', error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus data' }, { status: 500 });
  }
}
