import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all Kategori
export async function GET(request: NextRequest) {
  try {
    const data = await db.barangKategori.findMany({
      include: {
        _count: {
          select: { barang: true }
        }
      },
      orderBy: { nama: 'asc' }
    });
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching kategori:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data kategori' },
      { status: 500 }
    );
  }
}

// POST - Create new Kategori
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { nama, deskripsi } = body;
    
    if (!nama) {
      return NextResponse.json(
        { success: false, error: 'Nama kategori harus diisi' },
        { status: 400 }
      );
    }
    
    // Check if nama already exists
    const existing = await db.barangKategori.findFirst({
      where: { nama }
    });
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Nama kategori sudah digunakan' },
        { status: 400 }
      );
    }
    
    const data = await db.barangKategori.create({
      data: {
        nama,
        deskripsi: deskripsi || null
      }
    });
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Kategori berhasil ditambahkan'
    });
  } catch (error) {
    console.error('Error creating kategori:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan kategori' },
      { status: 500 }
    );
  }
}

// PUT - Update Kategori
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
    
    const dataToUpdate: any = {};
    
    if (updateData.nama) dataToUpdate.nama = updateData.nama;
    if (updateData.deskripsi !== undefined) dataToUpdate.deskripsi = updateData.deskripsi || null;
    
    const data = await db.barangKategori.update({
      where: { id },
      data: dataToUpdate
    });
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Kategori berhasil diperbarui'
    });
  } catch (error) {
    console.error('Error updating kategori:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui kategori' },
      { status: 500 }
    );
  }
}

// DELETE - Delete Kategori
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
    
    // Check if there are items in this category
    const barangCount = await db.barang.count({
      where: { kategoriId: id }
    });
    
    if (barangCount > 0) {
      // Set category to null for all items in this category
      await db.barang.updateMany({
        where: { kategoriId: id },
        data: { kategoriId: null }
      });
    }
    
    await db.barangKategori.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting kategori:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus kategori' },
      { status: 500 }
    );
  }
}
