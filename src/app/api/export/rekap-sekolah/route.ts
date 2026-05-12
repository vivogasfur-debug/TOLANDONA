import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

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
      // For PDF, create HTML table
      const html = generatePDFHtml(exportData, kelasList, title || 'Rekapitulasi');
      
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ success: false, error: 'Export failed' }, { status: 500 });
  }
}

function generatePDFHtml(data: Record<string, unknown>[], kelasList: string[], title: string): string {
  const headers = ['No', 'Sekolah'];
  kelasList.forEach(k => {
    headers.push(`${k} L`, `${k} P`);
  });
  headers.push('Jumlah L', 'Jumlah P', 'Total');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 10px; margin: 20px; }
    h1 { text-align: center; font-size: 16px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #333; padding: 4px 6px; text-align: center; }
    th { background-color: #4a5568; color: white; font-weight: bold; }
    td:last-child { font-weight: bold; }
    tr:last-child { background-color: #edf2f7; font-weight: bold; }
    td:first-child, th:first-child { width: 30px; }
    td:nth-child(2), th:nth-child(2) { text-align: left; }
  </style>
</head>
<body>
  <h1>${title.toUpperCase()}</h1>
  <table>
    <thead>
      <tr>
        ${headers.map(h => `<th>${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.map(row => `
        <tr>
          ${headers.map(h => `<td>${row[h] ?? ''}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
  <script>window.print();</script>
</body>
</html>
  `;
}
