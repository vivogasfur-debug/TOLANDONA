import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get all unique schools from Guru
    const guruSekolah = await db.guru.findMany({
      where: { sekolah: { not: null } },
      select: { sekolah: true, jk: true },
    });

    // Get all unique schools from Siswa
    const siswaSekolah = await db.siswa.findMany({
      where: { namaSekolah: { not: null } },
      select: { namaSekolah: true, jk: true, jenjang: true },
    });

    // Create a map of all schools
    const schoolMap = new Map<string, {
      jenjang: string;
      guruL: number;
      guruP: number;
      siswaL: number;
      siswaP: number;
    }>();

    // Process Guru data
    for (const guru of guruSekolah) {
      if (!guru.sekolah) continue;
      const schoolName = guru.sekolah.trim();
      if (!schoolMap.has(schoolName)) {
        schoolMap.set(schoolName, { jenjang: '', guruL: 0, guruP: 0, siswaL: 0, siswaP: 0 });
      }
      const school = schoolMap.get(schoolName)!;
      if (guru.jk === 'L') school.guruL++;
      else if (guru.jk === 'P') school.guruP++;
    }

    // Process Siswa data
    for (const siswa of siswaSekolah) {
      if (!siswa.namaSekolah) continue;
      const schoolName = siswa.namaSekolah.trim();
      if (!schoolMap.has(schoolName)) {
        schoolMap.set(schoolName, { jenjang: siswa.jenjang || '', guruL: 0, guruP: 0, siswaL: 0, siswaP: 0 });
      }
      const school = schoolMap.get(schoolName)!;
      if (siswa.jenjang && !school.jenjang) {
        school.jenjang = siswa.jenjang;
      }
      if (siswa.jk === 'L') school.siswaL++;
      else if (siswa.jk === 'P') school.siswaP++;
    }

    // Convert to array and calculate totals
    const data = Array.from(schoolMap.entries())
      .map(([namaSekolah, stats]) => ({
        namaSekolah,
        jenjang: stats.jenjang || 'Tidak Diketahui',
        guruL: stats.guruL,
        guruP: stats.guruP,
        guruTotal: stats.guruL + stats.guruP,
        siswaL: stats.siswaL,
        siswaP: stats.siswaP,
        siswaTotal: stats.siswaL + stats.siswaP,
        total: stats.guruL + stats.guruP + stats.siswaL + stats.siswaP,
      }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get rekapitulasi sekolah error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
