import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get all Posyandu data
    const posyanduData = await db.posyandu.findMany({
      select: { posyandu: true, kategori: true, jk: true },
    });

    // Create a map for each posyandu
    const posyanduMap = new Map<string, {
      balitaL: number;
      balitaP: number;
      bumil: number;
      menyusui: number;
      lansia: number;
    }>();

    // Process each record
    for (const data of posyanduData) {
      const posyanduName = data.posyandu?.trim() || 'Tidak Diketahui';
      const kategori = (data.kategori || '').toLowerCase().trim();

      if (!posyanduMap.has(posyanduName)) {
        posyanduMap.set(posyanduName, { balitaL: 0, balitaP: 0, bumil: 0, menyusui: 0, lansia: 0 });
      }

      const stats = posyanduMap.get(posyanduName)!;

      // Map kategori to appropriate category
      // Balita: 0-5 tahun, Bumil: Ibu Hamil, Menyusui: Ibu Menyusui, Lansia: Lanjut Usia
      if (kategori.includes('balita') || kategori.includes('batita') || kategori.includes('baduta')) {
        if (data.jk === 'L') stats.balitaL++;
        else if (data.jk === 'P') stats.balitaP++;
      } else if (kategori.includes('bumil') || kategori.includes('ibu hamil') || kategori.includes('hamil')) {
        stats.bumil++;
      } else if (kategori.includes('menyusui') || kategori.includes('ibu menyusui') || kategori.includes('busui')) {
        stats.menyusui++;
      } else if (kategori.includes('lansia') || kategori.includes('lanjut usia') || kategori.includes('manula')) {
        stats.lansia++;
      } else if (kategori.includes('0-') || kategori.includes('1-') || kategori.includes('2-') || 
                 kategori.includes('3-') || kategori.includes('4-') || kategori.includes('5-')) {
        // Assume ages 0-5 are balita
        if (data.jk === 'L') stats.balitaL++;
        else if (data.jk === 'P') stats.balitaP++;
      } else {
        // If no specific category match, try to classify by default as balita
        // since Posyandu primarily serves children under 5
        if (data.jk === 'L') stats.balitaL++;
        else if (data.jk === 'P') stats.balitaP++;
      }
    }

    // Convert to array and calculate totals
    const data = Array.from(posyanduMap.entries())
      .map(([posyandu, stats]) => ({
        posyandu,
        balitaL: stats.balitaL,
        balitaP: stats.balitaP,
        balitaTotal: stats.balitaL + stats.balitaP,
        bumil: stats.bumil,
        menyusui: stats.menyusui,
        lansia: stats.lansia,
        total: stats.balitaL + stats.balitaP + stats.bumil + stats.menyusui + stats.lansia,
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
