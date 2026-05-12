import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

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
      'No': '',
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
      // For PDF, we'll create a simple HTML table and return it
      // The frontend will handle the PDF generation using browser print
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
  const headers = ['No', 'Sekolah', 'Kepsek L', 'Kepsek P', 'Guru L', 'Guru P', 'Tendik L', 'Tendik P', 'Non Tendik L', 'Non Tendik P', 'Uji Organoleptik', 'Jumlah L', 'Jumlah P', 'Total'];
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rekapitulasi Guru</title>
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
  <h1>REKAPITULASI GURU PER SEKOLAH</h1>
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
