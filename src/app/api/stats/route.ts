import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get counts
    const [totalGuru, totalSiswa, totalPosyandu, totalRelawan] = await Promise.all([
      db.guru.count(),
      db.siswa.count(),
      db.posyandu.count(),
      db.relawan.count(),
    ]);

    // Gender distribution for Guru
    const guruGender = await db.guru.groupBy({
      by: ['jk'],
      _count: true,
    });

    // Gender distribution for Siswa
    const siswaGender = await db.siswa.groupBy({
      by: ['jk'],
      _count: true,
    });

    // Gender distribution for Posyandu
    const posyanduGender = await db.posyandu.groupBy({
      by: ['jk'],
      _count: true,
    });

    // Gender distribution for Relawan
    const relawanGender = await db.relawan.groupBy({
      by: ['jk'],
      _count: true,
    });

    // School distribution for Guru
    const guruSekolah = await db.guru.groupBy({
      by: ['sekolah'],
      _count: true,
      orderBy: { _count: { sekolah: 'desc' } },
      take: 10,
    });

    // School distribution for Siswa
    const siswaSekolah = await db.siswa.groupBy({
      by: ['namaSekolah'],
      _count: true,
      orderBy: { _count: { namaSekolah: 'desc' } },
      take: 10,
    });

    // Jenjang distribution for Siswa
    const siswaJenjang = await db.siswa.groupBy({
      by: ['jenjang'],
      _count: true,
      orderBy: { _count: { jenjang: 'desc' } },
    });

    // Posyandu distribution
    const posyanduList = await db.posyandu.groupBy({
      by: ['posyandu'],
      _count: true,
      orderBy: { _count: { posyandu: 'desc' } },
      take: 10,
    });

    // Kategori distribution for Posyandu
    const posyanduKategori = await db.posyandu.groupBy({
      by: ['kategori'],
      _count: true,
      orderBy: { _count: { kategori: 'desc' } },
    });

    // Jenis Tendik distribution
    const jenisTendik = await db.guru.groupBy({
      by: ['jenisTendik'],
      _count: true,
      orderBy: { _count: { jenisTendik: 'desc' } },
    });

    // Recent activities
    const recentActivities = await db.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalGuru,
        totalSiswa,
        totalPosyandu,
        totalRelawan,
        guruGender: guruGender.map(g => ({ name: g.jk || 'Tidak Diketahui', value: g._count })),
        siswaGender: siswaGender.map(g => ({ name: g.jk || 'Tidak Diketahui', value: g._count })),
        posyanduGender: posyanduGender.map(g => ({ name: g.jk || 'Tidak Diketahui', value: g._count })),
        relawanGender: relawanGender.map(g => ({ name: g.jk || 'Tidak Diketahui', value: g._count })),
        guruSekolah: guruSekolah.map(g => ({ name: g.sekolah || 'Tidak Diketahui', value: g._count })),
        siswaSekolah: siswaSekolah.map(g => ({ name: g.namaSekolah || 'Tidak Diketahui', value: g._count })),
        siswaJenjang: siswaJenjang.map(g => ({ name: g.jenjang || 'Tidak Diketahui', value: g._count })),
        posyanduList: posyanduList.map(g => ({ name: g.posyandu || 'Tidak Diketahui', value: g._count })),
        posyanduKategori: posyanduKategori.map(g => ({ name: g.kategori || 'Tidak Diketahui', value: g._count })),
        jenisTendik: jenisTendik.map(g => ({ name: g.jenisTendik || 'Tidak Diketahui', value: g._count })),
        recentActivities,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
