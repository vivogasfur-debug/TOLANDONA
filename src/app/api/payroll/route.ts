import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Ambil data payroll
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periode = searchParams.get('periode');
    const tahun = searchParams.get('tahun');
    const status = searchParams.get('status');

    // Build filter
    const where: Record<string, unknown> = {};
    if (periode && periode !== 'all') where.periode = parseInt(periode);
    if (tahun && tahun !== 'all') where.tahun = parseInt(tahun);
    if (status && status !== 'all') where.status = status;

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
            gajiPokok: true,
          }
        }
      },
      orderBy: [
        { relawan: { nama: 'asc' } }
      ]
    });

    // Calculate summary
    const summary = {
      totalRecords: payroll.length,
      totalGajiPokok: payroll.reduce((sum, p) => sum + (p.gajiHarian * p.hariKerja), 0),
      totalBonus: payroll.reduce((sum, p) => sum + p.bonus, 0),
      totalPotongan: payroll.reduce((sum, p) => sum + p.potongan, 0),
      grandTotal: payroll.reduce((sum, p) => sum + p.totalGaji, 0),
      paidCount: payroll.filter(p => p.status === 'paid').length,
      pendingCount: payroll.filter(p => p.status === 'pending').length,
    };

    // Get distinct years for filter
    const years = await db.payroll.findMany({
      select: { tahun: true },
      distinct: ['tahun'],
      orderBy: { tahun: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: payroll,
      summary,
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
    const { periode, tahun, tanggalMulai, tanggalSelesai } = body;

    console.log('Generate payroll request:', { periode, tahun, tanggalMulai, tanggalSelesai });

    if (!periode || !tahun) {
      return NextResponse.json(
        { success: false, error: 'Periode dan tahun harus diisi' },
        { status: 400 }
      );
    }

    const periodeNum = parseInt(String(periode));
    const tahunNum = parseInt(String(tahun));

    if (isNaN(periodeNum) || isNaN(tahunNum) || periodeNum < 1 || periodeNum > 26) {
      return NextResponse.json(
        { success: false, error: 'Periode harus antara 1-26 dan tahun harus valid' },
        { status: 400 }
      );
    }

    // Check if payroll already exists for this period
    const existing = await db.payroll.findFirst({
      where: { periode: periodeNum, tahun: tahunNum }
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

    // Parse dates
    const mulai = tanggalMulai ? new Date(tanggalMulai) : new Date(tahunNum, 0, 1 + ((periodeNum - 1) * 14));
    const selesai = tanggalSelesai ? new Date(tanggalSelesai) : new Date(mulai.getTime() + 13 * 24 * 60 * 60 * 1000);

    // Create payroll records from relawan data
    const payrollRecords = [];
    for (const relawan of relawanList) {
      // Parse values safely - gajiPokok from relawan becomes gajiHarian
      const gajiHarian = parseStringToNumber(relawan.gajiPokok);
      const hariKerja = 0; // Default 0, to be filled by user
      const bonus = 0; // Default 0

      // Calculate total gaji: gajiHarian * hariKerja + bonus
      const totalGaji = gajiHarian * hariKerja + bonus;

      const record = await db.payroll.create({
        data: {
          relawanId: relawan.id,
          periode: periodeNum,
          tahun: tahunNum,
          tanggalMulai: mulai,
          tanggalSelesai: selesai,
          gajiHarian,
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
      count: payrollRecords.length,
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
    const periode = searchParams.get('periode');
    const tahun = searchParams.get('tahun');

    if (!periode || !tahun) {
      return NextResponse.json(
        { success: false, error: 'Periode dan tahun harus diisi' },
        { status: 400 }
      );
    }

    const result = await db.payroll.deleteMany({
      where: {
        periode: parseInt(periode),
        tahun: parseInt(tahun),
      }
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil menghapus ${result.count} record payroll`,
      count: result.count,
    });

  } catch (error) {
    console.error('Delete payroll error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
