import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const divisi = searchParams.get('divisi') || '';
    const jabatan = searchParams.get('jabatan') || '';
    const jk = searchParams.get('jk') || '';

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { nik: { contains: search } },
        { divisi: { contains: search } },
        { jabatan: { contains: search } },
      ];
    }

    if (divisi) {
      where.divisi = divisi;
    }

    if (jabatan) {
      where.jabatan = jabatan;
    }

    if (jk) {
      where.jk = jk;
    }

    const [data, total] = await Promise.all([
      db.relawan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.relawan.count({ where }),
    ]);

    // Get unique filters
    const [divisiList, jabatanList] = await Promise.all([
      db.relawan.findMany({
        where: { divisi: { not: null } },
        select: { divisi: true },
        distinct: ['divisi'],
      }),
      db.relawan.findMany({
        where: { jabatan: { not: null } },
        select: { jabatan: true },
        distinct: ['jabatan'],
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
        divisi: divisiList.map(s => s.divisi).filter(Boolean),
        jabatan: jabatanList.map(s => s.jabatan).filter(Boolean),
      },
    });
  } catch (error) {
    console.error('Get relawan error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newRelawan = await db.relawan.create({
      data: {
        nama: body.nama || '',
        divisi: body.divisi || null,
        jabatan: body.jabatan || null,
        gajiPokok: body.gajiPokok || null,
        jk: body.jk || null,
        nik: body.nik || null,
        tempatLahir: body.tempatLahir || null,
        tanggalLahir: body.tanggalLahir || null,
        umur: body.umur || null,
        hariKerja: body.hariKerja || null,
        bonus: body.bonus || null,
        totalGaji: body.totalGaji || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: newRelawan,
      message: 'Data berhasil ditambahkan',
    });
  } catch (error) {
    console.error('Create relawan error:', error);
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

    const updated = await db.relawan.update({
      where: { id },
      data: cleanData,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Data berhasil diperbarui',
    });
  } catch (error) {
    console.error('Update relawan error:', error);
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

    await db.relawan.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Data berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete relawan error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus data' },
      { status: 500 }
    );
  }
}
