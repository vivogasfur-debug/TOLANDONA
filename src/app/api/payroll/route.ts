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

// Helper function to parse string currency/number safely
function parseStringToNumber(value: string | null | undefined): number {
  if (!value) return 0;
  try {
    const cleaned = String(value).replace(/[^\d]/g, '');
    return parseInt(cleaned) || 0;
  } catch {
    return 0;
  }
}

// POST - Buat payroll baru (generate dari data relawan)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bulan, tahun } = body;

    console.log('Generate payroll request:', { bulan, tahun });

    if (!bulan || !tahun) {
      return NextResponse.json(
        { success: false, error: 'Bulan dan tahun harus diisi' },
        { status: 400 }
      );
    }

    const bulanNum = parseInt(String(bulan));
    const tahunNum = parseInt(String(tahun));

    if (isNaN(bulanNum) || isNaN(tahunNum)) {
      return NextResponse.json(
        { success: false, error: 'Bulan dan tahun harus berupa angka yang valid' },
        { status: 400 }
      );
    }

    // Check if payroll already exists for this period
    const existing = await db.payroll.findFirst({
      where: { bulan: bulanNum, tahun: tahunNum }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Payroll untuk periode ini sudah ada. Hapus payroll lama terlebih dahulu.' },
        { status: 400 }
      );
    }

    // Get all relawan from database
    const relawanList = await db.relawan.findMany();
    console.log('Found relawan:', relawanList.length);

    if (relawanList.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada data relawan di database. Silakan tambah data relawan terlebih dahulu.' },
        { status: 400 }
      );
    }

    // Create payroll records from relawan data
    const payrollRecords = [];
    for (const relawan of relawanList) {
      console.log('Processing relawan:', relawan.nama, {
        gajiPokok: relawan.gajiPokok,
        hariKerja: relawan.hariKerja,
        bonus: relawan.bonus
      });

      // Parse values safely
      const gajiPokok = parseStringToNumber(relawan.gajiPokok);
      const hariKerja = parseStringToNumber(relawan.hariKerja);
      const bonus = parseStringToNumber(relawan.bonus);

      // Calculate total gaji: gajiPokok * hariKerja + bonus
      const totalGaji = gajiPokok * hariKerja + bonus;

      console.log('Calculated:', { gajiPokok, hariKerja, bonus, totalGaji });

      const record = await db.payroll.create({
        data: {
          relawanId: relawan.id,
          bulan: bulanNum,
          tahun: tahunNum,
          gajiPokok,
          hariKerja,
          bonus,
          potongan: 0,
          totalGaji,
          status: 'pending',
        },
        include: {
          relawan: {
            select: {
              nama: true,
              divisi: true,
              jabatan: true,
            }
          }
        }
      });
      payrollRecords.push(record);
    }

    console.log('Created payroll records:', payrollRecords.length);

    return NextResponse.json({
      success: true,
      message: `Berhasil membuat payroll untuk ${payrollRecords.length} relawan`,
      data: payrollRecords,
    });

  } catch (error) {
    console.error('Create payroll error:', error);
    return NextResponse.json(
      { success: false, error: `Terjadi kesalahan pada server: ${error instanceof Error ? error.message : 'Unknown error'}` },
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
