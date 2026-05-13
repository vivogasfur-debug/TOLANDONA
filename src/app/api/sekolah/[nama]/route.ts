import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET - Ambil data siswa dan guru berdasarkan nama sekolah
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nama: string }> }
) {
  try {
    const { nama } = await params;
    const namaSekolah = decodeURIComponent(nama);

    // Ambil data siswa berdasarkan sekolah (case-insensitive untuk SQLite)
    const siswa = await db.siswa.findMany({
      where: {
        namaSekolah: {
          equals: namaSekolah,
        } as Prisma.StringNullableFilter
      },
      select: {
        kelas: true,
        jk: true
      }
    });

    // Jika tidak ketemu, coba cari dengan case berbeda
    let siswaData = siswa;
    if (siswa.length === 0) {
      // Coba cari dengan contains untuk mencari yang mirip
      siswaData = await db.siswa.findMany({
        where: {
          namaSekolah: {
            contains: namaSekolah,
          } as Prisma.StringNullableFilter
        },
        select: {
          kelas: true,
          jk: true
        }
      });
    }

    // Hitung siswa per kelas dan jenis kelamin
    const kelasCount: Record<string, { L: number; P: number }> = {};

    siswaData.forEach((s) => {
      if (!s.kelas) return;

      const kelasKey = s.kelas.toUpperCase().trim();
      if (!kelasCount[kelasKey]) {
        kelasCount[kelasKey] = { L: 0, P: 0 };
      }

      if (s.jk === 'L' || s.jk === 'Laki-laki') {
        kelasCount[kelasKey].L++;
      } else if (s.jk === 'P' || s.jk === 'Perempuan') {
        kelasCount[kelasKey].P++;
      }
    });

    // Ambil data guru berdasarkan sekolah
    const guru = await db.guru.findMany({
      where: {
        sekolah: {
          equals: namaSekolah,
        } as Prisma.StringNullableFilter
      },
      select: {
        jk: true,
        jenisTendik: true
      }
    });

    // Jika tidak ketemu, coba cari dengan contains
    let guruData = guru;
    if (guru.length === 0) {
      guruData = await db.guru.findMany({
        where: {
          sekolah: {
            contains: namaSekolah,
          } as Prisma.StringNullableFilter
        },
        select: {
          jk: true,
          jenisTendik: true
        }
      });
    }

    // Hitung guru per jenis dan jenis kelamin
    const guruCount = {
      kepsek: { L: 0, P: 0 },
      guru: { L: 0, P: 0 },
      tendik: { L: 0, P: 0 },
      nonTendik: { L: 0, P: 0 }
    };

    guruData.forEach((g) => {
      const jk = (g.jk === 'L' || g.jk === 'Laki-laki') ? 'L' : 'P';
      const tendik = g.jenisTendik?.toLowerCase() || '';

      if (tendik.includes('kepala') || tendik.includes('kepsek')) {
        guruCount.kepsek[jk as 'L' | 'P']++;
      } else if (tendik.includes('guru') && !tendik.includes('tendik')) {
        guruCount.guru[jk as 'L' | 'P']++;
      } else if (tendik.includes('tendik')) {
        guruCount.tendik[jk as 'L' | 'P']++;
      } else {
        guruCount.nonTendik[jk as 'L' | 'P']++;
      }
    });

    // Format untuk form distribusi
    const formData = {
      // TK/PAUD
      klsAL: kelasCount['A']?.L || kelasCount['KA']?.L || kelasCount['TKA']?.L || 0,
      klsAP: kelasCount['A']?.P || kelasCount['KA']?.P || kelasCount['TKA']?.P || 0,
      klsBL: kelasCount['B']?.L || kelasCount['KB']?.L || kelasCount['TKB']?.L || 0,
      klsBP: kelasCount['B']?.P || kelasCount['KB']?.P || kelasCount['TKB']?.P || 0,

      // SD/MI (Kelas 1-6)
      kls1L: kelasCount['1']?.L || kelasCount['KLS1']?.L || kelasCount['I']?.L || 0,
      kls1P: kelasCount['1']?.P || kelasCount['KLS1']?.P || kelasCount['I']?.P || 0,
      kls2L: kelasCount['2']?.L || kelasCount['KLS2']?.L || kelasCount['II']?.L || 0,
      kls2P: kelasCount['2']?.P || kelasCount['KLS2']?.P || kelasCount['II']?.P || 0,
      kls3L: kelasCount['3']?.L || kelasCount['KLS3']?.L || kelasCount['III']?.L || 0,
      kls3P: kelasCount['3']?.P || kelasCount['KLS3']?.P || kelasCount['III']?.P || 0,
      kls4L: kelasCount['4']?.L || kelasCount['KLS4']?.L || kelasCount['IV']?.L || 0,
      kls4P: kelasCount['4']?.P || kelasCount['KLS4']?.P || kelasCount['IV']?.P || 0,
      kls5L: kelasCount['5']?.L || kelasCount['KLS5']?.L || kelasCount['V']?.L || 0,
      kls5P: kelasCount['5']?.P || kelasCount['KLS5']?.P || kelasCount['V']?.P || 0,
      kls6L: kelasCount['6']?.L || kelasCount['KLS6']?.L || kelasCount['VI']?.L || 0,
      kls6P: kelasCount['6']?.P || kelasCount['KLS6']?.P || kelasCount['VI']?.P || 0,

      // SMP/MTs (Kelas 7-9)
      kls7L: kelasCount['7']?.L || kelasCount['KLS7']?.L || kelasCount['VII']?.L || 0,
      kls7P: kelasCount['7']?.P || kelasCount['KLS7']?.P || kelasCount['VII']?.P || 0,
      kls8L: kelasCount['8']?.L || kelasCount['KLS8']?.L || kelasCount['VIII']?.L || 0,
      kls8P: kelasCount['8']?.P || kelasCount['KLS8']?.P || kelasCount['VIII']?.P || 0,
      kls9L: kelasCount['9']?.L || kelasCount['KLS9']?.L || kelasCount['IX']?.L || 0,
      kls9P: kelasCount['9']?.P || kelasCount['KLS9']?.P || kelasCount['IX']?.P || 0,

      // SMA/SMK/MA (Kelas 10-12)
      kls10L: kelasCount['10']?.L || kelasCount['KLS10']?.L || kelasCount['X']?.L || 0,
      kls10P: kelasCount['10']?.P || kelasCount['KLS10']?.P || kelasCount['X']?.P || 0,
      kls11L: kelasCount['11']?.L || kelasCount['KLS11']?.L || kelasCount['XI']?.L || 0,
      kls11P: kelasCount['11']?.P || kelasCount['KLS11']?.P || kelasCount['XI']?.P || 0,
      kls12L: kelasCount['12']?.L || kelasCount['KLS12']?.L || kelasCount['XII']?.L || 0,
      kls12P: kelasCount['12']?.P || kelasCount['KLS12']?.P || kelasCount['XII']?.P || 0,

      // Guru
      kepsekL: guruCount.kepsek.L,
      kepsekP: guruCount.kepsek.P,
      guruL: guruCount.guru.L,
      guruP: guruCount.guru.P,
      tendikL: guruCount.tendik.L,
      tendikP: guruCount.tendik.P,
      nonTendikL: guruCount.nonTendik.L,
      nonTendikP: guruCount.nonTendik.P,

      // Summary
      totalSiswa: siswaData.length,
      totalGuru: guruData.length
    };

    return NextResponse.json({
      success: true,
      namaSekolah,
      kelasCount,
      data: formData
    });

  } catch (error) {
    console.error('Error fetching school data:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data sekolah' },
      { status: 500 }
    );
  }
}
