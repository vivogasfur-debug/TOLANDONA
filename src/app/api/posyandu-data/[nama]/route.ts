import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET - Ambil data posyandu berdasarkan nama posyandu
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nama: string }> }
) {
  try {
    const { nama } = await params;
    const namaPosyandu = decodeURIComponent(nama);

    // Ambil data posyandu berdasarkan nama posyandu
    const posyanduData = await db.posyandu.findMany({
      where: {
        posyandu: {
          equals: namaPosyandu,
        } as Prisma.StringNullableFilter
      },
      select: {
        kategori: true,
        jk: true
      }
    });

    // Jika tidak ketemu, coba cari dengan contains
    let data = posyanduData;
    if (posyanduData.length === 0) {
      data = await db.posyandu.findMany({
        where: {
          posyandu: {
            contains: namaPosyandu,
          } as Prisma.StringNullableFilter
        },
        select: {
          kategori: true,
          jk: true
        }
      });
    }

    // Hitung per kategori
    const count = {
      balitaL: 0,
      balitaP: 0,
      bumilP: 0,
      busuiP: 0,
      lansiaL: 0,
      lansiaP: 0,
      wusP: 0
    };

    data.forEach((p) => {
      const kategori = p.kategori?.toUpperCase() || '';
      const jk = p.jk === 'L' ? 'L' : 'P';

      if (kategori.includes('BALITA')) {
        if (jk === 'L') count.balitaL++;
        else count.balitaP++;
      } else if (kategori.includes('BUMIL') || kategori.includes('IBU HAMIL') || kategori.includes('HAMIL')) {
        count.bumilP++;
      } else if (kategori.includes('BUSUI') || kategori.includes('MENYUSUI') || kategori.includes('IBU MENYUSUI')) {
        count.busuiP++;
      } else if (kategori.includes('LANSIA')) {
        if (jk === 'L') count.lansiaL++;
        else count.lansiaP++;
      } else if (kategori.includes('WUS') || kategori.includes('USIA SUBUR')) {
        count.wusP++;
      }
    });

    const total = count.balitaL + count.balitaP + count.bumilP + count.busuiP + count.lansiaL + count.lansiaP + count.wusP;

    return NextResponse.json({
      success: true,
      namaPosyandu,
      totalData: data.length,
      data: count,
      total
    });

  } catch (error) {
    console.error('Error fetching posyandu data:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data posyandu' },
      { status: 500 }
    );
  }
}
