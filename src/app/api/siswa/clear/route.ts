import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE() {
  try {
    await db.siswa.deleteMany({});
    return NextResponse.json({
      success: true,
      message: 'Semua data siswa berhasil dihapus',
    });
  } catch (error) {
    console.error('Clear siswa error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat menghapus data' },
      { status: 500 }
    );
  }
}
