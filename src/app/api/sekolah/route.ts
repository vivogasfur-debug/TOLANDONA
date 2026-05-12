import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get unique schools from Guru table
    const guruSekolah = await db.guru.findMany({
      where: { sekolah: { not: null } },
      select: { sekolah: true },
      distinct: ['sekolah'],
    });

    // Get unique schools from Siswa table
    const siswaSekolah = await db.siswa.findMany({
      where: { namaSekolah: { not: null } },
      select: { namaSekolah: true },
      distinct: ['namaSekolah'],
    });

    // Combine and deduplicate
    const allSchools = new Set<string>();
    
    guruSekolah.forEach(g => {
      if (g.sekolah) allSchools.add(g.sekolah);
    });
    
    siswaSekolah.forEach(s => {
      if (s.namaSekolah) allSchools.add(s.namaSekolah);
    });

    const sekolah = Array.from(allSchools).sort();

    return NextResponse.json({
      success: true,
      sekolah,
    });
  } catch (error) {
    console.error('Error fetching sekolah:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sekolah' },
      { status: 500 }
    );
  }
}
