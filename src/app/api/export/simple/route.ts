import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

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
      'No': '',
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
      // For PDF, create HTML that can be printed
      const html = generatePDFHtml(exportData, title);

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

function generatePDFHtml(data: Record<string, unknown>[], title: string): string {
  const headers = ['No', 'Nama', 'Jumlah'];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
    h1 { text-align: center; font-size: 16px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #333; padding: 8px; text-align: center; }
    th { background-color: #4a5568; color: white; font-weight: bold; }
    td:first-child, th:first-child { width: 50px; }
    td:nth-child(2), th:nth-child(2) { text-align: left; }
    tr:last-child { background-color: #edf2f7; font-weight: bold; }
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
