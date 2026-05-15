'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  FileText,
  Plus,
  Search,
  Calendar,
  Building2,
  Package,
  Edit,
  Trash2,
  Eye,
  Printer,
  Filter,
  Clock,
  CheckCircle,
  Loader2,
  User,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BeritaAcaraDistribusi {
  id: string;
  nomor: string;
  tanggal: string;
  jam: string | null;
  namaSekolah: string;
  jumlahPaket: number;
  kondisi: string | null;
  sppgNama: string | null;
  sppgInstansi: string | null;
  penerimaNama: string | null;
  penerimaJabatan: string | null;
  keterangan: string | null;
  status: string;
  distribusiId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DistribusiData {
  id: string;
  namaSekolah: string;
  jumlah: number;
  tanggal: string;
}

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const kondisiOptions = [
  { value: 'Baik', label: 'Baik' },
  { value: 'Cukup Baik', label: 'Cukup Baik' },
  { value: 'Kurang Baik', label: 'Kurang Baik' },
  { value: 'Rusak', label: 'Rusak' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft', color: 'bg-slate-100 text-slate-600' },
  { value: 'selesai', label: 'Selesai', color: 'bg-emerald-100 text-emerald-600' },
];

export function BeritaAcaraDistribusiPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BeritaAcaraDistribusi[]>([]);
  const [distribusiList, setDistribusiList] = useState<DistribusiData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  
  // Dialog states
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFromDistribusiDialog, setShowFromDistribusiDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BeritaAcaraDistribusi | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    nomor: '',
    tanggal: new Date().toISOString().split('T')[0],
    jam: '',
    namaSekolah: '',
    jumlahPaket: 0,
    kondisi: 'Baik',
    sppgNama: '',
    sppgInstansi: 'SPPG',
    penerimaNama: '',
    penerimaJabatan: '',
    keterangan: '',
    status: 'draft',
    distribusiId: '',
  });

  useEffect(() => {
    fetchData();
    fetchDistribusiList();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/berita-acara-distribusi');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch berita acara distribusi:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDistribusiList = async () => {
    try {
      const res = await fetch('/api/distribusi?limit=500');
      const result = await res.json();
      if (result.success) {
        setDistribusiList(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch distribusi list:', error);
    }
  };

  // Generate nomor berita acara otomatis
  const generateNomor = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const count = data.length + 1;
    return `BA/MBG/${year}/${month}/${String(count).padStart(3, '0')}`;
  };

  const getDayName = (date: Date) => {
    return DAYS[date.getDay()];
  };

  const formatDateLong = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${getDayName(date)}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleOpenForm = (item?: BeritaAcaraDistribusi) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        nomor: item.nomor,
        tanggal: new Date(item.tanggal).toISOString().split('T')[0],
        jam: item.jam || '',
        namaSekolah: item.namaSekolah,
        jumlahPaket: item.jumlahPaket,
        kondisi: item.kondisi || 'Baik',
        sppgNama: item.sppgNama || '',
        sppgInstansi: item.sppgInstansi || 'SPPG',
        penerimaNama: item.penerimaNama || '',
        penerimaJabatan: item.penerimaJabatan || '',
        keterangan: item.keterangan || '',
        status: item.status,
        distribusiId: item.distribusiId || '',
      });
    } else {
      setSelectedItem(null);
      setFormData({
        nomor: generateNomor(),
        tanggal: new Date().toISOString().split('T')[0],
        jam: '',
        namaSekolah: '',
        jumlahPaket: 0,
        kondisi: 'Baik',
        sppgNama: '',
        sppgInstansi: 'SPPG',
        penerimaNama: '',
        penerimaJabatan: '',
        keterangan: '',
        status: 'draft',
        distribusiId: '',
      });
    }
    setShowFormDialog(true);
  };

  const handleFromDistribusi = (distribusi: DistribusiData) => {
    setSelectedItem(null);
    setFormData({
      nomor: generateNomor(),
      tanggal: new Date(distribusi.tanggal).toISOString().split('T')[0],
      jam: '',
      namaSekolah: distribusi.namaSekolah,
      jumlahPaket: distribusi.jumlah,
      kondisi: 'Baik',
      sppgNama: '',
      sppgInstansi: 'SPPG',
      penerimaNama: '',
      penerimaJabatan: 'Kepala Sekolah',
      keterangan: '',
      status: 'draft',
      distribusiId: distribusi.id,
    });
    setShowFromDistribusiDialog(false);
    setShowFormDialog(true);
  };

  const handleSave = async () => {
    if (!formData.namaSekolah || formData.jumlahPaket <= 0) {
      toast.error('Nama sekolah dan jumlah paket harus diisi');
      return;
    }

    try {
      setSaving(true);
      const url = selectedItem 
        ? '/api/berita-acara-distribusi'
        : '/api/berita-acara-distribusi';
      
      const body = selectedItem 
        ? { ...formData, id: selectedItem.id }
        : formData;

      const res = await fetch(url, {
        method: selectedItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...body,
          tanggal: new Date(formData.tanggal).toISOString(),
        }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(selectedItem ? 'Berita acara berhasil diperbarui' : 'Berita acara berhasil dibuat');
        setShowFormDialog(false);
        fetchData();
      } else {
        toast.error(result.error || 'Gagal menyimpan');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      const res = await fetch(`/api/berita-acara-distribusi?id=${selectedItem.id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Berita acara berhasil dihapus');
        setShowDeleteDialog(false);
        fetchData();
      } else {
        toast.error(result.error || 'Gagal menghapus');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Gagal menghapus data');
    }
  };

  const handlePrint = (item: BeritaAcaraDistribusi) => {
    const printWindow = window.open('', '_blank', 'width=800,height=1000');
    if (!printWindow) {
      toast.error('Tidak dapat membuka jendela cetak');
      return;
    }

    const date = new Date(item.tanggal);
    const dayName = DAYS[date.getDay()];
    const formattedDate = `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Berita Acara Penerimaan Paket Makanan - ${item.nomor}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Times New Roman', serif; 
      padding: 30px 40px;
      font-size: 14px;
      line-height: 1.6;
    }
    .logos {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 2px solid #000;
    }
    .logo-item {
      text-align: center;
      width: 45%;
    }
    .logo-item img {
      width: 60px;
      height: 60px;
      object-fit: contain;
    }
    .logo-text {
      font-size: 10px;
      font-weight: bold;
      line-height: 1.3;
    }
    .title-section {
      text-align: center;
      margin: 20px 0 25px;
    }
    .title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .subtitle {
      font-size: 14px;
      font-weight: bold;
    }
    .nomor {
      margin-bottom: 20px;
      font-weight: bold;
    }
    .content {
      text-align: justify;
      margin-bottom: 30px;
      line-height: 1.8;
    }
    .content-underline {
      display: inline-block;
      min-width: 150px;
      border-bottom: 1px solid #000;
      text-align: center;
    }
    .info-row {
      margin: 10px 0;
      display: flex;
      flex-wrap: wrap;
    }
    .info-row label {
      width: 180px;
    }
    .signature-section {
      margin-top: 50px;
      display: flex;
      justify-content: space-between;
    }
    .signature-box {
      text-align: center;
      width: 200px;
    }
    .signature-line {
      border-bottom: 1px solid #000;
      margin-top: 60px;
      padding-top: 5px;
    }
    .footer-note {
      margin-top: 40px;
      font-size: 11px;
      text-align: center;
    }
    @media print {
      body { padding: 20px 30px; }
      @page { margin: 1cm; size: A4; }
    }
  </style>
</head>
<body>
  <div class="logos">
    <div class="logo-item">
      <div class="logo-text">
        BADAN GIZI NASIONAL<br>
        REPUBLIK INDONESIA
      </div>
    </div>
    <div class="logo-item">
      <div class="logo-text">
        SATUAN PELAYANAN<br>
        PEMENUHAN GIZI (SPPG)
      </div>
    </div>
  </div>

  <div class="title-section">
    <div class="title">BERITA ACARA PENERIMAAN PAKET MAKANAN</div>
    <div class="subtitle">PROGRAM MAKAN BERGIZI GRATIS</div>
  </div>

  <div class="nomor">Nomor: ${item.nomor}</div>

  <div class="content">
    <p>
      Pada Hari <span class="content-underline">${dayName}</span> 
      Tanggal <span class="content-underline">${formattedDate}</span> 
      Jam <span class="content-underline">${item.jam || '........'}</span> 
      telah diterima paket makanan sejumlah: <span class="content-underline">${item.jumlahPaket} Paket</span> 
      Makanan Bergizi dari Satuan Pelayanan Pemenuhan Gizi (SPPG) 
      <span class="content-underline">${item.sppgInstansi || '........'}</span> 
      dalam keadaan <span class="content-underline">${item.kondisi || 'Baik'}</span>.
    </p>
  </div>

  <div style="margin: 25px 0;">
    <table style="width: 100%;">
      <tr>
        <td style="width: 150px; vertical-align: top;">Yang menyerahkan</td>
        <td style="vertical-align: top;">: <span class="content-underline">${item.sppgNama || '........................'}</span></td>
      </tr>
      <tr>
        <td style="vertical-align: top;">Instansi</td>
        <td style="vertical-align: top;">: SPPG <span class="content-underline">${item.sppgInstansi || '...........'}</span></td>
      </tr>
    </table>
  </div>

  <div style="margin: 25px 0;">
    <table style="width: 100%;">
      <tr>
        <td style="width: 150px; vertical-align: top;">Yang menerima</td>
        <td style="vertical-align: top;">: <span class="content-underline">${item.penerimaNama || '........................'}</span></td>
      </tr>
      <tr>
        <td style="vertical-align: top;">Instansi</td>
        <td style="vertical-align: top;">: <span class="content-underline">${item.namaSekolah}</span></td>
      </tr>
    </table>
  </div>

  ${item.keterangan ? `<div style="margin: 20px 0;"><strong>Keterangan:</strong> ${item.keterangan}</div>` : ''}

  <div class="signature-section">
    <div class="signature-box">
      <div>Yang menyerahkan,</div>
      <div class="signature-line">${item.sppgNama || '................'}</div>
    </div>
    <div class="signature-box">
      <div>Yang menerima,</div>
      <div class="signature-line">${item.penerimaNama || '................'}</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
      window.onafterprint = function() { window.close(); }
    }
  </script>
</body>
</html>`;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Filter data
  const filteredData = data.filter(item => {
    const matchesSearch = item.namaSekolah.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.nomor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesDate = !filterDate || new Date(item.tanggal).toISOString().split('T')[0] === filterDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(o => o.value === status);
    if (!option) return <Badge>Draft</Badge>;
    return (
      <Badge className={`${option.color} gap-1`}>
        {status === 'selesai' && <CheckCircle className="w-3 h-3" />}
        {option.label}
      </Badge>
    );
  };

  // Group distribusi by date
  const distribusiByDate = distribusiList.reduce((acc, item) => {
    const date = new Date(item.tanggal).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, DistribusiData[]>);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Berita Acara Distribusi</h1>
            <p className="text-xs text-slate-500">Dokumen penerimaan paket makanan MBG</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowFromDistribusiDialog(true)} 
            variant="outline"
            className="gap-2"
          >
            <Building2 className="w-4 h-4" />
            Dari Distribusi
          </Button>
          <Button onClick={() => handleOpenForm()} className="gap-2 bg-gradient-to-r from-orange-500 to-red-600">
            <Plus className="w-4 h-4" />
            Buat Baru
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari sekolah atau nomor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-[160px]"
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-sm font-semibold line-clamp-2">{item.namaSekolah}</CardTitle>
                      <p className="text-xs text-slate-500 mt-1">{item.nomor}</p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDateLong(item.tanggal)}</span>
                      {item.jam && (
                        <span className="text-slate-400">| {item.jam}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-orange-500" />
                      <span className="font-semibold text-orange-600">{item.jumlahPaket} Paket</span>
                      <Badge variant="outline" className="text-[10px]">{item.kondisi || 'Baik'}</Badge>
                    </div>
                    {item.penerimaNama && (
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.penerimaNama}</span>
                        {item.penerimaJabatan && (
                          <span className="text-slate-400">({item.penerimaJabatan})</span>
                        )}
                      </div>
                    )}
                    {item.sppgNama && (
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>SPPG: {item.sppgNama}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1.5 mt-4 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        setShowViewDialog(true);
                      }}
                      className="flex-1 h-8 text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Lihat
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenForm(item)}
                      className="flex-1 h-8 text-xs"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePrint(item)}
                      className="flex-1 h-8 text-xs"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" />
                      Cetak
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        setShowDeleteDialog(true);
                      }}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredData.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-500">
            <Package className="w-16 h-16 text-slate-300 mb-4" />
            <p className="font-medium">Tidak ada data</p>
            <p className="text-sm">Belum ada berita acara distribusi yang dibuat</p>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Edit Berita Acara' : 'Buat Berita Acara Baru'}</DialogTitle>
            <DialogDescription>
              Isi form berikut untuk {selectedItem ? 'mengubah' : 'membuat'} berita acara penerimaan paket makanan
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nomor Berita Acara</Label>
                <Input
                  value={formData.nomor}
                  onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
                  placeholder="Nomor berita acara"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Jam</Label>
                <Input
                  type="time"
                  value={formData.jam}
                  onChange={(e) => setFormData({ ...formData, jam: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Jumlah Paket *</Label>
                <Input
                  type="number"
                  value={formData.jumlahPaket}
                  onChange={(e) => setFormData({ ...formData, jumlahPaket: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Nama Sekolah *</Label>
              <Input
                value={formData.namaSekolah}
                onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                placeholder="Nama sekolah penerima"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kondisi Paket</Label>
                <Select value={formData.kondisi} onValueChange={(v) => setFormData({ ...formData, kondisi: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {kondisiOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>SPPG Instansi</Label>
                <Input
                  value={formData.sppgInstansi}
                  onChange={(e) => setFormData({ ...formData, sppgInstansi: e.target.value })}
                  placeholder="Nama instansi SPPG"
                />
              </div>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-slate-600 mb-3">Data Penyerah (SPPG)</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Penyerah</Label>
                  <Input
                    value={formData.sppgNama}
                    onChange={(e) => setFormData({ ...formData, sppgNama: e.target.value })}
                    placeholder="Nama yang menyerahkan"
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-slate-600 mb-3">Data Penerima (Sekolah)</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Penerima</Label>
                  <Input
                    value={formData.penerimaNama}
                    onChange={(e) => setFormData({ ...formData, penerimaNama: e.target.value })}
                    placeholder="Nama yang menerima"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jabatan Penerima</Label>
                  <Input
                    value={formData.penerimaJabatan}
                    onChange={(e) => setFormData({ ...formData, penerimaJabatan: e.target.value })}
                    placeholder="Jabatan penerima"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Keterangan</Label>
              <Textarea
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                placeholder="Catatan tambahan..."
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-orange-500 to-red-600">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem?.namaSekolah}</DialogTitle>
            <DialogDescription>{selectedItem?.nomor}</DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Tanggal:</span>
                  <p className="font-medium">{formatDateLong(selectedItem.tanggal)}</p>
                  {selectedItem.jam && <p className="text-slate-400">Jam: {selectedItem.jam}</p>}
                </div>
                <div>
                  <span className="text-slate-500">Jumlah Paket:</span>
                  <p className="font-semibold text-orange-600">{selectedItem.jumlahPaket} Paket</p>
                </div>
                <div>
                  <span className="text-slate-500">Kondisi:</span>
                  <p className="font-medium">{selectedItem.kondisi || 'Baik'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Status:</span>
                  <p>{getStatusBadge(selectedItem.status)}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-slate-600 mb-2">Penyerah (SPPG)</p>
                <div className="text-sm">
                  <p><span className="text-slate-500">Nama:</span> {selectedItem.sppgNama || '-'}</p>
                  <p><span className="text-slate-500">Instansi:</span> {selectedItem.sppgInstansi || '-'}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-slate-600 mb-2">Penerima</p>
                <div className="text-sm">
                  <p><span className="text-slate-500">Nama:</span> {selectedItem.penerimaNama || '-'}</p>
                  <p><span className="text-slate-500">Jabatan:</span> {selectedItem.penerimaJabatan || '-'}</p>
                </div>
              </div>
              
              {selectedItem.keterangan && (
                <div className="border-t pt-4">
                  <span className="text-slate-500 text-sm">Keterangan:</span>
                  <p className="mt-1 text-sm">{selectedItem.keterangan}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Tutup
            </Button>
            <Button onClick={() => selectedItem && handlePrint(selectedItem)} className="gap-2">
              <Printer className="w-4 h-4" />
              Cetak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Berita Acara?</DialogTitle>
            <DialogDescription>
              Data akan dihapus secara permanen dan tidak dapat dikembalikan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* From Distribusi Dialog */}
      <Dialog open={showFromDistribusiDialog} onOpenChange={setShowFromDistribusiDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Pilih Data Distribusi</DialogTitle>
            <DialogDescription>
              Pilih data distribusi untuk membuat berita acara
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh]">
            <div className="space-y-4 pr-4">
              {Object.entries(distribusiByDate)
                .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                .map(([date, items]) => (
                  <div key={date}>
                    <div className="sticky top-0 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg mb-2">
                      <p className="text-sm font-semibold">{formatDateLong(date)}</p>
                    </div>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <Card 
                          key={item.id} 
                          className="cursor-pointer hover:border-orange-300 transition-colors"
                          onClick={() => handleFromDistribusi(item)}
                        >
                          <CardContent className="p-3 flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{item.namaSekolah}</p>
                              <p className="text-xs text-slate-500">{item.jumlah} paket</p>
                            </div>
                            <Button size="sm" variant="ghost">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              
              {distribusiList.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p>Tidak ada data distribusi</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFromDistribusiDialog(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
