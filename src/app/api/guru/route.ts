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
        { nama: { contains: search, mode: 'insensitive' } },
        { nuptk: { contains: search, mode: 'insensitive' } },
        { nik: { contains: search, mode: 'insensitive' } },
        { nip: { contains: search, mode: 'insensitive' } },
        { sekolah: { contains: search, mode: 'insensitive' } },
        { alamat: { contains: search, mode: 'insensitive' } },
        { jenisTendik: { contains: search, mode: 'insensitive' } },
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newGuru = await db.guru.create({
      data: {
        nama: body.nama || '',
        jk: body.jk || null,
        sekolah: body.sekolah || null,
        alamat: body.alamat || null,
        nuptk: body.nuptk || null,
        jenisTendik: body.jenisTendik || null,
        nik: body.nik || null,
        nip: body.nip || null,
        tempatLahir: body.tempatLahir || null,
        tanggalLahir: body.tanggalLahir || null,
        umur: body.umur || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: newGuru,
      message: 'Data berhasil ditambahkan',
    });
  } catch (error) {
    console.error('Create guru error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan data' },
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

    // Clean up empty strings to null
    const cleanData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updateData)) {
      cleanData[key] = value === '' ? null : value;
    }

    const updated = await db.guru.update({
      where: { id },
      data: cleanData,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Data berhasil diperbarui',
    });
  } catch (error) {
    console.error('Update guru error:', error);
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

    await db.guru.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Data berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete guru error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus data' },
      { status: 500 }
    );
  }
}
