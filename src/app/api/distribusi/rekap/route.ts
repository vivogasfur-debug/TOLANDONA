import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'all'; // all, weekly, monthly, yearly
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
    const week = parseInt(searchParams.get('week') || '1');

    // Get all distribusi data
    const allData = await db.distribusi.findMany({
      orderBy: { tanggal: 'asc' },
    });

    // Filter data based on period
    let filteredData = allData;

    if (period === 'weekly') {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      filteredData = allData.filter(d => {
        const date = new Date(d.tanggal);
        if (date < startDate || date > endDate) return false;
        const dayOfMonth = date.getDate();
        const weekOfMonth = Math.ceil(dayOfMonth / 7);
        return weekOfMonth === week;
      });
    } else if (period === 'monthly') {
      filteredData = allData.filter(d => {
        const date = new Date(d.tanggal);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
      });
    } else if (period === 'yearly') {
      filteredData = allData.filter(d => {
        const date = new Date(d.tanggal);
        return date.getFullYear() === year;
      });
    }

    // Calculate totals
    const totals = {
      siswa: {
        klsA: { L: 0, P: 0 },
        klsB: { L: 0, P: 0 },
        kls1: { L: 0, P: 0 },
        kls2: { L: 0, P: 0 },
        kls3: { L: 0, P: 0 },
        kls4: { L: 0, P: 0 },
        kls5: { L: 0, P: 0 },
        kls6: { L: 0, P: 0 },
        kls7: { L: 0, P: 0 },
        kls8: { L: 0, P: 0 },
        kls9: { L: 0, P: 0 },
        kls10: { L: 0, P: 0 },
        kls11: { L: 0, P: 0 },
        kls12: { L: 0, P: 0 },
      },
      guru: {
        kepsek: { L: 0, P: 0 },
        guru: { L: 0, P: 0 },
        tendik: { L: 0, P: 0 },
        nonTendik: { L: 0, P: 0 },
      },
      ujiOrganoleptik: 0,
      jumlah: 0,
    };

    filteredData.forEach(d => {
      // Siswa
      totals.siswa.klsA.L += d.klsAL;
      totals.siswa.klsA.P += d.klsAP;
      totals.siswa.klsB.L += d.klsBL;
      totals.siswa.klsB.P += d.klsBP;
      totals.siswa.kls1.L += d.kls1L;
      totals.siswa.kls1.P += d.kls1P;
      totals.siswa.kls2.L += d.kls2L;
      totals.siswa.kls2.P += d.kls2P;
      totals.siswa.kls3.L += d.kls3L;
      totals.siswa.kls3.P += d.kls3P;
      totals.siswa.kls4.L += d.kls4L;
      totals.siswa.kls4.P += d.kls4P;
      totals.siswa.kls5.L += d.kls5L;
      totals.siswa.kls5.P += d.kls5P;
      totals.siswa.kls6.L += d.kls6L;
      totals.siswa.kls6.P += d.kls6P;
      totals.siswa.kls7.L += d.kls7L;
      totals.siswa.kls7.P += d.kls7P;
      totals.siswa.kls8.L += d.kls8L;
      totals.siswa.kls8.P += d.kls8P;
      totals.siswa.kls9.L += d.kls9L;
      totals.siswa.kls9.P += d.kls9P;
      totals.siswa.kls10.L += d.kls10L;
      totals.siswa.kls10.P += d.kls10P;
      totals.siswa.kls11.L += d.kls11L;
      totals.siswa.kls11.P += d.kls11P;
      totals.siswa.kls12.L += d.kls12L;
      totals.siswa.kls12.P += d.kls12P;
      
      // Guru
      totals.guru.kepsek.L += d.kepsekL;
      totals.guru.kepsek.P += d.kepsekP;
      totals.guru.guru.L += d.guruL;
      totals.guru.guru.P += d.guruP;
      totals.guru.tendik.L += d.tendikL;
      totals.guru.tendik.P += d.tendikP;
      totals.guru.nonTendik.L += d.nonTendikL;
      totals.guru.nonTendik.P += d.nonTendikP;
      
      // Uji Organoleptik
      totals.ujiOrganoleptik += d.ujiOrganoleptik;
      
      // Total
      totals.jumlah += d.jumlah;
    });

    // Get unique years
    const years = [...new Set(allData.map(d => new Date(d.tanggal).getFullYear()))].sort((a, b) => b - a);

    // Monthly summary
    const monthlySummary = [];
    for (let m = 1; m <= 12; m++) {
      const monthData = allData.filter(d => {
        const date = new Date(d.tanggal);
        return date.getFullYear() === year && date.getMonth() + 1 === m;
      });
      
      monthlySummary.push({
        month: m,
        monthName: new Date(year, m - 1, 1).toLocaleDateString('id-ID', { month: 'long' }),
        jumlah: monthData.reduce((sum, d) => sum + d.jumlah, 0),
        count: monthData.length,
      });
    }

    // Yearly summary
    const yearlySummary = years.map(y => {
      const yearData = allData.filter(d => new Date(d.tanggal).getFullYear() === y);
      return {
        year: y,
        jumlah: yearData.reduce((sum, d) => sum + d.jumlah, 0),
        count: yearData.length,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        filteredData,
        totals,
        years,
        monthlySummary,
        yearlySummary,
      },
    });
  } catch (error) {
    console.error('Error fetching rekap distribusi:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rekap data' },
      { status: 500 }
    );
  }
}
