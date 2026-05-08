import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const sekolah = searchParams.get('sekolah') || '';
    const jk = searchParams.get('jk') || '';

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { nuptk: { contains: search } },
        { nik: { contains: search } },
        { nip: { contains: search } },
      ];
    }

    if (sekolah) {
      where.sekolah = sekolah;
    }

    if (jk) {
      where.jk = jk;
    }

    const [data, total] = await Promise.all([
      db.guru.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.guru.count({ where }),
    ]);

    // Get unique schools for filter
    const schools = await db.guru.findMany({
      where: { sekolah: { not: null } },
      select: { sekolah: true },
      distinct: ['sekolah'],
    });

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
        schools: schools.map(s => s.sekolah).filter(Boolean),
      },
    });
  } catch (error) {
    console.error('Get guru error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
