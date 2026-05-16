import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all Transaksi with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barangId = searchParams.get('barangId');
    const jenis = searchParams.get('jenis');
    const tanggalMulai = searchParams.get('tanggalMulai');
    const tanggalSelesai = searchParams.get('tanggalSelesai');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const where: any = {};
    
    if (barangId) {
      where.barangId = barangId;
    }
    
    if (jenis && jenis !== 'all') {
      where.jenis = jenis;
    }
    
    if (tanggalMulai || tanggalSelesai) {
      where.tanggal = {};
      if (tanggalMulai) {
        where.tanggal.gte = new Date(tanggalMulai);
      }
      if (tanggalSelesai) {
        const endDate = new Date(tanggalSelesai);
        endDate.setHours(23, 59, 59, 999);
        where.tanggal.lte = endDate;
      }
    }
    
    const [data, total] = await Promise.all([
      db.barangTransaksi.findMany({
        where,
        include: {
          barang: {
            include: { kategori: true }
          }
        },
        orderBy: { tanggal: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.barangTransaksi.count({ where })
    ]);
    
    // Calculate summary
    const summary = await db.barangTransaksi.aggregate({
      where,
      _sum: {
        totalHarga: true,
        jumlah: true
      },
      _count: true
    });
    
    const masukSummary = await db.barangTransaksi.aggregate({
      where: { ...where, jenis: 'masuk' },
      _sum: { totalHarga: true, jumlah: true }
    });
    
    const keluarSummary = await db.barangTransaksi.aggregate({
      where: { ...where, jenis: 'keluar' },
      _sum: { totalHarga: true, jumlah: true }
    });
    
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: {
        total: summary._sum.totalHarga || 0,
        jumlah: summary._sum.jumlah || 0,
        count: summary._count,
        masuk: {
          total: masukSummary._sum.totalHarga || 0,
          jumlah: masukSummary._sum.jumlah || 0
        },
        keluar: {
          total: keluarSummary._sum.totalHarga || 0,
          jumlah: keluarSummary._sum.jumlah || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching transaksi:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data transaksi' },
      { status: 500 }
    );
  }
}

// POST - Create new Transaksi
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      barangId,
      jenis,
      jumlah,
      hargaSatuan,
      tanggal,
      keterangan,
      referensi,
      penerima,
      pengirim,
      userId
    } = body;
    
    if (!barangId || !jenis || !jumlah) {
      return NextResponse.json(
        { success: false, error: 'Barang, jenis, dan jumlah harus diisi' },
        { status: 400 }
      );
    }
    
    // Get current barang
    const barang = await db.barang.findUnique({
      where: { id: barangId }
    });
    
    if (!barang) {
      return NextResponse.json(
        { success: false, error: 'Barang tidak ditemukan' },
        { status: 404 }
      );
    }
    
    const jumlahInt = parseInt(jumlah) || 0;
    const harga = parseInt(hargaSatuan) || barang.harga;
    const totalHarga = jumlahInt * harga;
    
    // Create transaction and update stock
    const [transaksi, updatedBarang] = await db.$transaction([
      db.barangTransaksi.create({
        data: {
          barangId,
          jenis,
          jumlah: jumlahInt,
          hargaSatuan: harga,
          totalHarga,
          tanggal: tanggal ? new Date(tanggal) : new Date(),
          keterangan: keterangan || null,
          referensi: referensi || null,
          penerima: penerima || null,
          pengirim: pengirim || null,
          userId: userId || null
        },
        include: {
          barang: { include: { kategori: true } }
        }
      }),
      db.barang.update({
        where: { id: barangId },
        data: {
          stok: jenis === 'masuk' 
            ? barang.stok + jumlahInt 
            : barang.stok - jumlahInt,
          harga: harga // Update current price
        }
      })
    ]);
    
    // Check if stock is below minimum
    const lowStock = updatedBarang.stok <= updatedBarang.stokMin;
    
    return NextResponse.json({
      success: true,
      data: transaksi,
      message: `Transaksi berhasil dicatat. Stok ${updatedBarang.nama}: ${updatedBarang.stok} ${updatedBarang.satuan}`,
      lowStock
    });
  } catch (error) {
    console.error('Error creating transaksi:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mencatat transaksi' },
      { status: 500 }
    );
  }
}

// PUT - Update Transaksi
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
    
    // Get existing transaction
    const existing = await db.barangTransaksi.findUnique({
      where: { id }
    });
    
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }
    
    const dataToUpdate: any = {};
    
    if (updateData.tanggal) dataToUpdate.tanggal = new Date(updateData.tanggal);
    if (updateData.keterangan !== undefined) dataToUpdate.keterangan = updateData.keterangan || null;
    if (updateData.referensi !== undefined) dataToUpdate.referensi = updateData.referensi || null;
    if (updateData.penerima !== undefined) dataToUpdate.penerima = updateData.penerima || null;
    if (updateData.pengirim !== undefined) dataToUpdate.pengirim = updateData.pengirim || null;
    
    const data = await db.barangTransaksi.update({
      where: { id },
      data: dataToUpdate,
      include: { barang: { include: { kategori: true } } }
    });
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Transaksi berhasil diperbarui'
    });
  } catch (error) {
    console.error('Error updating transaksi:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui transaksi' },
      { status: 500 }
    );
  }
}

// DELETE - Delete Transaksi
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
    
    // Get existing transaction
    const existing = await db.barangTransaksi.findUnique({
      where: { id }
    });
    
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Reverse stock change and delete transaction
    const barang = await db.barang.findUnique({
      where: { id: existing.barangId }
    });
    
    if (barang) {
      await db.$transaction([
        db.barangTransaksi.delete({ where: { id } }),
        db.barang.update({
          where: { id: existing.barangId },
          data: {
            stok: existing.jenis === 'masuk'
              ? barang.stok - existing.jumlah
              : barang.stok + existing.jumlah
          }
        })
      ]);
    } else {
      await db.barangTransaksi.delete({ where: { id } });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil dihapus dan stok dikembalikan'
    });
  } catch (error) {
    console.error('Error deleting transaksi:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus transaksi' },
      { status: 500 }
    );
  }
}
