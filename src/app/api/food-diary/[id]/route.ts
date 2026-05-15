import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE - Delete a single food diary entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID diperlukan' },
        { status: 400 }
      );
    }

    await db.foodDiary.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Makanan berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting food diary entry:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus data' },
      { status: 500 }
    );
  }
}
