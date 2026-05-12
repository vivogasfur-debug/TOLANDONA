import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { namaSekolah: { contains: search } },
            { kelas: { contains: search } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      db.distribusi.findMany({
        where,
        orderBy: { tanggal: 'desc' },
        skip,
        take: limit,
      }),
      db.distribusi.count({ where }),
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
    });
  } catch (error) {
    console.error('Error fetching distribusi:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch distribusi data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { namaSekolah, kelas, jumlah, total, tanggal } = body;

    if (!namaSekolah || !kelas || jumlah === undefined || total === undefined) {
      return NextResponse.json(
        { success: false, error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    const distribusi = await db.distribusi.create({
      data: {
        namaSekolah,
        kelas,
        jumlah: parseInt(jumlah),
        total: parseInt(total),
        tanggal: tanggal ? new Date(tanggal) : new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: distribusi,
      message: 'Data distribusi berhasil ditambahkan',
    });
  } catch (error) {
    console.error('Error creating distribusi:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create distribusi' },
      { status: 500 }
    );
  }
}
