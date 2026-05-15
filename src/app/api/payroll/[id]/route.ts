import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Ambil detail payroll by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const payroll = await db.payroll.findUnique({
      where: { id },
      include: {
        relawan: true,
      }
    });

    if (!payroll) {
      return NextResponse.json(
        { success: false, error: 'Data payroll tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payroll,
    });

  } catch (error) {
    console.error('Get payroll detail error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

// PUT - Update payroll by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { gajiHarian, hariKerja, bonus, potongan, status, keterangan } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};

    // If status is provided (for simple status toggle)
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'paid') {
        updateData.tanggalBayar = new Date();
      } else {
        updateData.tanggalBayar = null;
      }
    }

    // If financial data is provided, recalculate total
    if (gajiHarian !== undefined || hariKerja !== undefined || bonus !== undefined || potongan !== undefined) {
      // Get existing record first
      const existing = await db.payroll.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Data payroll tidak ditemukan' },
          { status: 404 }
        );
      }

      const gaji = gajiHarian !== undefined ? parseInt(gajiHarian) : existing.gajiHarian;
      const hari = hariKerja !== undefined ? parseInt(hariKerja) : existing.hariKerja;
      const b = bonus !== undefined ? parseInt(bonus) : existing.bonus;
      const p = potongan !== undefined ? parseInt(potongan) : existing.potongan;

      updateData.gajiHarian = gaji;
      updateData.hariKerja = hari;
      updateData.bonus = b;
      updateData.potongan = p;
      updateData.totalGaji = gaji * hari + b - p;
    }

    if (keterangan !== undefined) {
      updateData.keterangan = keterangan;
    }

    const payroll = await db.payroll.update({
      where: { id },
      data: updateData,
      include: {
        relawan: {
          select: { nama: true, divisi: true, jabatan: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Data payroll berhasil diupdate',
      data: payroll,
    });

  } catch (error) {
    console.error('Update payroll error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus payroll by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.payroll.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Data payroll berhasil dihapus',
    });

  } catch (error) {
    console.error('Delete payroll error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
