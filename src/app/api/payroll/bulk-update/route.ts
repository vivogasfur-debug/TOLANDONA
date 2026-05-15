import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Bulk update payroll records
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { records } = body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Data record tidak valid' },
        { status: 400 }
      );
    }

    let updateCount = 0;
    
    // Update each record
    for (const record of records) {
      if (!record.id) continue;

      const updateData: Record<string, unknown> = {};
      
      if (record.gajiHarian !== undefined) updateData.gajiHarian = record.gajiHarian;
      if (record.hariKerja !== undefined) updateData.hariKerja = record.hariKerja;
      if (record.bonus !== undefined) updateData.bonus = record.bonus;
      if (record.potongan !== undefined) updateData.potongan = record.potongan;
      if (record.totalGaji !== undefined) updateData.totalGaji = record.totalGaji;
      if (record.status !== undefined) {
        updateData.status = record.status;
        if (record.status === 'paid') {
          updateData.tanggalBayar = new Date();
        }
      }
      if (record.keterangan !== undefined) updateData.keterangan = record.keterangan;

      if (Object.keys(updateData).length > 0) {
        await db.payroll.update({
          where: { id: record.id },
          data: updateData,
        });
        updateCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengupdate ${updateCount} record`,
      count: updateCount,
    });

  } catch (error) {
    console.error('Bulk update payroll error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
