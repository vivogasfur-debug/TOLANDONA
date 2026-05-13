import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Ambil data payroll
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bulan = searchParams.get('bulan');
    const tahun = searchParams.get('tahun');
    const status = searchParams.get('status');

    // Build filter
    const where: Record<string, unknown> = {};
    if (bulan) where.bulan = parseInt(bulan);
    if (tahun) where.tahun = parseInt(tahun);
    if (status) where.status = status;

    // Get payroll data with relawan info
    const payroll = await db.payroll.findMany({
      where,
      include: {
        relawan: {
          select: {
            id: true,
            nama: true,
            divisi: true,
            jabatan: true,
            jk: true,
            nik: true,
            alamat: true,
          }
        }
      },
      orderBy: [
        { tahun: 'desc' },
        { bulan: 'desc' },
        { relawan: { nama: 'asc' } }
      ]
    });

    // Get summary
    const summary = await db.payroll.aggregate({
      where,
      _sum: {
        gajiPokok: true,
        bonus: true,
        potongan: true,
        totalGaji: true,
      },
      _count: {
        id: true,
      }
    });

    // Get distinct years for filter
    const years = await db.payroll.findMany({
      select: { tahun: true },
      distinct: ['tahun'],
      orderBy: { tahun: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: payroll,
      summary: {
        totalRecords: summary._count.id,
        totalGajiPokok: summary._sum.gajiPokok || 0,
        totalBonus: summary._sum.bonus || 0,
        totalPotongan: summary._sum.potongan || 0,
        grandTotal: summary._sum.totalGaji || 0,
      },
      years: years.map(y => y.tahun),
    });

  } catch (error) {
    console.error('Get payroll error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

// POST - Buat payroll baru (generate dari data relawan)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bulan, tahun, relawanData } = body;

    if (!bulan || !tahun) {
      return NextResponse.json(
        { success: false, error: 'Bulan dan tahun harus diisi' },
        { status: 400 }
      );
    }

    // Check if payroll already exists for this period
    const existing = await db.payroll.findFirst({
      where: { bulan: parseInt(bulan), tahun: parseInt(tahun) }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Payroll untuk periode ini sudah ada' },
        { status: 400 }
      );
    }

    // Get all relawan
    const relawanList = relawanData || await db.relawan.findMany();

    if (relawanList.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada data relawan' },
        { status: 400 }
      );
    }

    // Create payroll records
    const payrollRecords = [];
    for (const relawan of relawanList) {
      const gajiPokok = parseInt(relawan.gajiPokok?.replace(/\D/g, '') || '0');
      const hariKerja = parseInt(relawan.hariKerja || '0');
      const bonus = parseInt(relawan.bonus?.replace(/\D/g, '') || '0');
      const totalGaji = gajiPokok * hariKerja + bonus;

      const record = await db.payroll.create({
        data: {
          relawanId: relawan.id,
          bulan: parseInt(bulan),
          tahun: parseInt(tahun),
          gajiPokok,
          hariKerja,
          bonus,
          potongan: 0,
          totalGaji,
          status: 'pending',
        }
      });
      payrollRecords.push(record);
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil membuat ${payrollRecords.length} record payroll`,
      data: payrollRecords,
    });

  } catch (error) {
    console.error('Create payroll error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus payroll berdasarkan periode
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bulan = searchParams.get('bulan');
    const tahun = searchParams.get('tahun');

    if (!bulan || !tahun) {
      return NextResponse.json(
        { success: false, error: 'Bulan dan tahun harus diisi' },
        { status: 400 }
      );
    }

    const result = await db.payroll.deleteMany({
      where: {
        bulan: parseInt(bulan),
        tahun: parseInt(tahun),
      }
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil menghapus ${result.count} record payroll`,
    });

  } catch (error) {
    console.error('Delete payroll error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
