import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, filename, format, title } = body as {
      data: Array<{ name: string; value: number }>;
      filename: string;
      format: 'xlsx' | 'pdf';
      title: string;
    };

    // Prepare data for export
    const exportData = data.map((item, i) => ({
      'No': i + 1,
      'Nama': item.name,
      'Jumlah': item.value,
    }));

    // Add total row
    const total = data.reduce((sum, item) => sum + item.value, 0);
    exportData.push({
      'No': '' as unknown as number,
      'Nama': 'TOTAL',
      'Jumlah': total,
    });

    if (format === 'xlsx') {
      // Create Excel file
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, title.substring(0, 31));

      // Set column widths
      worksheet['!cols'] = [
        { wch: 5 },   // No
        { wch: 30 },  // Nama
        { wch: 10 },  // Jumlah
      ];

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
        },
      });
    } else if (format === 'pdf') {
      // Create PDF file
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text(title.toUpperCase(), doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      
      // Add table
      const tableData = exportData.map(row => [row.No || '', row.Nama, row.Jumlah]);
      
      autoTable(doc, {
        head: [['No', 'Nama', 'Jumlah']],
        body: tableData,
        startY: 30,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [74, 85, 104], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 80 },
          2: { cellWidth: 30, halign: 'center' },
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
