import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface GuruData {
  namaSekolah: string;
  guruL: number;
  guruP: number;
  guruTotal: number;
  tendikBreakdown: Record<string, { L: number; P: number; Total: number }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, format } = body as { data: GuruData[]; format: 'xlsx' | 'pdf' };

    const tendikTypes = ['Kepala Sekolah', 'Guru', 'Tendik', 'Non Tendik'];

    // Prepare data for export
    const exportData = data.map((s, i) => {
      const kepsek = s.tendikBreakdown['Kepala Sekolah'] || { L: 0, P: 0, Total: 0 };
      const guru = s.tendikBreakdown['Guru'] || { L: 0, P: 0, Total: 0 };
      const tendik = s.tendikBreakdown['Tendik'] || { L: 0, P: 0, Total: 0 };
      const nonTendik = s.tendikBreakdown['Non Tendik'] || { L: 0, P: 0, Total: 0 };
      // Uji Organoleptik = dari jenisTendik "UJI ORGANOLEPTIK" di database
      const ujiOrganoleptik = s.tendikBreakdown['UJI ORGANOLEPTIK']?.Total || 0;

      return {
        'No': i + 1,
        'Sekolah': s.namaSekolah,
        'Kepsek L': kepsek.L,
        'Kepsek P': kepsek.P,
        'Guru L': guru.L,
        'Guru P': guru.P,
        'Tendik L': tendik.L,
        'Tendik P': tendik.P,
        'Non Tendik L': nonTendik.L,
        'Non Tendik P': nonTendik.P,
        'Uji Organoleptik': ujiOrganoleptik,
        'Jumlah L': s.guruL,
        'Jumlah P': s.guruP,
        'Total': s.guruTotal,
      };
    });

    // Add total row
    const totalRow = {
      'No': '' as unknown as number,
      'Sekolah': 'JUMLAH',
      'Kepsek L': data.reduce((sum, s) => sum + (s.tendikBreakdown['Kepala Sekolah']?.L || 0), 0),
      'Kepsek P': data.reduce((sum, s) => sum + (s.tendikBreakdown['Kepala Sekolah']?.P || 0), 0),
      'Guru L': data.reduce((sum, s) => sum + (s.tendikBreakdown['Guru']?.L || 0), 0),
      'Guru P': data.reduce((sum, s) => sum + (s.tendikBreakdown['Guru']?.P || 0), 0),
      'Tendik L': data.reduce((sum, s) => sum + (s.tendikBreakdown['Tendik']?.L || 0), 0),
      'Tendik P': data.reduce((sum, s) => sum + (s.tendikBreakdown['Tendik']?.P || 0), 0),
      'Non Tendik L': data.reduce((sum, s) => sum + (s.tendikBreakdown['Non Tendik']?.L || 0), 0),
      'Non Tendik P': data.reduce((sum, s) => sum + (s.tendikBreakdown['Non Tendik']?.P || 0), 0),
      'Uji Organoleptik': data.reduce((sum, s) => sum + (s.tendikBreakdown['UJI ORGANOLEPTIK']?.Total || 0), 0),
      'Jumlah L': data.reduce((sum, s) => sum + s.guruL, 0),
      'Jumlah P': data.reduce((sum, s) => sum + s.guruP, 0),
      'Total': data.reduce((sum, s) => sum + s.guruTotal, 0),
    };
    exportData.push(totalRow);

    if (format === 'xlsx') {
      // Create Excel file
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Guru');

      // Set column widths
      worksheet['!cols'] = [
        { wch: 5 },   // No
        { wch: 30 },  // Sekolah
        { wch: 10 },  // Kepsek L
        { wch: 10 },  // Kepsek P
        { wch: 10 },  // Guru L
        { wch: 10 },  // Guru P
        { wch: 10 },  // Tendik L
        { wch: 10 },  // Tendik P
        { wch: 12 },  // Non Tendik L
        { wch: 12 },  // Non Tendik P
        { wch: 15 },  // Uji Organoleptik
        { wch: 10 },  // Jumlah L
        { wch: 10 },  // Jumlah P
        { wch: 8 },   // Total
      ];

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="rekapitulasi_guru.xlsx"',
        },
      });
    } else if (format === 'pdf') {
      // Create PDF file - landscape orientation for wide table
      const doc = new jsPDF('landscape');
      
      // Add title
      doc.setFontSize(14);
      doc.text('REKAPITULASI GURU PER SEKOLAH', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      // Prepare table data
      const headers = [['No', 'Sekolah', 'Kepsek L', 'Kepsek P', 'Guru L', 'Guru P', 'Tendik L', 'Tendik P', 'Non Tendik L', 'Non Tendik P', 'Uji Org.', 'Jumlah L', 'Jumlah P', 'Total']];
      const tableData = exportData.map(row => [
        row['No'] || '',
        row['Sekolah'],
        row['Kepsek L'],
        row['Kepsek P'],
        row['Guru L'],
        row['Guru P'],
        row['Tendik L'],
        row['Tendik P'],
        row['Non Tendik L'],
        row['Non Tendik P'],
        row['Uji Organoleptik'],
        row['Jumlah L'],
        row['Jumlah P'],
        row['Total'],
      ]);
      
      autoTable(doc, {
        head: headers,
        body: tableData,
        startY: 22,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [74, 85, 104], textColor: 255, fontStyle: 'bold', fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 45 },
          2: { cellWidth: 14, halign: 'center' },
          3: { cellWidth: 14, halign: 'center' },
          4: { cellWidth: 14, halign: 'center' },
          5: { cellWidth: 14, halign: 'center' },
          6: { cellWidth: 14, halign: 'center' },
          7: { cellWidth: 14, halign: 'center' },
          8: { cellWidth: 16, halign: 'center' },
          9: { cellWidth: 16, halign: 'center' },
          10: { cellWidth: 14, halign: 'center' },
          11: { cellWidth: 14, halign: 'center' },
          12: { cellWidth: 14, halign: 'center' },
          13: { cellWidth: 12, halign: 'center' },
        },
        didParseCell: function(data) {
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [237, 242, 247];
          }
        },
      });

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="rekapitulasi_guru.pdf"',
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ success: false, error: 'Export failed' }, { status: 500 });
  }
}
