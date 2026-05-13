'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Wallet, Plus, Pencil, Trash2, Download, FileText, FileSpreadsheet,
  Calendar, Users, DollarSign, TrendingUp, CheckCircle, Clock, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Relawan {
  id: string;
  nama: string;
  divisi: string | null;
  jabatan: string | null;
  jk: string | null;
  nik: string | null;
  alamat: string | null;
}

interface PayrollRecord {
  id: string;
  relawanId: string;
  bulan: number;
  tahun: number;
  gajiPokok: number;
  hariKerja: number;
  bonus: number;
  potongan: number;
  totalGaji: number;
  status: string;
  tanggalBayar: Date | null;
  keterangan: string | null;
  relawan: Relawan;
}

interface Summary {
  totalRecords: number;
  totalGajiPokok: number;
  totalBonus: number;
  totalPotongan: number;
  grandTotal: number;
}

const MONTHS = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function PayrollPage() {
  const [loading, setLoading] = useState(true);
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [relawanList, setRelawanList] = useState<Relawan[]>([]);

  // Filters
  const [filterBulan, setFilterBulan] = useState<string>('all');
  const [filterTahun, setFilterTahun] = useState<string>(new Date().getFullYear().toString());
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Dialog states
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayrollRecord | null>(null);
  const [generateForm, setGenerateForm] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
  });
  const [editForm, setEditForm] = useState({
    gajiPokok: 0,
    hariKerja: 0,
    bonus: 0,
    potongan: 0,
    keterangan: '',
  });

  useEffect(() => {
    fetchPayroll();
    fetchRelawan();
  }, [filterBulan, filterTahun, filterStatus]);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterBulan !== 'all') params.append('bulan', filterBulan);
      if (filterTahun !== 'all') params.append('tahun', filterTahun);
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const res = await fetch(`/api/payroll?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setPayrollData(data.data);
        setSummary(data.summary);
        if (data.years.length > 0) {
          setAvailableYears(data.years);
        }
      }
    } catch (error) {
      console.error('Failed to fetch payroll:', error);
      toast.error('Gagal memuat data payroll');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelawan = async () => {
    try {
      const res = await fetch('/api/relawan');
      const data = await res.json();
      if (data.success) {
        setRelawanList(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch relawan:', error);
    }
  };

  const handleGeneratePayroll = async () => {
    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulan: generateForm.bulan,
          tahun: generateForm.tahun,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setIsGenerateDialogOpen(false);
        fetchPayroll();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Failed to generate payroll:', error);
      toast.error('Gagal membuat payroll');
    }
  };

  const handleEditPayroll = async () => {
    if (!editingPayroll) return;

    try {
      const res = await fetch(`/api/payroll/${editingPayroll.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Data payroll berhasil diupdate');
        setIsEditDialogOpen(false);
        fetchPayroll();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Failed to update payroll:', error);
      toast.error('Gagal mengupdate payroll');
    }
  };

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
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Failed to mark as paid:', error);
      toast.error('Gagal mengubah status');
    }
  };

  const handleDeletePayroll = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data payroll ini?')) return;

    try {
      const res = await fetch(`/api/payroll/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Data payroll berhasil dihapus');
        fetchPayroll();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Failed to delete payroll:', error);
      toast.error('Gagal menghapus payroll');
    }
  };

  const openEditDialog = (payroll: PayrollRecord) => {
    setEditingPayroll(payroll);
    setEditForm({
      gajiPokok: payroll.gajiPokok,
      hariKerja: payroll.hariKerja,
      bonus: payroll.bonus,
      potongan: payroll.potongan,
      keterangan: payroll.keterangan || '',
    });
    setIsEditDialogOpen(true);
  };

  const exportToCSV = () => {
    const headers = 'No,Nama,Divisi,Jabatan,Bulan,Tahun,Gaji Pokok,Hari Kerja,Subtotal,Bonus,Potongan,Total Gaji,Status\n';
    const rows = payrollData.map((p, i) => {
      const subtotal = p.gajiPokok * p.hariKerja;
      return `${i + 1},"${p.relawan.nama}","${p.relawan.divisi || '-'}","${p.relawan.jabatan || '-'}",${MONTHS[p.bulan - 1].label},${p.tahun},${p.gajiPokok},${p.hariKerja},${subtotal},${p.bonus},${p.potongan},${p.totalGaji},${p.status}`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_${filterBulan !== 'all' ? MONTHS[parseInt(filterBulan) - 1].label : 'all'}_${filterTahun}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate available years for dropdown
  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= currentYear - 5; y--) {
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
            <p className="text-sm text-slate-500">Sistem penggajian relawan</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsGenerateDialogOpen(true)} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
            <Plus className="w-4 h-4" />
            Generate Payroll
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Relawan</p>
                <p className="text-xl font-bold">{summary?.totalRecords || 0}</p>
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
                <p className="text-sm text-slate-500">Total Gaji Pokok</p>
                <p className="text-xl font-bold text-emerald-600">{formatCurrency(summary?.totalGajiPokok || 0)}</p>
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
                <p className="text-sm text-slate-500">Total Bonus</p>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(summary?.totalBonus || 0)}</p>
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
                <p className="text-sm text-slate-500">Grand Total</p>
                <p className="text-xl font-bold text-purple-600">{formatCurrency(summary?.grandTotal || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium">Filter:</span>
            </div>

            <Select value={filterBulan} onValueChange={setFilterBulan}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Bulan</SelectItem>
                {MONTHS.map(m => (
                  <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterTahun} onValueChange={setFilterTahun}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahun</SelectItem>
                {yearOptions.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Dibayar</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={fetchPayroll} className="gap-2 ml-auto">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>

            <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Daftar Payroll</CardTitle>
          <CardDescription>
            {filterBulan !== 'all' || filterTahun !== 'all'
              ? `Periode: ${filterBulan !== 'all' ? MONTHS[parseInt(filterBulan) - 1].label : ''} ${filterTahun !== 'all' ? filterTahun : ''}`
              : 'Semua periode'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payrollData.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">Belum ada data payroll</p>
              <Button onClick={() => setIsGenerateDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Generate Payroll Baru
              </Button>
            </div>
          ) : (
            <ScrollArea className="w-full">
              <div className="min-w-[900px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Nama Relawan</TableHead>
                      <TableHead>Divisi</TableHead>
                      <TableHead>Jabatan</TableHead>
                      <TableHead className="text-center">Periode</TableHead>
                      <TableHead className="text-right">Gaji Pokok</TableHead>
                      <TableHead className="text-center">Hari Kerja</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="text-right">Bonus</TableHead>
                      <TableHead className="text-right">Potongan</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollData.map((p, i) => {
                      const subtotal = p.gajiPokok * p.hariKerja;
                      return (
                        <TableRow key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <TableCell>{i + 1}</TableCell>
                          <TableCell className="font-medium">{p.relawan.nama}</TableCell>
                          <TableCell>{p.relawan.divisi || '-'}</TableCell>
                          <TableCell>{p.relawan.jabatan || '-'}</TableCell>
                          <TableCell className="text-center text-sm">
                            {MONTHS[p.bulan - 1].label} {p.tahun}
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(p.gajiPokok)}</TableCell>
                          <TableCell className="text-center">{p.hariKerja}</TableCell>
                          <TableCell className="text-right">{formatCurrency(subtotal)}</TableCell>
                          <TableCell className="text-right text-emerald-600">{formatCurrency(p.bonus)}</TableCell>
                          <TableCell className="text-right text-red-600">{formatCurrency(p.potongan)}</TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(p.totalGaji)}</TableCell>
                          <TableCell className="text-center">
                            {p.status === 'paid' ? (
                              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Dibayar
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-amber-600 border-amber-300">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">Aksi</Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(p)}>
                                  <Pencil className="w-4 h-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                {p.status === 'pending' && (
                                  <DropdownMenuItem onClick={() => handleMarkAsPaid(p.id)} className="text-emerald-600">
                                    <CheckCircle className="w-4 h-4 mr-2" /> Tandai Dibayar
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleDeletePayroll(p.id)} className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" /> Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Generate Payroll Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Payroll Baru</DialogTitle>
            <DialogDescription>
              Pilih periode untuk membuat payroll baru berdasarkan data relawan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bulan</Label>
                <Select
                  value={generateForm.bulan.toString()}
                  onValueChange={(v) => setGenerateForm({ ...generateForm, bulan: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map(m => (
                      <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tahun</Label>
                <Select
                  value={generateForm.tahun.toString()}
                  onValueChange={(v) => setGenerateForm({ ...generateForm, tahun: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Payroll akan dibuat untuk {relawanList.length} relawan yang terdaftar.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>Batal</Button>
            <Button onClick={handleGeneratePayroll} className="bg-gradient-to-r from-emerald-500 to-teal-600">
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Payroll Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payroll</DialogTitle>
            <DialogDescription>
              Ubah detail payroll untuk {editingPayroll?.relawan.nama}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gaji Pokok</Label>
                <Input
                  type="number"
                  value={editForm.gajiPokok}
                  onChange={(e) => setEditForm({ ...editForm, gajiPokok: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Hari Kerja</Label>
                <Input
                  type="number"
                  value={editForm.hariKerja}
                  onChange={(e) => setEditForm({ ...editForm, hariKerja: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Bonus</Label>
                <Input
                  type="number"
                  value={editForm.bonus}
                  onChange={(e) => setEditForm({ ...editForm, bonus: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Potongan</Label>
                <Input
                  type="number"
                  value={editForm.potongan}
                  onChange={(e) => setEditForm({ ...editForm, potongan: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Keterangan</Label>
              <Input
                value={editForm.keterangan}
                onChange={(e) => setEditForm({ ...editForm, keterangan: e.target.value })}
                placeholder="Keterangan (opsional)"
              />
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <p className="text-sm text-slate-500">Total Gaji:</p>
              <p className="text-xl font-bold text-emerald-600">
                {formatCurrency(editForm.gajiPokok * editForm.hariKerja + editForm.bonus - editForm.potongan)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
            <Button onClick={handleEditPayroll} className="bg-gradient-to-r from-emerald-500 to-teal-600">
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
