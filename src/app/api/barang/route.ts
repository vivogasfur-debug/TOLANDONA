import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all Barang with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const kategori = searchParams.get('kategori');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { kode: { contains: search } },
        { nama: { contains: search } },
      ];
    }
    
    if (kategori) {
      where.kategoriId = kategori;
    }
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    const [data, total] = await Promise.all([
      db.barang.findMany({
        where,
        include: {
          kategori: true,
          _count: {
            select: { transaksi: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.barang.count({ where })
    ]);
    
    // Get low stock items
    const lowStockItems = data.filter(item => item.stok <= item.stokMin);
    
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      lowStockCount: lowStockItems.length,
      lowStockItems
    });
  } catch (error) {
    console.error('Error fetching barang:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data barang' },
      { status: 500 }
    );
  }
}

// POST - Create new Barang
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      kode,
      nama,
      kategoriId,
      satuan,
      stok,
      stokMin,
      harga,
      lokasi,
      keterangan,
      status
    } = body;
    
    if (!kode || !nama || !satuan) {
      return NextResponse.json(
        { success: false, error: 'Kode, nama, dan satuan harus diisi' },
        { status: 400 }
      );
    }
    
    // Check if kode already exists
    const existing = await db.barang.findUnique({
      where: { kode }
    });
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Kode barang sudah digunakan' },
        { status: 400 }
      );
    }
    
    const data = await db.barang.create({
      data: {
        kode,
        nama,
        kategoriId: kategoriId || null,
        satuan,
        stok: parseInt(stok) || 0,
        stokMin: parseInt(stokMin) || 0,
        harga: parseInt(harga) || 0,
        lokasi: lokasi || null,
        keterangan: keterangan || null,
        status: status || 'aktif'
      },
      include: { kategori: true }
    });
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Barang berhasil ditambahkan'
    });
  } catch (error) {
    console.error('Error creating barang:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan barang' },
      { status: 500 }
    );
  }
}

// PUT - Update Barang
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
    
    // Check if kode already exists (for different item)
    if (updateData.kode) {
      const existing = await db.barang.findFirst({
        where: {
          kode: updateData.kode,
          NOT: { id }
        }
      });
      
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Kode barang sudah digunakan' },
          { status: 400 }
        );
      }
    }
    
    const dataToUpdate: any = {};
    
    if (updateData.kode) dataToUpdate.kode = updateData.kode;
    if (updateData.nama) dataToUpdate.nama = updateData.nama;
    if (updateData.kategoriId !== undefined) dataToUpdate.kategoriId = updateData.kategoriId || null;
    if (updateData.satuan) dataToUpdate.satuan = updateData.satuan;
    if (updateData.stok !== undefined) dataToUpdate.stok = parseInt(updateData.stok) || 0;
    if (updateData.stokMin !== undefined) dataToUpdate.stokMin = parseInt(updateData.stokMin) || 0;
    if (updateData.harga !== undefined) dataToUpdate.harga = parseInt(updateData.harga) || 0;
    if (updateData.lokasi !== undefined) dataToUpdate.lokasi = updateData.lokasi || null;
    if (updateData.keterangan !== undefined) dataToUpdate.keterangan = updateData.keterangan || null;
    if (updateData.status) dataToUpdate.status = updateData.status;
    
    const data = await db.barang.update({
      where: { id },
      data: dataToUpdate,
      include: { kategori: true }
    });
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Barang berhasil diperbarui'
    });
  } catch (error) {
    console.error('Error updating barang:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui barang' },
      { status: 500 }
    );
  }
}

// DELETE - Delete Barang
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
    
    // Check if there are transactions
    const transaksiCount = await db.barangTransaksi.count({
      where: { barangId: id }
    });
    
    if (transaksiCount > 0) {
      // Soft delete - just set status to nonaktif
      await db.barang.update({
        where: { id },
        data: { status: 'nonaktif' }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Barang dinonaktifkan karena memiliki riwayat transaksi'
      });
    }
    
    await db.barang.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Barang berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting barang:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus barang' },
      { status: 500 }
    );
  }
}
