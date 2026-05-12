import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const distribusi = await db.distribusi.findUnique({
      where: { id },
    });

    if (!distribusi) {
      return NextResponse.json(
        { success: false, error: 'Data tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: distribusi,
    });
  } catch (error) {
    console.error('Error fetching distribusi:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch distribusi' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { namaSekolah, kelas, jumlah, total, tanggal } = body;

    const distribusi = await db.distribusi.update({
      where: { id },
      data: {
        namaSekolah,
        kelas,
        jumlah: parseInt(jumlah),
        total: parseInt(total),
        tanggal: tanggal ? new Date(tanggal) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: distribusi,
      message: 'Data distribusi berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error updating distribusi:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update distribusi' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.distribusi.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Data distribusi berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting distribusi:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete distribusi' },
      { status: 500 }
    );
  }
}
