import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const tanggal = searchParams.get('tanggal');

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.namaPosyandu = { contains: search };
    }

    if (tanggal) {
      const date = new Date(tanggal);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      where.tanggal = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const [data, total] = await Promise.all([
      db.distribusiPosyandu.findMany({
        where,
        orderBy: { tanggal: 'desc' },
        skip: tanggal ? 0 : skip,
        take: tanggal ? limit : limit,
      }),
      db.distribusiPosyandu.count({ where }),
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
    console.error('Error fetching distribusi posyandu:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch distribusi posyandu data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      namaPosyandu,
      balitaL, balitaP,
      bumilP,
      busuiP,
      lansiaL, lansiaP,
      wusP,
      tanggal
    } = body;

    if (!namaPosyandu) {
      return NextResponse.json(
        { success: false, error: 'Nama posyandu harus diisi' },
        { status: 400 }
      );
    }

    // Calculate total
    const jumlah =
      (parseInt(balitaL) || 0) + (parseInt(balitaP) || 0) +
      (parseInt(bumilP) || 0) +
      (parseInt(busuiP) || 0) +
      (parseInt(lansiaL) || 0) + (parseInt(lansiaP) || 0) +
      (parseInt(wusP) || 0);

    const distribusi = await db.distribusiPosyandu.create({
      data: {
        namaPosyandu,
        balitaL: parseInt(balitaL) || 0,
        balitaP: parseInt(balitaP) || 0,
        bumilL: 0, // tidak dipakai
        bumilP: parseInt(bumilP) || 0,
        busuiL: 0, // tidak dipakai
        busuiP: parseInt(busuiP) || 0,
        lansiaL: parseInt(lansiaL) || 0,
        lansiaP: parseInt(lansiaP) || 0,
        wusL: 0, // tidak dipakai
        wusP: parseInt(wusP) || 0,
        jumlah,
        tanggal: tanggal ? new Date(tanggal) : new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: distribusi,
      message: 'Data distribusi posyandu berhasil ditambahkan',
    });
  } catch (error) {
    console.error('Error creating distribusi posyandu:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create distribusi posyandu' },
      { status: 500 }
    );
  }
}
