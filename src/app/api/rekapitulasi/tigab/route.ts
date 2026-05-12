import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get all Posyandu data with umur
    const posyanduData = await db.posyandu.findMany({
      select: { posyandu: true, kategori: true, jk: true, umur: true },
    });

    // Create a map for each posyandu
    const posyanduMap = new Map<string, {
      balita06L: number;  // 6-11 bulan (0 THN)
      balita06P: number;
      balita15L: number;  // 1-5 tahun (1-5 THN)
      balita15P: number;
      bumil: number;
      menyusui: number;
    }>();

    // Process each record
    for (const data of posyanduData) {
      const posyanduName = data.posyandu?.trim() || 'Tidak Diketahui';
      const kategori = (data.kategori || '').toUpperCase().trim();
      const umur = (data.umur || '').toUpperCase().trim();

      // Skip UJI ORGANOLEPTIK entries
      if (kategori.includes('ORGANOLEPTIK') || umur === '126 THN') {
        continue;
      }

      if (!posyanduMap.has(posyanduName)) {
        posyanduMap.set(posyanduName, {
          balita06L: 0, balita06P: 0,
          balita15L: 0, balita15P: 0,
          bumil: 0, menyusui: 0
        });
      }

      const stats = posyanduMap.get(posyanduName)!;

      // Map kategori to appropriate category
      if (kategori.includes('BALITA')) {
        // Parse umur to determine age category
        // 0 THN = 6-11 bulan
        // 1-5 THN = 1-5 tahun
        const umurNum = parseInt(umur.replace(/\D/g, ''));

        if (umurNum === 0) {
          // Balita 6-11 bulan
          if (data.jk === 'L') stats.balita06L++;
          else if (data.jk === 'P') stats.balita06P++;
        } else if (umurNum >= 1 && umurNum <= 5) {
          // Balita 1-5 tahun
          if (data.jk === 'L') stats.balita15L++;
          else if (data.jk === 'P') stats.balita15P++;
        } else {
          // Default to 1-5 tahun if umur not specified or > 5
          if (data.jk === 'L') stats.balita15L++;
          else if (data.jk === 'P') stats.balita15P++;
        }
      } else if (kategori.includes('BUMIL') || kategori.includes('IBU HAMIL') || kategori.includes('HAMIL')) {
        stats.bumil++;
      } else if (kategori.includes('BUSUI') || kategori.includes('MENYUSUI') || kategori.includes('IBU MENYUSUI')) {
        stats.menyusui++;
      }
    }

    // Convert to array and calculate totals
    const data = Array.from(posyanduMap.entries())
      .map(([posyandu, stats]) => ({
        posyandu,
        balita06L: stats.balita06L,
        balita06P: stats.balita06P,
        balita06Total: stats.balita06L + stats.balita06P,
        balita15L: stats.balita15L,
        balita15P: stats.balita15P,
        balita15Total: stats.balita15L + stats.balita15P,
        bumil: stats.bumil,
        menyusui: stats.menyusui,
        total: stats.balita06L + stats.balita06P + stats.balita15L + stats.balita15P + stats.bumil + stats.menyusui,
      }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get rekapitulasi 3B error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
