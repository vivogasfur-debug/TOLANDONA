import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch food diary entries by date and age group
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const ageGroup = searchParams.get('ageGroup');

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Tanggal diperlukan' },
        { status: 400 }
      );
    }

    // Parse date and create date range for the entire day
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const whereClause: Record<string, unknown> = {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    if (ageGroup) {
      whereClause.ageGroup = ageGroup;
    }

    const entries = await db.foodDiary.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
    });

    // Calculate totals
    const totals = entries.reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.calories,
        protein: acc.protein + entry.protein,
        carbs: acc.carbs + entry.carbs,
        fat: acc.fat + entry.fat,
        fiber: acc.fiber + entry.fiber,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    return NextResponse.json({
      success: true,
      entries,
      totals,
      count: entries.length,
    });
  } catch (error) {
    console.error('Error fetching food diary:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data diary makanan' },
      { status: 500 }
    );
  }
}

// POST - Save food diary entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      date,
      ageGroup,
      foodId,
      foodName,
      category,
      amount,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      mealType,
      notes,
    } = body;

    if (!date || !ageGroup || !foodName) {
      return NextResponse.json(
        { success: false, error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    const entry = await db.foodDiary.create({
      data: {
        date: new Date(date),
        ageGroup,
        foodId: foodId || 0,
        foodName,
        category: category || 'Lainnya',
        amount: amount || 100,
        calories: calories || 0,
        protein: protein || 0,
        carbs: carbs || 0,
        fat: fat || 0,
        fiber: fiber || 0,
        mealType: mealType || null,
        notes: notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      entry,
      message: 'Makanan berhasil disimpan',
    });
  } catch (error) {
    console.error('Error saving food diary:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan data diary makanan' },
      { status: 500 }
    );
  }
}

// DELETE - Clear all entries for a date and age group
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const ageGroup = searchParams.get('ageGroup');

    if (!date || !ageGroup) {
      return NextResponse.json(
        { success: false, error: 'Tanggal dan kategori usia diperlukan' },
        { status: 400 }
      );
    }

    // Parse date and create date range for the entire day
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await db.foodDiary.deleteMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ageGroup,
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: 'Semua data makanan berhasil dihapus',
    });
  } catch (error) {
    console.error('Error clearing food diary:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus data diary makanan' },
      { status: 500 }
    );
  }
}
