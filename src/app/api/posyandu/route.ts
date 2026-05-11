import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const posyandu = searchParams.get('posyandu') || '';
    const kategori = searchParams.get('kategori') || '';
    const jk = searchParams.get('jk') || '';

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { nik: { contains: search } },
        { posyandu: { contains: search } },
      ];
    }

    if (posyandu) {
      where.posyandu = posyandu;
    }

    if (kategori) {
      where.kategori = kategori;
    }

    if (jk) {
      where.jk = jk;
    }

    const [data, total] = await Promise.all([
      db.posyandu.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.posyandu.count({ where }),
    ]);

    // Get unique filters
    const [posyanduList, kategoriList] = await Promise.all([
      db.posyandu.findMany({
        where: { posyandu: { not: null } },
        select: { posyandu: true },
        distinct: ['posyandu'],
      }),
      db.posyandu.findMany({
        where: { kategori: { not: null } },
        select: { kategori: true },
        distinct: ['kategori'],
      }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        posyandu: posyanduList.map(s => s.posyandu).filter(Boolean),
        kategori: kategoriList.map(s => s.kategori).filter(Boolean),
      },
    });
  } catch (error) {
    console.error('Get posyandu error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID diperlukan' },
        { status: 400 }
      );
    }

    const updated = await db.posyandu.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Data berhasil diperbarui',
    });
  } catch (error) {
    console.error('Update posyandu error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui data' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID diperlukan' },
        { status: 400 }
      );
    }

    await db.posyandu.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Data berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete posyandu error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus data' },
      { status: 500 }
    );
  }
}
