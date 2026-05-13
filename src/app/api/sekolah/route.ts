import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Function to detect school type from name
function detectSchoolType(name: string): 'TK' | 'SD' | 'SMP' | 'SMA' | 'UNKNOWN' {
  const lowerName = name.toLowerCase();
  
  // TK/PAUD/RA detection
  if (
    lowerName.includes('tk ') || 
    lowerName.startsWith('tk') ||
    lowerName.includes(' paud') ||
    lowerName.startsWith('paud') ||
    lowerName.includes('ra ') ||
    lowerName.startsWith('ra') ||
    lowerName.includes('taman kanak-kanak') ||
    lowerName.includes('raudhatul athfal')
  ) {
    return 'TK';
  }
  
  // SD/MI detection
  if (
    lowerName.includes('sd ') ||
    lowerName.startsWith('sd') ||
    lowerName.includes(' sd') ||
    lowerName.includes('mi ') ||
    lowerName.startsWith('mi') ||
    lowerName.includes(' mi') ||
    lowerName.includes('sekolah dasar') ||
    lowerName.includes('madrasah ibtidaiyah')
  ) {
    return 'SD';
  }
  
  // SMP/MTs detection
  if (
    lowerName.includes('smp ') ||
    lowerName.startsWith('smp') ||
    lowerName.includes(' smp') ||
    lowerName.includes('mts ') ||
    lowerName.startsWith('mts') ||
    lowerName.includes(' mts') ||
    lowerName.includes('sekolah menengah pertama') ||
    lowerName.includes('madrasah tsanawiyah')
  ) {
    return 'SMP';
  }
  
  // SMA/SMK/MA detection
  if (
    lowerName.includes('sma ') ||
    lowerName.startsWith('sma') ||
    lowerName.includes(' sma') ||
    lowerName.includes('smk ') ||
    lowerName.startsWith('smk') ||
    lowerName.includes(' smk') ||
    lowerName.includes('ma ') ||
    lowerName.startsWith('ma') ||
    lowerName.includes(' ma ') ||
    lowerName.includes('sekolah menengah atas') ||
    lowerName.includes('sekolah menengah kejuruan') ||
    lowerName.includes('madrasah aliyah')
  ) {
    return 'SMA';
  }
  
  return 'UNKNOWN';
}

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

    // Combine and deduplicate with type detection
    const allSchools = new Map<string, { nama: string; tipe: string }>();
    
    guruSekolah.forEach(g => {
      if (g.sekolah && !allSchools.has(g.sekolah)) {
        allSchools.set(g.sekolah, {
          nama: g.sekolah,
          tipe: detectSchoolType(g.sekolah)
        });
      }
    });
    
    siswaSekolah.forEach(s => {
      if (s.namaSekolah && !allSchools.has(s.namaSekolah)) {
        allSchools.set(s.namaSekolah, {
          nama: s.namaSekolah,
          tipe: detectSchoolType(s.namaSekolah)
        });
      }
    });

    const sekolah = Array.from(allSchools.values()).sort((a, b) => a.nama.localeCompare(b.nama));

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
