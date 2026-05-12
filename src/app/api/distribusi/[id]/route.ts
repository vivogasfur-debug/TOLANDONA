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
    const { 
      namaSekolah,
      klsAL, klsAP, klsBL, klsBP,
      kls1L, kls1P, kls2L, kls2P, kls3L, kls3P,
      kls4L, kls4P, kls5L, kls5P, kls6L, kls6P,
      kls7L, kls7P, kls8L, kls8P, kls9L, kls9P,
      kls10L, kls10P, kls11L, kls11P, kls12L, kls12P,
      kepsekL, kepsekP, guruL, guruP, tendikL, tendikP, nonTendikL, nonTendikP,
      ujiOrganoleptik,
      tanggal
    } = body;

    // Calculate jumlah
    const jumlahSiswa = 
      (parseInt(klsAL) || 0) + (parseInt(klsAP) || 0) +
      (parseInt(klsBL) || 0) + (parseInt(klsBP) || 0) +
      (parseInt(kls1L) || 0) + (parseInt(kls1P) || 0) +
      (parseInt(kls2L) || 0) + (parseInt(kls2P) || 0) +
      (parseInt(kls3L) || 0) + (parseInt(kls3P) || 0) +
      (parseInt(kls4L) || 0) + (parseInt(kls4P) || 0) +
      (parseInt(kls5L) || 0) + (parseInt(kls5P) || 0) +
      (parseInt(kls6L) || 0) + (parseInt(kls6P) || 0) +
      (parseInt(kls7L) || 0) + (parseInt(kls7P) || 0) +
      (parseInt(kls8L) || 0) + (parseInt(kls8P) || 0) +
      (parseInt(kls9L) || 0) + (parseInt(kls9P) || 0) +
      (parseInt(kls10L) || 0) + (parseInt(kls10P) || 0) +
      (parseInt(kls11L) || 0) + (parseInt(kls11P) || 0) +
      (parseInt(kls12L) || 0) + (parseInt(kls12P) || 0);

    const jumlahGuru = 
      (parseInt(kepsekL) || 0) + (parseInt(kepsekP) || 0) +
      (parseInt(guruL) || 0) + (parseInt(guruP) || 0) +
      (parseInt(tendikL) || 0) + (parseInt(tendikP) || 0) +
      (parseInt(nonTendikL) || 0) + (parseInt(nonTendikP) || 0);

    const distribusi = await db.distribusi.update({
      where: { id },
      data: {
        namaSekolah,
        klsAL: parseInt(klsAL) || 0,
        klsAP: parseInt(klsAP) || 0,
        klsBL: parseInt(klsBL) || 0,
        klsBP: parseInt(klsBP) || 0,
        kls1L: parseInt(kls1L) || 0,
        kls1P: parseInt(kls1P) || 0,
        kls2L: parseInt(kls2L) || 0,
        kls2P: parseInt(kls2P) || 0,
        kls3L: parseInt(kls3L) || 0,
        kls3P: parseInt(kls3P) || 0,
        kls4L: parseInt(kls4L) || 0,
        kls4P: parseInt(kls4P) || 0,
        kls5L: parseInt(kls5L) || 0,
        kls5P: parseInt(kls5P) || 0,
        kls6L: parseInt(kls6L) || 0,
        kls6P: parseInt(kls6P) || 0,
        kls7L: parseInt(kls7L) || 0,
        kls7P: parseInt(kls7P) || 0,
        kls8L: parseInt(kls8L) || 0,
        kls8P: parseInt(kls8P) || 0,
        kls9L: parseInt(kls9L) || 0,
        kls9P: parseInt(kls9P) || 0,
        kls10L: parseInt(kls10L) || 0,
        kls10P: parseInt(kls10P) || 0,
        kls11L: parseInt(kls11L) || 0,
        kls11P: parseInt(kls11P) || 0,
        kls12L: parseInt(kls12L) || 0,
        kls12P: parseInt(kls12P) || 0,
        kepsekL: parseInt(kepsekL) || 0,
        kepsekP: parseInt(kepsekP) || 0,
        guruL: parseInt(guruL) || 0,
        guruP: parseInt(guruP) || 0,
        tendikL: parseInt(tendikL) || 0,
        tendikP: parseInt(tendikP) || 0,
        nonTendikL: parseInt(nonTendikL) || 0,
        nonTendikP: parseInt(nonTendikP) || 0,
        ujiOrganoleptik: parseInt(ujiOrganoleptik) || 0,
        jumlah: jumlahSiswa + jumlahGuru + (parseInt(ujiOrganoleptik) || 0),
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
