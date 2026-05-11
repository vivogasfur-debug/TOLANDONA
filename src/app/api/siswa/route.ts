import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const jenjang = searchParams.get('jenjang') || '';
    const namaSekolah = searchParams.get('namaSekolah') || '';
    const jk = searchParams.get('jk') || '';

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { nisn: { contains: search } },
        { nik: { contains: search } },
      ];
    }

    if (jenjang) {
      where.jenjang = jenjang;
    }

    if (namaSekolah) {
      where.namaSekolah = namaSekolah;
    }

    if (jk) {
      where.jk = jk;
    }

    const [data, total] = await Promise.all([
      db.siswa.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.siswa.count({ where }),
    ]);

    // Get unique values for filters
    const [jenjangList, sekolahList] = await Promise.all([
      db.siswa.findMany({
        where: { jenjang: { not: null } },
        select: { jenjang: true },
        distinct: ['jenjang'],
      }),
      db.siswa.findMany({
        where: { namaSekolah: { not: null } },
        select: { namaSekolah: true },
        distinct: ['namaSekolah'],
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
        jenjang: jenjangList.map(s => s.jenjang).filter(Boolean),
        sekolah: sekolahList.map(s => s.namaSekolah).filter(Boolean),
      },
    });
  } catch (error) {
    console.error('Get siswa error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
