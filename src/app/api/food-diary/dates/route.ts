import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all dates that have food diary entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ageGroup = searchParams.get('ageGroup');
    const month = searchParams.get('month'); // Format: YYYY-MM

    // Build where clause
    const whereClause: Record<string, unknown> = {};
    
    if (ageGroup) {
      whereClause.ageGroup = ageGroup;
    }

    if (month) {
      // Parse month and create date range
      const [year, monthNum] = month.split('-').map(Number);
      const startOfMonth = new Date(year, monthNum - 1, 1);
      const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59, 999);
      
      whereClause.date = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    // Get all unique dates with entries
    const entries = await db.foodDiary.findMany({
      where: whereClause,
      select: {
        date: true,
        ageGroup: true,
      },
      orderBy: { date: 'desc' },
    });

    // Group by date
    const datesMap = new Map<string, { date: string; dewasa: number; anak: number }>();
    
    entries.forEach(entry => {
      const dateStr = entry.date.toISOString().split('T')[0];
      const existing = datesMap.get(dateStr) || { date: dateStr, dewasa: 0, anak: 0 };
      
      if (entry.ageGroup === 'dewasa') {
        existing.dewasa += 1;
      } else {
        existing.anak += 1;
      }
      
      datesMap.set(dateStr, existing);
    });

    const dates = Array.from(datesMap.values());

    return NextResponse.json({
      success: true,
      dates,
    });
  } catch (error) {
    console.error('Error fetching food diary dates:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data tanggal' },
      { status: 500 }
    );
  }
}
