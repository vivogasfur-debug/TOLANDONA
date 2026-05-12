import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

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
      'No': '',
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
      // For PDF, create HTML that can be printed
      const html = generatePDFHtml(exportData);

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

function generatePDFHtml(data: Record<string, unknown>[]): string {
  const headers = ['No', 'Posyandu', 'Balita 6-11 L', 'Balita 6-11 P', 'Total 6-11', 'Balita 1-5 L', 'Balita 1-5 P', 'Total 1-5', 'Bumil', 'Menyusui', 'Total'];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rekapitulasi 3B</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 10px; margin: 20px; }
    h1 { text-align: center; font-size: 14px; margin-bottom: 15px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #333; padding: 4px 6px; text-align: center; }
    th { background-color: #4a5568; color: white; font-weight: bold; font-size: 9px; }
    td:first-child, th:first-child { width: 30px; }
    td:nth-child(2), th:nth-child(2) { text-align: left; }
    tr:last-child { background-color: #edf2f7; font-weight: bold; }
  </style>
</head>
<body>
  <h1>REKAPITULASI 3B (BALITA, BUMIL, MENYUSUI)</h1>
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
