import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const namaSekolah = searchParams.get('namaSekolah') || '';
    const jenjang = searchParams.get('jenjang') || '';
    const jk = searchParams.get('jk') || '';

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { nisn: { contains: search, mode: 'insensitive' } },
        { nik: { contains: search, mode: 'insensitive' } },
        { namaSekolah: { contains: search, mode: 'insensitive' } },
        { alamat: { contains: search, mode: 'insensitive' } },
        { kelas: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (namaSekolah) {
      where.namaSekolah = namaSekolah;
    }

    if (jenjang) {
      where.jenjang = jenjang;
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

    // Get unique filters
    const [sekolahList, jenjangList] = await Promise.all([
      db.siswa.findMany({
        where: { namaSekolah: { not: null } },
        select: { namaSekolah: true },
        distinct: ['namaSekolah'],
      }),
      db.siswa.findMany({
        where: { jenjang: { not: null } },
        select: { jenjang: true },
        distinct: ['jenjang'],
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
        sekolah: sekolahList.map(s => s.namaSekolah).filter(Boolean),
        jenjang: jenjangList.map(s => s.jenjang).filter(Boolean),
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newSiswa = await db.siswa.create({
      data: {
        nama: body.nama || '',
        jenjang: body.jenjang || null,
        namaSekolah: body.namaSekolah || null,
        jk: body.jk || null,
        alamat: body.alamat || null,
        tempatLahir: body.tempatLahir || null,
        tanggalLahir: body.tanggalLahir || null,
        nisn: body.nisn || null,
        nik: body.nik || null,
        kelas: body.kelas || null,
        umur: body.umur || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: newSiswa,
      message: 'Data berhasil ditambahkan',
    });
  } catch (error) {
    console.error('Create siswa error:', error);
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

    const updated = await db.siswa.update({
      where: { id },
      data: cleanData,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Data berhasil diperbarui',
    });
  } catch (error) {
    console.error('Update siswa error:', error);
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

    await db.siswa.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Data berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete siswa error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus data' },
      { status: 500 }
    );
  }
}
