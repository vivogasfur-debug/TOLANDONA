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
    const { gajiPokok, hariKerja, bonus, potongan, status, keterangan } = body;

    // Calculate total
    const gaji = parseInt(gajiPokok) || 0;
    const hari = parseInt(hariKerja) || 0;
    const b = parseInt(bonus) || 0;
    const p = parseInt(potongan) || 0;
    const totalGaji = gaji * hari + b - p;

    const payroll = await db.payroll.update({
      where: { id },
      data: {
        gajiPokok: gaji,
        hariKerja: hari,
        bonus: b,
        potongan: p,
        totalGaji,
        status: status || 'pending',
        keterangan,
        tanggalBayar: status === 'paid' ? new Date() : null,
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
