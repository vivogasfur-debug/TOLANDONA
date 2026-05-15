import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE() {
  try {
    // First delete all Payroll records that reference Relawan
    await db.payroll.deleteMany({});
    
    // Then delete all Relawan records
    await db.relawan.deleteMany({});
    
    return NextResponse.json({
      success: true,
      message: 'Semua data relawan dan payroll berhasil dihapus',
    });
  } catch (error) {
    console.error('Clear relawan error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat menghapus data' },
      { status: 500 }
    );
  }
}
