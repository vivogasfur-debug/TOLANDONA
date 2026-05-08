import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const kategori = searchParams.get('kategori') || '';
    const posyandu = searchParams.get('posyandu') || '';
    const jk = searchParams.get('jk') || '';

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { nik: { contains: search } },
      ];
    }

    if (kategori) {
      where.kategori = kategori;
    }

    if (posyandu) {
      where.posyandu = posyandu;
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

    // Get unique values for filters
    const [kategoriList, posyanduList] = await Promise.all([
      db.posyandu.findMany({
        where: { kategori: { not: null } },
        select: { kategori: true },
        distinct: ['kategori'],
      }),
      db.posyandu.findMany({
        where: { posyandu: { not: null } },
        select: { posyandu: true },
        distinct: ['posyandu'],
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
        kategori: kategoriList.map(s => s.kategori).filter(Boolean),
        posyandu: posyanduList.map(s => s.posyandu).filter(Boolean),
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
