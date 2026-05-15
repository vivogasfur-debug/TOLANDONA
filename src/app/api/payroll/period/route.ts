import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE - Hapus semua payroll dalam periode tertentu
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periode = searchParams.get('periode');
    const tahun = searchParams.get('tahun');

    if (!periode || !tahun) {
      return NextResponse.json(
        { success: false, error: 'Periode dan tahun harus diisi' },
        { status: 400 }
      );
    }

    const periodeNum = parseInt(periode);
    const tahunNum = parseInt(tahun);

    if (isNaN(periodeNum) || isNaN(tahunNum)) {
      return NextResponse.json(
        { success: false, error: 'Periode dan tahun harus berupa angka yang valid' },
        { status: 400 }
      );
    }

    const result = await db.payroll.deleteMany({
      where: {
        periode: periodeNum,
        tahun: tahunNum,
      }
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil menghapus ${result.count} record payroll`,
      count: result.count,
    });

  } catch (error) {
    console.error('Delete payroll period error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
