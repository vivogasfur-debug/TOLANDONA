import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE() {
  try {
    await db.guru.deleteMany({});
    return NextResponse.json({
      success: true,
      message: 'Semua data guru berhasil dihapus',
    });
  } catch (error) {
    console.error('Clear guru error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat menghapus data' },
      { status: 500 }
    );
  }
}
