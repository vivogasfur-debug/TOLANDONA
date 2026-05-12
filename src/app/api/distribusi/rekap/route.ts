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
      // Filter by week in the given month and year
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      filteredData = allData.filter(d => {
        const date = new Date(d.tanggal);
        if (date < startDate || date > endDate) return false;
        
        // Calculate week number within month
        const dayOfMonth = date.getDate();
        const weekOfMonth = Math.ceil(dayOfMonth / 7);
        return weekOfMonth === week;
      });
    } else if (period === 'monthly') {
      // Filter by month and year
      filteredData = allData.filter(d => {
        const date = new Date(d.tanggal);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
      });
    } else if (period === 'yearly') {
      // Filter by year
      filteredData = allData.filter(d => {
        const date = new Date(d.tanggal);
        return date.getFullYear() === year;
      });
    }

    // Group by school
    const schoolMap = new Map<string, {
      namaSekolah: string;
      distribusi: Array<{
        kelas: string;
        jumlah: number;
        total: number;
        tanggal: Date;
      }>;
      totalJumlah: number;
      totalAll: number;
    }>();

    filteredData.forEach(d => {
      const key = d.namaSekolah;
      if (!schoolMap.has(key)) {
        schoolMap.set(key, {
          namaSekolah: d.namaSekolah,
          distribusi: [],
          totalJumlah: 0,
          totalAll: 0,
        });
      }
      
      const schoolData = schoolMap.get(key)!;
      schoolData.distribusi.push({
        kelas: d.kelas,
        jumlah: d.jumlah,
        total: d.total,
        tanggal: d.tanggal,
      });
      schoolData.totalJumlah += d.jumlah;
      schoolData.totalAll += d.total;
    });

    const rekapData = Array.from(schoolMap.values());

    // Calculate totals
    const grandTotal = {
      jumlah: filteredData.reduce((sum, d) => sum + d.jumlah, 0),
      total: filteredData.reduce((sum, d) => sum + d.total, 0),
    };

    // Get unique years for filter dropdown
    const years = [...new Set(allData.map(d => new Date(d.tanggal).getFullYear()))].sort((a, b) => b - a);

    // Get weekly summary for charts
    const weeklySummary = [];
    for (let m = 1; m <= 12; m++) {
      const monthData = allData.filter(d => {
        const date = new Date(d.tanggal);
        return date.getFullYear() === year && date.getMonth() + 1 === m;
      });
      
      if (monthData.length > 0) {
        weeklySummary.push({
          month: m,
          monthName: new Date(year, m - 1, 1).toLocaleDateString('id-ID', { month: 'short' }),
          totalJumlah: monthData.reduce((sum, d) => sum + d.jumlah, 0),
          totalAll: monthData.reduce((sum, d) => sum + d.total, 0),
          count: monthData.length,
        });
      }
    }

    // Get monthly summary for the selected year
    const monthlySummary = [];
    for (let m = 1; m <= 12; m++) {
      const monthData = allData.filter(d => {
        const date = new Date(d.tanggal);
        return date.getFullYear() === year && date.getMonth() + 1 === m;
      });
      
      monthlySummary.push({
        month: m,
        monthName: new Date(year, m - 1, 1).toLocaleDateString('id-ID', { month: 'long' }),
        totalJumlah: monthData.reduce((sum, d) => sum + d.jumlah, 0),
        totalAll: monthData.reduce((sum, d) => sum + d.total, 0),
        count: monthData.length,
      });
    }

    // Get yearly summary
    const yearlySummary = years.map(y => {
      const yearData = allData.filter(d => new Date(d.tanggal).getFullYear() === y);
      return {
        year: y,
        totalJumlah: yearData.reduce((sum, d) => sum + d.jumlah, 0),
        totalAll: yearData.reduce((sum, d) => sum + d.total, 0),
        count: yearData.length,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        rekap: rekapData,
        filteredData,
        grandTotal,
        years,
        weeklySummary,
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
