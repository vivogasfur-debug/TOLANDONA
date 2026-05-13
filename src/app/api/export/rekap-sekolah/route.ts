import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SchoolData {
  namaSekolah: string;
  siswaL: number;
  siswaP: number;
  siswaTotal: number;
  kelasBreakdown: Record<string, { L: number; P: number; Total: number }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, kelasList, filename, format, title } = body as {
      data: SchoolData[];
      kelasList: string[];
      filename: string;
      format: 'xlsx' | 'pdf';
      title?: string;
    };

    // Prepare data for export
    const exportData = data.map((s, i) => {
      const row: Record<string, unknown> = {
        'No': i + 1,
        'Sekolah': s.namaSekolah,
      };

      // Add class breakdown
      kelasList.forEach(k => {
        const kelas = s.kelasBreakdown[k] || { L: 0, P: 0, Total: 0 };
        row[`${k} L`] = kelas.L;
        row[`${k} P`] = kelas.P;
      });

      row['Jumlah L'] = s.siswaL;
      row['Jumlah P'] = s.siswaP;
      row['Total'] = s.siswaTotal;

      return row;
    });

    // Add total row
    const totalRow: Record<string, unknown> = {
      'No': '',
      'Sekolah': 'JUMLAH',
    };

    kelasList.forEach(k => {
      totalRow[`${k} L`] = data.reduce((sum, s) => sum + (s.kelasBreakdown[k]?.L || 0), 0);
      totalRow[`${k} P`] = data.reduce((sum, s) => sum + (s.kelasBreakdown[k]?.P || 0), 0);
    });

    totalRow['Jumlah L'] = data.reduce((sum, s) => sum + s.siswaL, 0);
    totalRow['Jumlah P'] = data.reduce((sum, s) => sum + s.siswaP, 0);
    totalRow['Total'] = data.reduce((sum, s) => sum + s.siswaTotal, 0);

    exportData.push(totalRow);

    if (format === 'xlsx') {
      // Create Excel file
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap');

      // Set column widths
      const colWidths = [{ wch: 5 }, { wch: 30 }];
      kelasList.forEach(() => {
        colWidths.push({ wch: 8 }, { wch: 8 });
      });
      colWidths.push({ wch: 10 }, { wch: 10 }, { wch: 8 });
      worksheet['!cols'] = colWidths;

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
        },
      });
    } else if (format === 'pdf') {
      // Create PDF file
      const doc = new jsPDF('landscape');
      
      // Add title
      doc.setFontSize(14);
      doc.text((title || 'Rekapitulasi').toUpperCase(), doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      // Prepare headers
      const headers: string[][] = [['No', 'Sekolah']];
      kelasList.forEach(k => {
        headers[0].push(`${k} L`, `${k} P`);
      });
      headers[0].push('Jumlah L', 'Jumlah P', 'Total');
      
      // Prepare table data
      const tableData = exportData.map(row => {
        const rowData: (string | number)[] = [row['No'] || '', row['Sekolah'] as string];
        kelasList.forEach(k => {
          rowData.push(row[`${k} L`] as number, row[`${k} P`] as number);
        });
        rowData.push(row['Jumlah L'] as number, row['Jumlah P'] as number, row['Total'] as number);
        return rowData;
      });
      
      // Calculate column widths based on number of classes
      const totalWidth = doc.internal.pageSize.getWidth() - 20; // margins
      const numCols = 2 + (kelasList.length * 2) + 3;
      const narrowColWidth = Math.max(12, Math.floor((totalWidth - 60) / (numCols - 2)));
      
      const columnStyles: Record<number, { cellWidth: number; halign?: string }> = {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 50 },
      };
      
      let colIndex = 2;
      kelasList.forEach(() => {
        columnStyles[colIndex++] = { cellWidth: narrowColWidth, halign: 'center' };
        columnStyles[colIndex++] = { cellWidth: narrowColWidth, halign: 'center' };
      });
      columnStyles[colIndex] = { cellWidth: 18, halign: 'center' };
      columnStyles[colIndex + 1] = { cellWidth: 18, halign: 'center' };
      columnStyles[colIndex + 2] = { cellWidth: 15, halign: 'center' };
      
      autoTable(doc, {
        head: headers,
        body: tableData,
        startY: 22,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [74, 85, 104], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        columnStyles,
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
          'Content-Disposition': `attachment; filename="${filename}.pdf"`,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ success: false, error: 'Export failed' }, { status: 500 });
  }
}
