import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const distribusi = await db.distribusiPosyandu.findUnique({
      where: { id },
    });

    if (!distribusi) {
      return NextResponse.json(
        { success: false, error: 'Data tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: distribusi });
  } catch (error) {
    console.error('Error fetching distribusi posyandu:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch distribusi posyandu' },
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
    const {
      namaPosyandu,
      balitaL, balitaP,
      bumilP,
      busuiP,
      lansiaL, lansiaP,
      wusP,
      tanggal
    } = body;

    // Calculate total
    const jumlah =
      (parseInt(balitaL) || 0) + (parseInt(balitaP) || 0) +
      (parseInt(bumilP) || 0) +
      (parseInt(busuiP) || 0) +
      (parseInt(lansiaL) || 0) + (parseInt(lansiaP) || 0) +
      (parseInt(wusP) || 0);

    const distribusi = await db.distribusiPosyandu.update({
      where: { id },
      data: {
        namaPosyandu,
        balitaL: parseInt(balitaL) || 0,
        balitaP: parseInt(balitaP) || 0,
        bumilP: parseInt(bumilP) || 0,
        busuiP: parseInt(busuiP) || 0,
        lansiaL: parseInt(lansiaL) || 0,
        lansiaP: parseInt(lansiaP) || 0,
        wusP: parseInt(wusP) || 0,
        jumlah,
        tanggal: tanggal ? new Date(tanggal) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: distribusi,
      message: 'Data distribusi posyandu berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error updating distribusi posyandu:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update distribusi posyandu' },
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
    await db.distribusiPosyandu.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Data distribusi posyandu berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting distribusi posyandu:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete distribusi posyandu' },
      { status: 500 }
    );
  }
}
