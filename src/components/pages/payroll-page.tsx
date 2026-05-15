'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Wallet, Plus, Trash2, Download, Calendar, Users, DollarSign, 
  TrendingUp, CheckCircle, Clock, RefreshCw, Save, FileSpreadsheet,
  Calculator, AlertCircle, ChevronLeft, ChevronRight, Printer
} from 'lucide-react';
import { toast } from 'sonner';

interface Relawan {
  id: string;
  nama: string;
  divisi: string | null;
  jabatan: string | null;
  jk: string | null;
  nik: string | null;
  alamat: string | null;
  gajiPokok: string | null;
}

interface PayrollRecord {
  id: string;
  relawanId: string;
  periode: number; // 1-26 (2 mingguan dalam setahun)
  tahun: number;
  tanggalMulai: Date;
  tanggalSelesai: Date;
  gajiHarian: number;
  hariKerja: number;
  bonus: number;
  potongan: number;
  totalGaji: number;
  status: string;
  tanggalBayar: Date | null;
  keterangan: string | null;
  relawan: Relawan;
  isEdited?: boolean;
}

interface Summary {
  totalRecords: number;
  totalGajiPokok: number;
  totalBonus: number;
  totalPotongan: number;
  grandTotal: number;
  paidCount: number;
  pendingCount: number;
}

// Helper: Generate periode options (26 periode per tahun)
const generatePeriodeOptions = (year: number) => {
  const options = [];
  const startDate = new Date(year, 0, 1); // 1 Januari
  
  for (let i = 0; i < 26; i++) {
    const mulai = new Date(startDate);
    mulai.setDate(startDate.getDate() + (i * 14));
    
    const selesai = new Date(mulai);
    selesai.setDate(mulai.getDate() + 13);
    
    // If selesai goes to next year, stop
    if (selesai.getFullYear() > year) break;
    
    const formatTanggal = (d: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    };
    
    options.push({
      value: i + 1,
      label: `Periode ${i + 1}`,
      tanggal: `${formatTanggal(mulai)} - ${formatTanggal(selesai)}`,
      tanggalMulai: mulai,
      tanggalSelesai: selesai,
    });
  }
  
  return options;
};

// Get current periode based on today's date
const getCurrentPeriode = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const daysPassed = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(daysPassed / 14) + 1;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const parseNumberFromString = (str: string | null | undefined): number => {
  if (!str) return 0;
  const cleaned = str.replace(/[^\d]/g, '');
  return parseInt(cleaned) || 0;
};

