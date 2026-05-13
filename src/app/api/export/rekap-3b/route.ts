import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Rekap3BData {
  posyandu: string;
  balita06L: number;
  balita06P: number;
  balita06Total: number;
  balita15L: number;
  balita15P: number;
  balita15Total: number;
  bumil: number;
  menyusui: number;
  total: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, format } = body as { data: Rekap3BData[]; format: 'xlsx' | 'pdf' };

    // Prepare data for export
    const exportData = data.map((item, i) => ({
      'No': i + 1,
      'Posyandu': item.posyandu,
      'Balita 6-11 Bulan L': item.balita06L,
      'Balita 6-11 Bulan P': item.balita06P,
      'Total Balita 6-11 Bulan': item.balita06Total,
      'Balita 1-5 Tahun L': item.balita15L,
      'Balita 1-5 Tahun P': item.balita15P,
      'Total Balita 1-5 Tahun': item.balita15Total,
      'Bumil': item.bumil,
      'Menyusui': item.menyusui,
      'Total': item.total,
    }));

    // Add total row
    const totals = data.reduce((acc, item) => ({
      balita06L: acc.balita06L + item.balita06L,
      balita06P: acc.balita06P + item.balita06P,
      balita06Total: acc.balita06Total + item.balita06Total,
      balita15L: acc.balita15L + item.balita15L,
      balita15P: acc.balita15P + item.balita15P,
      balita15Total: acc.balita15Total + item.balita15Total,
      bumil: acc.bumil + item.bumil,
      menyusui: acc.menyusui + item.menyusui,
      total: acc.total + item.total,
    }), { balita06L: 0, balita06P: 0, balita06Total: 0, balita15L: 0, balita15P: 0, balita15Total: 0, bumil: 0, menyusui: 0, total: 0 });

    exportData.push({
      'No': '' as unknown as number,
      'Posyandu': 'JUMLAH',
      'Balita 6-11 Bulan L': totals.balita06L,
      'Balita 6-11 Bulan P': totals.balita06P,
      'Total Balita 6-11 Bulan': totals.balita06Total,
      'Balita 1-5 Tahun L': totals.balita15L,
      'Balita 1-5 Tahun P': totals.balita15P,
      'Total Balita 1-5 Tahun': totals.balita15Total,
      'Bumil': totals.bumil,
      'Menyusui': totals.menyusui,
      'Total': totals.total,
    });

    if (format === 'xlsx') {
      // Create Excel file
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap 3B');

      // Set column widths
      worksheet['!cols'] = [
        { wch: 5 },   // No
        { wch: 25 },  // Posyandu
        { wch: 12 },  // Balita 6-11 L
        { wch: 12 },  // Balita 6-11 P
        { wch: 12 },  // Total 6-11
        { wch: 12 },  // Balita 1-5 L
        { wch: 12 },  // Balita 1-5 P
        { wch: 12 },  // Total 1-5
        { wch: 10 },  // Bumil
        { wch: 10 },  // Menyusui
        { wch: 8 },   // Total
      ];

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="rekapitulasi_3b.xlsx"',
        },
      });
    } else if (format === 'pdf') {
      // Create PDF file - landscape for wider table
      const doc = new jsPDF('landscape');
      
      // Add title
      doc.setFontSize(14);
      doc.text('REKAPITULASI 3B (BALITA, BUMIL, MENYUSUI)', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      // Prepare table data
      const headers = [['No', 'Posyandu', 'Balita 6-11 L', 'Balita 6-11 P', 'Total 6-11', 'Balita 1-5 L', 'Balita 1-5 P', 'Total 1-5', 'Bumil', 'Menyusui', 'Total']];
      const tableData = exportData.map(row => [
        row['No'] || '',
        row['Posyandu'],
        row['Balita 6-11 Bulan L'],
        row['Balita 6-11 Bulan P'],
        row['Total Balita 6-11 Bulan'],
        row['Balita 1-5 Tahun L'],
        row['Balita 1-5 Tahun P'],
        row['Total Balita 1-5 Tahun'],
        row['Bumil'],
        row['Menyusui'],
        row['Total'],
      ]);
      
      autoTable(doc, {
        head: headers,
        body: tableData,
        startY: 22,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [74, 85, 104], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 50 },
          2: { cellWidth: 22, halign: 'center' },
          3: { cellWidth: 22, halign: 'center' },
          4: { cellWidth: 20, halign: 'center' },
          5: { cellWidth: 22, halign: 'center' },
          6: { cellWidth: 22, halign: 'center' },
          7: { cellWidth: 20, halign: 'center' },
          8: { cellWidth: 18, halign: 'center' },
          9: { cellWidth: 20, halign: 'center' },
          10: { cellWidth: 18, halign: 'center' },
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
          'Content-Disposition': 'attachment; filename="rekapitulasi_3b.pdf"',
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ success: false, error: 'Export failed' }, { status: 500 });
  }
}
