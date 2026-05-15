import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all Berita Acara Distribusi
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggal = searchParams.get('tanggal');
    const sekolah = searchParams.get('sekolah');
    const status = searchParams.get('status');
    
    const where: any = {};
    
    if (tanggal) {
      const date = new Date(tanggal);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      where.tanggal = {
        gte: date,
        lt: nextDay
      };
    }
    
    if (sekolah) {
      where.namaSekolah = {
        contains: sekolah
      };
    }
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    const data = await db.beritaAcaraDistribusi.findMany({
      where,
      orderBy: [
        { tanggal: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching berita acara distribusi:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data' },
      { status: 500 }
    );
  }
}

// POST - Create new Berita Acara Distribusi
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      nomor,
      tanggal,
      jam,
      namaSekolah,
      jumlahPaket,
      kondisi,
      sppgNama,
      sppgInstansi,
      penerimaNama,
      penerimaJabatan,
      keterangan,
      status,
      distribusiId
    } = body;
    
    if (!nomor || !tanggal || !namaSekolah || jumlahPaket === undefined) {
      return NextResponse.json(
        { success: false, error: 'Nomor, tanggal, nama sekolah, dan jumlah paket harus diisi' },
        { status: 400 }
      );
    }
    
    const data = await db.beritaAcaraDistribusi.create({
      data: {
        nomor,
        tanggal: new Date(tanggal),
        jam: jam || null,
        namaSekolah,
        jumlahPaket: parseInt(jumlahPaket) || 0,
        kondisi: kondisi || 'Baik',
        sppgNama: sppgNama || null,
        sppgInstansi: sppgInstansi || null,
        penerimaNama: penerimaNama || null,
        penerimaJabatan: penerimaJabatan || null,
        keterangan: keterangan || null,
        status: status || 'draft',
        distribusiId: distribusiId || null
      }
    });
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Berita acara distribusi berhasil dibuat'
    });
  } catch (error) {
    console.error('Error creating berita acara distribusi:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat berita acara' },
      { status: 500 }
    );
  }
}

// PUT - Update Berita Acara Distribusi
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID tidak ditemukan' },
        { status: 400 }
      );
    }
    
    // Prepare update data
    const dataToUpdate: any = {};
    
    if (updateData.nomor) dataToUpdate.nomor = updateData.nomor;
    if (updateData.tanggal) dataToUpdate.tanggal = new Date(updateData.tanggal);
    if (updateData.jam !== undefined) dataToUpdate.jam = updateData.jam;
    if (updateData.namaSekolah) dataToUpdate.namaSekolah = updateData.namaSekolah;
    if (updateData.jumlahPaket !== undefined) dataToUpdate.jumlahPaket = parseInt(updateData.jumlahPaket) || 0;
    if (updateData.kondisi !== undefined) dataToUpdate.kondisi = updateData.kondisi;
    if (updateData.sppgNama !== undefined) dataToUpdate.sppgNama = updateData.sppgNama;
    if (updateData.sppgInstansi !== undefined) dataToUpdate.sppgInstansi = updateData.sppgInstansi;
    if (updateData.penerimaNama !== undefined) dataToUpdate.penerimaNama = updateData.penerimaNama;
    if (updateData.penerimaJabatan !== undefined) dataToUpdate.penerimaJabatan = updateData.penerimaJabatan;
    if (updateData.keterangan !== undefined) dataToUpdate.keterangan = updateData.keterangan;
    if (updateData.status) dataToUpdate.status = updateData.status;
    if (updateData.distribusiId !== undefined) dataToUpdate.distribusiId = updateData.distribusiId;
    
    const data = await db.beritaAcaraDistribusi.update({
      where: { id },
      data: dataToUpdate
    });
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Berita acara distribusi berhasil diperbarui'
    });
  } catch (error) {
    console.error('Error updating berita acara distribusi:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui berita acara' },
      { status: 500 }
    );
  }
}

// DELETE - Delete Berita Acara Distribusi
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID tidak ditemukan' },
        { status: 400 }
      );
    }
    
    await db.beritaAcaraDistribusi.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Berita acara distribusi berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting berita acara distribusi:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus berita acara' },
      { status: 500 }
    );
  }
}