export function PayrollPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [relawanList, setRelawanList] = useState<Relawan[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Payslip print state
  const [showPayslipDialog, setShowPayslipDialog] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

  // Period selection
  const currentYear = new Date().getFullYear();
  const [selectedPeriode, setSelectedPeriode] = useState(getCurrentPeriode());
  const [selectedTahun, setSelectedTahun] = useState(currentYear);

  // Get periode options
  const periodeOptions = generatePeriodeOptions(selectedTahun);
  const currentPeriodeInfo = periodeOptions.find(p => p.value === selectedPeriode);

  // Fetch relawan list on mount
  useEffect(() => {
    fetchRelawan();
  }, []);

  // Fetch payroll when period changes
  useEffect(() => {
    fetchPayroll();
  }, [selectedPeriode, selectedTahun]);

  const fetchRelawan = async () => {
    try {
      const res = await fetch('/api/relawan?limit=1000');
      const data = await res.json();
      if (data.success) {
        setRelawanList(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch relawan:', error);
    }
  };

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      setHasUnsavedChanges(false);
      
      const res = await fetch(`/api/payroll?periode=${selectedPeriode}&tahun=${selectedTahun}`);
      const data = await res.json();

      if (data.success) {
        setPayrollData(data.data);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch payroll:', error);
      toast.error('Gagal memuat data payroll');
    } finally {
      setLoading(false);
    }
  };

  // Initialize payroll for the period
  const handleInitializePeriod = async () => {
    if (relawanList.length === 0) {
      toast.error('Tidak ada data relawan');
      return;
    }

    if (payrollData.length > 0) {
      toast.error('Periode ini sudah memiliki data. Hapus data terlebih dahulu jika ingin menginisialisasi ulang.');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periode: selectedPeriode,
          tahun: selectedTahun,
          tanggalMulai: currentPeriodeInfo?.tanggalMulai.toISOString(),
          tanggalSelesai: currentPeriodeInfo?.tanggalSelesai.toISOString(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Berhasil membuat ${data.count} record payroll`);
        fetchPayroll();
      } else {
        toast.error(data.error || 'Gagal menginisialisasi periode');
      }
    } catch (error) {
      console.error('Failed to initialize period:', error);
      toast.error('Gagal menginisialisasi periode');
    } finally {
      setSaving(false);
    }
  };

  // Update single payroll record
  const handleUpdateRecord = (id: string, field: string, value: number) => {
    setPayrollData(prev => prev.map(record => {
      if (record.id === id) {
        const updated = { ...record, [field]: value, isEdited: true };
        // Recalculate total
        const gajiHarian = field === 'gajiHarian' ? value : record.gajiHarian;
        const hariKerja = field === 'hariKerja' ? value : record.hariKerja;
        const bonus = field === 'bonus' ? value : record.bonus;
        const potongan = field === 'potongan' ? value : record.potongan;
        updated.totalGaji = (gajiHarian * hariKerja) + bonus - potongan;
        return updated;
      }
      return record;
    }));
    setHasUnsavedChanges(true);
  };

  // Save all changes
  const handleSaveAll = async () => {
    const editedRecords = payrollData.filter(r => r.isEdited);
    if (editedRecords.length === 0) {
      toast.info('Tidak ada perubahan untuk disimpan');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/payroll/bulk-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: editedRecords.map(r => ({
            id: r.id,
            gajiHarian: r.gajiHarian,
            hariKerja: r.hariKerja,
            bonus: r.bonus,
            potongan: r.potongan,
            totalGaji: r.totalGaji,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`${data.count} record berhasil disimpan`);
        setHasUnsavedChanges(false);
        fetchPayroll();
      } else {
        toast.error(data.error || 'Gagal menyimpan perubahan');
      }
    } catch (error) {
      console.error('Failed to save changes:', error);
      toast.error('Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  // Mark as paid
  const handleMarkAsPaid = async (id: string) => {
    try {
      const res = await fetch(`/api/payroll/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Status berhasil diubah menjadi Dibayar');
        fetchPayroll();
      } else {
        toast.error(data.error || 'Gagal mengubah status');
      }
    } catch (error) {
      console.error('Failed to mark as paid:', error);
      toast.error('Gagal mengubah status');
    }
  };

  // Mark all as paid
  const handleMarkAllAsPaid = async () => {
    const pendingRecords = payrollData.filter(r => r.status === 'pending');
    if (pendingRecords.length === 0) {
      toast.info('Semua record sudah dibayar');
      return;
    }

    if (!confirm(`Tandai ${pendingRecords.length} record sebagai Dibayar?`)) return;

    try {
      const res = await fetch('/api/payroll/bulk-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: pendingRecords.map(r => ({ id: r.id, status: 'paid' })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`${data.count} record berhasil ditandai Dibayar`);
        fetchPayroll();
      } else {
        toast.error(data.error || 'Gagal mengubah status');
      }
    } catch (error) {
      console.error('Failed to mark all as paid:', error);
      toast.error('Gagal mengubah status');
    }
  };

  // Delete single record
  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Hapus record ini?')) return;

    try {
      const res = await fetch(`/api/payroll/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Record berhasil dihapus');
        fetchPayroll();
      } else {
        toast.error(data.error || 'Gagal menghapus record');
      }
    } catch (error) {
      console.error('Failed to delete record:', error);
      toast.error('Gagal menghapus record');
    }
  };

  // Delete all records for this period
  const handleDeletePeriod = async () => {
    if (payrollData.length === 0) return;
    
    const periodeLabel = currentPeriodeInfo?.label || `Periode ${selectedPeriode}`;
    if (!confirm(`Hapus SEMUA data payroll ${periodeLabel} ${selectedTahun}?`)) return;

    try {
      const res = await fetch(`/api/payroll/period?periode=${selectedPeriode}&tahun=${selectedTahun}`, { 
        method: 'DELETE' 
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${data.count} record berhasil dihapus`);
        fetchPayroll();
      } else {
        toast.error(data.error || 'Gagal menghapus data');
      }
    } catch (error) {
      console.error('Failed to delete period:', error);
      toast.error('Gagal menghapus data');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (payrollData.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    const periodeLabel = currentPeriodeInfo?.label || `Periode ${selectedPeriode}`;
    const tanggalLabel = currentPeriodeInfo?.tanggal || '';
    
    const headers = 'No,Nama,Divisi,Jabatan,Gaji Harian,Hari Kerja,Subtotal,Bonus,Potongan,Total,Status\n';
    const rows = payrollData.map((p, i) => {
      const subtotal = p.gajiHarian * p.hariKerja;
      return `${i + 1},"${p.relawan.nama}","${p.relawan.divisi || '-'}","${p.relawan.jabatan || '-'}",${p.gajiHarian},${p.hariKerja},${subtotal},${p.bonus},${p.potongan},${p.totalGaji},${p.status === 'paid' ? 'Dibayar' : 'Pending'}`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_${periodeLabel}_${selectedTahun}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File CSV berhasil diunduh');
  };

  // Print payslip
  const openPayslipDialog = (record: PayrollRecord) => {
    setSelectedPayslip(record);
    setShowPayslipDialog(true);
  };

  const handlePrintPayslip = () => {
    if (!selectedPayslip) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=600,height=800');
    if (!printWindow) {
      toast.error('Tidak dapat membuka jendela cetak. Pastikan popup tidak diblokir.');
      return;
    }
    
    const subtotal = selectedPayslip.gajiHarian * selectedPayslip.hariKerja;
    
    // Generate print content
    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Slip Gaji - ${selectedPayslip.relawan.nama}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      padding: 20px; 
      background: white;
      color: black;
    }
    .payslip {
      max-width: 500px;
      margin: 0 auto;
      border: 2px solid #000;
    }
    .header {
      background: #059669;
      color: white;
      text-align: center;
      padding: 15px;
    }
    .header h2 {
      font-size: 22px;
      margin-bottom: 5px;
    }
    .header p {
      font-size: 14px;
    }
    .content {
      padding: 20px;
    }
    .section {
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #ccc;
    }
    .section:last-child {
      border-bottom: none;
    }
    .section-title {
      font-weight: bold;
      margin-bottom: 10px;
      color: #333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    td {
      padding: 4px 0;
      font-size: 14px;
    }
    td:first-child {
      color: #666;
      width: 120px;
    }
    td:last-child {
      text-align: right;
    }
    .total-box {
      background: #d1fae5;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
    }
    .total-label {
      font-size: 16px;
    }
    .total-amount {
      font-size: 20px;
      color: #059669;
    }
    .signature {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #ccc;
      display: flex;
      justify-content: space-between;
    }
    .signature-box {
      text-align: center;
    }
    .signature-line {
      height: 60px;
    }
    .signature-name {
      border-top: 1px solid #333;
      padding-top: 5px;
      font-size: 14px;
    }
    .signature-label {
      font-size: 13px;
      color: #666;
      margin-bottom: 5px;
    }
    .date-line {
      font-size: 13px;
      color: #666;
    }
    @media print {
      body { padding: 0; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body>
  <div class="payslip">
    <div class="header">
      <h2>SLIP GAJI</h2>
      <p>Periode ${selectedPeriode} - ${selectedTahun}</p>
    </div>
    <div class="content">
      <div class="section">
        <div class="section-title">Data Penerima</div>
        <table>
          <tr><td>Nama</td><td>: ${selectedPayslip.relawan.nama}</td></tr>
          <tr><td>Divisi</td><td>: ${selectedPayslip.relawan.divisi || '-'}</td></tr>
          <tr><td>Jabatan</td><td>: ${selectedPayslip.relawan.jabatan || '-'}</td></tr>
        </table>
      </div>
      <div class="section">
        <div class="section-title">Rincian Gaji</div>
        <table>
          <tr><td>Gaji Harian</td><td>: ${formatCurrency(selectedPayslip.gajiHarian)}</td></tr>
          <tr><td>Hari Kerja</td><td>: ${selectedPayslip.hariKerja} hari</td></tr>
          <tr><td>Subtotal</td><td>: ${formatCurrency(subtotal)}</td></tr>
          <tr><td>Bonus</td><td>: ${formatCurrency(selectedPayslip.bonus)}</td></tr>
          <tr><td>Potongan</td><td>: ${formatCurrency(selectedPayslip.potongan)}</td></tr>
        </table>
      </div>
      <div class="total-box">
        <span class="total-label">TOTAL GAJI</span>
        <span class="total-amount">${formatCurrency(selectedPayslip.totalGaji)}</span>
      </div>
      <div class="signature">
        <div class="signature-box">
          <div class="signature-label">Penerima,</div>
          <div class="signature-line"></div>
          <div class="signature-name">${selectedPayslip.relawan.nama}</div>
        </div>
        <div class="signature-box">
          <div class="date-line">Tanggal: _______________</div>
        </div>
      </div>
    </div>
  </div>
  <script>
    window.onload = function() {
      window.print();
      window.onafterprint = function() {
        window.close();
      }
    }
  </script>
</body>
</html>`;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Navigate periode
  const goToPrevPeriode = () => {
    if (selectedPeriode > 1) {
      setSelectedPeriode(selectedPeriode - 1);
    } else {
      setSelectedPeriode(26);
      setSelectedTahun(selectedTahun - 1);
    }
  };

  const goToNextPeriode = () => {
    if (selectedPeriode < 26) {
      setSelectedPeriode(selectedPeriode + 1);
    } else {
      setSelectedPeriode(1);
      setSelectedTahun(selectedTahun + 1);
    }
  };

  // Calculate summary from current data
  const calculateSummary = useCallback(() => {
    if (payrollData.length === 0) return null;
    
    return payrollData.reduce((acc, record) => {
      acc.totalGajiPokok += record.gajiHarian * record.hariKerja;
      acc.totalBonus += record.bonus;
      acc.totalPotongan += record.potongan;
      acc.grandTotal += record.totalGaji;
      if (record.status === 'paid') acc.paidCount++;
      else acc.pendingCount++;
      return acc;
    }, {
      totalRecords: payrollData.length,
      totalGajiPokok: 0,
      totalBonus: 0,
      totalPotongan: 0,
      grandTotal: 0,
      paidCount: 0,
      pendingCount: 0,
    });
  }, [payrollData]);

  const currentSummary = summary || calculateSummary();

  // Year options
  const yearOptions = [];
  for (let y = currentYear + 1; y >= currentYear - 2; y--) {
    yearOptions.push(y);
  }

  if (loading && payrollData.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Payroll Relawan</h1>
            <p className="text-sm text-slate-500">Sistem penggajian 2 mingguan (26 periode/tahun)</p>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              <span className="font-medium">Periode:</span>
            </div>
            
            {/* Navigation */}
            <Button variant="outline" size="sm" onClick={goToPrevPeriode} className="h-8 w-8 p-0">
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Select value={selectedPeriode.toString()} onValueChange={(v) => setSelectedPeriode(parseInt(v))}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodeOptions.map(p => (
                  <SelectItem key={p.value} value={p.value.toString()}>
                    {p.label} ({p.tanggal})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={goToNextPeriode} className="h-8 w-8 p-0">
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Select value={selectedTahun.toString()} onValueChange={(v) => setSelectedTahun(parseInt(v))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range Badge */}
            {currentPeriodeInfo && (
              <Badge variant="outline" className="text-sm font-normal">
                {currentPeriodeInfo.tanggal} {selectedTahun}
              </Badge>
            )}

            <div className="flex gap-2 ml-auto">
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-amber-600 border-amber-300 animate-pulse">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Ada perubahan belum disimpan
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={fetchPayroll} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {currentSummary && payrollData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Relawan</p>
                  <p className="text-xl font-bold">{currentSummary.totalRecords}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Subtotal Gaji</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(currentSummary.totalGajiPokok)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Bonus</p>
                  <p className="text-lg font-bold text-amber-600">{formatCurrency(currentSummary.totalBonus)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Grand Total</p>
                  <p className="text-lg font-bold text-purple-600">{formatCurrency(currentSummary.grandTotal)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  {currentSummary.paidCount === currentSummary.totalRecords ? (
                    <CheckCircle className="w-5 h-5 text-teal-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-teal-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="text-sm font-bold">
                    <span className="text-emerald-600">{currentSummary.paidCount} Dibayar</span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span className="text-amber-600">{currentSummary.pendingCount} Pending</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {payrollData.length === 0 ? (
          <Button onClick={handleInitializePeriod} disabled={saving || relawanList.length === 0} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600">
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Buat Payroll Periode Ini
              </>
            )}
          </Button>
        ) : (
          <>
            <Button 
              onClick={handleSaveAll} 
              disabled={!hasUnsavedChanges || saving}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={handleMarkAllAsPaid} className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Tandai Semua Dibayar
            </Button>
            
            <Button variant="outline" onClick={exportToCSV} className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            
            <Button variant="destructive" onClick={handleDeletePeriod} className="gap-2">
              <Trash2 className="w-4 h-4" />
              Hapus Periode
            </Button>
          </>
        )}
      </div>

      {/* Payroll Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Data Payroll - {currentPeriodeInfo?.label || `Periode ${selectedPeriode}`} ({currentPeriodeInfo?.tanggal})
          </CardTitle>
          <CardDescription>
            {payrollData.length > 0 
              ? `${payrollData.length} relawan. Edit langsung di tabel, lalu klik Simpan.`
              : 'Buat payroll untuk periode ini terlebih dahulu'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payrollData.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-2">Belum ada data payroll untuk periode ini</p>
              <p className="text-sm text-slate-400 mb-4">
                {relawanList.length} relawan tersedia di database
              </p>
              <Button onClick={handleInitializePeriod} disabled={saving || relawanList.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Buat Payroll
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <Table className="min-w-max">
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="w-12 text-center">No</TableHead>
                    <TableHead>Nama Relawan</TableHead>
                    <TableHead>Divisi</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead className="text-right">Gaji Harian</TableHead>
                    <TableHead className="text-center w-20">Hari Kerja</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right w-28">Bonus</TableHead>
                    <TableHead className="text-right w-28">Potongan</TableHead>
                    <TableHead className="text-right">Total Gaji</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center w-24">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollData.map((p, i) => {
                    const subtotal = p.gajiHarian * p.hariKerja;
                    return (
                      <TableRow 
                        key={p.id} 
                        className={`${p.isEdited ? 'bg-amber-50 dark:bg-amber-900/10' : ''} hover:bg-slate-50 dark:hover:bg-slate-800/50`}
                      >
                        <TableCell className="text-center text-slate-400">{i + 1}</TableCell>
                        <TableCell className="font-medium">{p.relawan.nama}</TableCell>
                        <TableCell>{p.relawan.divisi || '-'}</TableCell>
                        <TableCell>{p.relawan.jabatan || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={p.gajiHarian}
                            onChange={(e) => handleUpdateRecord(p.id, 'gajiHarian', parseInt(e.target.value) || 0)}
                            className="w-28 text-right h-8"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            value={p.hariKerja}
                            onChange={(e) => handleUpdateRecord(p.id, 'hariKerja', parseInt(e.target.value) || 0)}
                            className="w-16 text-center h-8"
                            min="0"
                            max="14"
                          />
                        </TableCell>
                        <TableCell className="text-right text-slate-600">{formatCurrency(subtotal)}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={p.bonus}
                            onChange={(e) => handleUpdateRecord(p.id, 'bonus', parseInt(e.target.value) || 0)}
                            className="w-24 text-right h-8"
                            min="0"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={p.potongan}
                            onChange={(e) => handleUpdateRecord(p.id, 'potongan', parseInt(e.target.value) || 0)}
                            className="w-24 text-right h-8"
                            min="0"
                          />
                        </TableCell>
                        <TableCell className="text-right font-bold text-emerald-600">
                          {formatCurrency(p.totalGaji)}
                        </TableCell>
                        <TableCell className="text-center">
                          {p.status === 'paid' ? (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-pointer" onClick={() => {
                              if (confirm('Ubah kembali ke Pending?')) {
                                fetch(`/api/payroll/${p.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'pending' }),
                                }).then(() => fetchPayroll());
                              }
                            }}>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Dibayar
                            </Badge>
                          ) : (
                            <Badge 
                              variant="outline" 
                              className="text-amber-600 border-amber-300 cursor-pointer hover:bg-amber-50"
                              onClick={() => handleMarkAsPaid(p.id)}
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPayslipDialog(p)}
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Cetak Slip Gaji"
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRecord(p.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-slate-800 dark:to-slate-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-slate-600 dark:text-slate-300">
              <p className="font-medium mb-1">Sistem Payroll 2 Mingguan:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400">
                <li>Setiap tahun terbagi menjadi <strong>26 periode</strong> (2 minggu per periode)</li>
                <li>Periode 1 dimulai dari 1 Januari, Periode 26 berakhir di akhir Desember</li>
                <li>Maksimal <strong>14 hari kerja</strong> per periode</li>
                <li>Hitungan: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">Gaji Harian × Hari Kerja + Bonus - Potongan</code></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payslip Print Dialog */}
      <Dialog open={showPayslipDialog} onOpenChange={setShowPayslipDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:p-0 print:shadow-none print:border-none print:overflow-visible">
          <DialogHeader className="print:hidden">
            <DialogTitle>Slip Gaji</DialogTitle>
            <DialogDescription>
              Preview slip gaji untuk dicetak
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayslip && (
            <div id="payslip-content" className="print:p-0">
              {/* Payslip Card */}
              <div className="border-2 border-slate-300 rounded-lg overflow-hidden print:border-black print:rounded-none">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 text-center print:bg-white print:text-black print:border-b-2 print:border-black">
                  <h2 className="text-xl font-bold">SLIP GAJI</h2>
                  <p className="text-sm opacity-90 print:text-black">Periode {selectedPeriode} - {selectedTahun}</p>
                </div>
                
                {/* Content */}
                <div className="p-4 space-y-4">
                  {/* Employee Info */}
                  <div className="border-b pb-3">
                    <h3 className="font-semibold text-slate-700 mb-2">Data Penerima</h3>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr>
                          <td className="text-slate-500 w-28">Nama</td>
                          <td className="font-medium">: {selectedPayslip.relawan.nama}</td>
                        </tr>
                        <tr>
                          <td className="text-slate-500">Divisi</td>
                          <td>: {selectedPayslip.relawan.divisi || '-'}</td>
                        </tr>
                        <tr>
                          <td className="text-slate-500">Jabatan</td>
                          <td>: {selectedPayslip.relawan.jabatan || '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Salary Details */}
                  <div className="border-b pb-3">
                    <h3 className="font-semibold text-slate-700 mb-2">Rincian Gaji</h3>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr>
                          <td className="text-slate-500 w-28">Gaji Harian</td>
                          <td className="text-right">: {formatCurrency(selectedPayslip.gajiHarian)}</td>
                        </tr>
                        <tr>
                          <td className="text-slate-500">Hari Kerja</td>
                          <td className="text-right">: {selectedPayslip.hariKerja} hari</td>
                        </tr>
                        <tr>
                          <td className="text-slate-500">Subtotal</td>
                          <td className="text-right">: {formatCurrency(selectedPayslip.gajiHarian * selectedPayslip.hariKerja)}</td>
                        </tr>
                        <tr>
                          <td className="text-slate-500">Bonus</td>
                          <td className="text-right">: {formatCurrency(selectedPayslip.bonus)}</td>
                        </tr>
                        <tr>
                          <td className="text-slate-500">Potongan</td>
                          <td className="text-right">: {formatCurrency(selectedPayslip.potongan)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Total */}
                  <div className="bg-emerald-50 p-3 rounded-lg print:bg-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">TOTAL GAJI</span>
                      <span className="font-bold text-xl text-emerald-600 print:text-black">{formatCurrency(selectedPayslip.totalGaji)}</span>
                    </div>
                  </div>
                  
                  {/* Signature */}
                  <div className="pt-4 mt-4 border-t">
                    <div className="flex justify-between items-end">
                      <div className="text-center">
                        <p className="text-sm text-slate-500">Penerima,</p>
                        <div className="h-16 mt-2"></div>
                        <p className="text-sm font-medium border-t border-slate-300 pt-1">{selectedPayslip.relawan.nama}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-500">Tanggal: _______________</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Print Button */}
              <div className="flex justify-end gap-2 mt-4 print:hidden">
                <Button variant="outline" onClick={() => setShowPayslipDialog(false)}>
                  Tutup
                </Button>
                <Button onClick={handlePrintPayslip} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600">
                  <Printer className="w-4 h-4" />
                  Cetak
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
