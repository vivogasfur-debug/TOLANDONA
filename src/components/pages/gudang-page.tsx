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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Warehouse,
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
  FileText,
  Tag,
  Loader2,
  Download,
  TrendingUp,
  TrendingDown,
  Box,
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface Kategori {
  id: string;
  nama: string;
  deskripsi: string | null;
  _count?: { barang: number };
}

interface Barang {
  id: string;
  kode: string;
  nama: string;
  satuan: string;
  stok: number;
  stokMin: number;
  harga: number;
  lokasi: string | null;
  keterangan: string | null;
  status: string;
  kategori: Kategori | null;
  _count?: { transaksi: number };
}

interface Transaksi {
  id: string;
  barangId: string;
  jenis: string;
  jumlah: number;
  hargaSatuan: number;
  totalHarga: number;
  tanggal: string;
  keterangan: string | null;
  referensi: string | null;
  penerima: string | null;
  pengirim: string | null;
  barang: Barang;
}

export function GudangPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventori');
  
  // Data states
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Barang[]>([]);
  
  // Filter states
  const [searchBarang, setSearchBarang] = useState('');
  const [filterKategori, setFilterKategori] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterJenis, setFilterJenis] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Dialog states
  const [showBarangDialog, setShowBarangDialog] = useState(false);
  const [showTransaksiDialog, setShowTransaksiDialog] = useState(false);
  const [showKategoriDialog, setShowKategoriDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteType, setDeleteType] = useState<'barang' | 'kategori' | 'transaksi'>('barang');
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [barangForm, setBarangForm] = useState({
    kode: '',
    nama: '',
    kategoriId: '',
    satuan: 'pcs',
    stok: 0,
    stokMin: 0,
    harga: 0,
    lokasi: '',
    keterangan: '',
    status: 'aktif'
  });
  
  const [transaksiForm, setTransaksiForm] = useState({
    barangId: '',
    jenis: 'masuk',
    jumlah: 1,
    hargaSatuan: 0,
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: '',
    referensi: '',
    penerima: '',
    pengirim: ''
  });
  
  const [kategoriForm, setKategoriForm] = useState({
    nama: '',
    deskripsi: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchBarang(),
      fetchKategori(),
      fetchTransaksi()
    ]);
    setLoading(false);
  };

  const fetchBarang = async () => {
    try {
      const res = await fetch('/api/barang');
      const data = await res.json();
      if (data.success) {
        setBarangList(data.data);
        setLowStockItems(data.lowStockItems || []);
      }
    } catch (error) {
      console.error('Failed to fetch barang:', error);
    }
  };

  const fetchKategori = async () => {
    try {
      const res = await fetch('/api/barang-kategori');
      const data = await res.json();
      if (data.success) {
        setKategoriList(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch kategori:', error);
    }
  };

  const fetchTransaksi = async () => {
    try {
      const params = new URLSearchParams();
      if (filterJenis !== 'all') params.append('jenis', filterJenis);
      if (dateRange.start) params.append('tanggalMulai', dateRange.start);
      if (dateRange.end) params.append('tanggalSelesai', dateRange.end);
      
      const res = await fetch(`/api/barang-transaksi?${params}`);
      const data = await res.json();
      if (data.success) {
        setTransaksiList(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch transaksi:', error);
    }
  };

  // Barang CRUD
  const handleSaveBarang = async () => {
    if (!barangForm.kode || !barangForm.nama || !barangForm.satuan) {
      toast.error('Kode, nama, dan satuan harus diisi');
      return;
    }

    setSaving(true);
    try {
      const url = editingItem ? '/api/barang' : '/api/barang';
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem 
        ? { ...barangForm, id: editingItem.id }
        : barangForm;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setShowBarangDialog(false);
        resetBarangForm();
        fetchBarang();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Gagal menyimpan barang');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBarang = async (id: string) => {
    try {
      const res = await fetch(`/api/barang?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setShowDeleteDialog(false);
        fetchBarang();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Gagal menghapus barang');
    }
  };

  const resetBarangForm = () => {
    setEditingItem(null);
    setBarangForm({
      kode: '',
      nama: '',
      kategoriId: '',
      satuan: 'pcs',
      stok: 0,
      stokMin: 0,
      harga: 0,
      lokasi: '',
      keterangan: '',
      status: 'aktif'
    });
  };

  // Transaksi CRUD
  const handleSaveTransaksi = async () => {
    if (!transaksiForm.barangId || !transaksiForm.jenis || transaksiForm.jumlah <= 0) {
      toast.error('Barang, jenis, dan jumlah harus diisi');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/barang-transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaksiForm)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        if (data.lowStock) {
          toast.warning('Stok barang di bawah batas minimum!');
        }
        setShowTransaksiDialog(false);
        resetTransaksiForm();
        fetchBarang();
        fetchTransaksi();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Gagal menyimpan transaksi');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTransaksi = async (id: string) => {
    try {
      const res = await fetch(`/api/barang-transaksi?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setShowDeleteDialog(false);
        fetchBarang();
        fetchTransaksi();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Gagal menghapus transaksi');
    }
  };

  const resetTransaksiForm = () => {
    setTransaksiForm({
      barangId: '',
      jenis: 'masuk',
      jumlah: 1,
      hargaSatuan: 0,
      tanggal: new Date().toISOString().split('T')[0],
      keterangan: '',
      referensi: '',
      penerima: '',
      pengirim: ''
    });
  };

  // Kategori CRUD
  const handleSaveKategori = async () => {
    if (!kategoriForm.nama) {
      toast.error('Nama kategori harus diisi');
      return;
    }

    setSaving(true);
    try {
      const url = editingItem ? '/api/barang-kategori' : '/api/barang-kategori';
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem 
        ? { ...kategoriForm, id: editingItem.id }
        : kategoriForm;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setShowKategoriDialog(false);
        resetKategoriForm();
        fetchKategori();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Gagal menyimpan kategori');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKategori = async (id: string) => {
    try {
      const res = await fetch(`/api/barang-kategori?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setShowDeleteDialog(false);
        fetchKategori();
        fetchBarang();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Gagal menghapus kategori');
    }
  };

  const resetKategoriForm = () => {
    setEditingItem(null);
    setKategoriForm({ nama: '', deskripsi: '' });
  };

  // Filter barang
  const filteredBarang = barangList.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchBarang.toLowerCase()) ||
                         item.kode.toLowerCase().includes(searchBarang.toLowerCase());
    const matchesKategori = filterKategori === 'all' || item.kategoriId === filterKategori;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesKategori && matchesStatus;
  });

  // Calculate totals
  const totalNilaiStok = barangList.reduce((sum, item) => sum + (item.stok * item.harga), 0);
  const totalBarang = barangList.filter(b => b.status === 'aktif').length;
  const totalMasuk = transaksiList.filter(t => t.jenis === 'masuk').reduce((sum, t) => sum + t.totalHarga, 0);
  const totalKeluar = transaksiList.filter(t => t.jenis === 'keluar').reduce((sum, t) => sum + t.totalHarga, 0);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center shadow-lg">
            <Warehouse className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Gudang</h1>
            <p className="text-xs text-slate-500">Manajemen inventori dan laporan</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Box className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Barang</p>
                <p className="text-lg font-bold">{totalBarang}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-cyan-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Nilai Stok</p>
                <p className="text-lg font-bold">Rp {totalNilaiStok.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <ArrowDownCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Barang Masuk</p>
                <p className="text-lg font-bold">Rp {totalMasuk.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <ArrowUpCircle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Barang Keluar</p>
                <p className="text-lg font-bold">Rp {totalKeluar.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-0 shadow-lg bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium text-sm">
                {lowStockItems.length} barang dengan stok di bawah minimum:
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {lowStockItems.slice(0, 5).map(item => (
                <Badge key={item.id} variant="outline" className="text-xs bg-amber-100 text-amber-700">
                  {item.nama} ({item.stok} {item.satuan})
                </Badge>
              ))}
              {lowStockItems.length > 5 && (
                <Badge variant="outline" className="text-xs">+{lowStockItems.length - 5} lainnya</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="inventori" className="gap-2">
            <Package className="w-4 h-4" />
            Inventori
          </TabsTrigger>
          <TabsTrigger value="transaksi" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Transaksi
          </TabsTrigger>
          <TabsTrigger value="kategori" className="gap-2">
            <Tag className="w-4 h-4" />
            Kategori
          </TabsTrigger>
        </TabsList>

        {/* Inventori Tab */}
        <TabsContent value="inventori" className="space-y-4 mt-4">
          {/* Filters */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Cari barang..."
                    value={searchBarang}
                    onChange={(e) => setSearchBarang(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterKategori} onValueChange={setFilterKategori}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {kategoriList.map(k => (
                      <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="nonaktif">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => { resetBarangForm(); setShowBarangDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Barang Table */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <div className="min-w-[800px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800">
                        <TableHead className="w-[80px]">Kode</TableHead>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead className="w-[100px]">Kategori</TableHead>
                        <TableHead className="w-[80px]">Satuan</TableHead>
                        <TableHead className="w-[80px]">Stok</TableHead>
                        <TableHead className="w-[100px]">Min. Stok</TableHead>
                        <TableHead className="w-[120px]">Harga</TableHead>
                        <TableHead className="w-[100px]">Lokasi</TableHead>
                        <TableHead className="w-[80px]">Status</TableHead>
                        <TableHead className="w-[80px]">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBarang.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                            Tidak ada data barang
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBarang.map((item) => (
                          <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableCell className="font-mono text-xs">{item.kode}</TableCell>
                            <TableCell className="font-medium">{item.nama}</TableCell>
                            <TableCell>
                              {item.kategori && (
                                <Badge variant="outline" className="text-xs">
                                  {item.kategori.nama}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{item.satuan}</TableCell>
                            <TableCell>
                              <span className={item.stok <= item.stokMin ? 'text-red-600 font-bold' : ''}>
                                {item.stok}
                              </span>
                            </TableCell>
                            <TableCell>{item.stokMin}</TableCell>
                            <TableCell>Rp {item.harga.toLocaleString('id-ID')}</TableCell>
                            <TableCell className="text-xs">{item.lokasi || '-'}</TableCell>
                            <TableCell>
                              <Badge className={item.status === 'aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    setEditingItem(item);
                                    setBarangForm({
                                      kode: item.kode,
                                      nama: item.nama,
                                      kategoriId: item.kategoriId || '',
                                      satuan: item.satuan,
                                      stok: item.stok,
                                      stokMin: item.stokMin,
                                      harga: item.harga,
                                      lokasi: item.lokasi || '',
                                      keterangan: item.keterangan || '',
                                      status: item.status
                                    });
                                    setShowBarangDialog(true);
                                  }}
                                >
                                  <Edit className="w-3 h-3 text-blue-500" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    setEditingItem(item);
                                    setDeleteType('barang');
                                    setShowDeleteDialog(true);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaksi Tab */}
        <TabsContent value="transaksi" className="space-y-4 mt-4">
          {/* Filters */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center gap-3">
                <Select value={filterJenis} onValueChange={setFilterJenis}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="masuk">Masuk</SelectItem>
                    <SelectItem value="keluar">Keluar</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-[160px]"
                />
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-[160px]"
                />
                <Button variant="outline" onClick={fetchTransaksi}>
                  Terapkan
                </Button>
                <Button onClick={() => { resetTransaksiForm(); setShowTransaksiDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Transaksi
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transaksi Table */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <div className="min-w-[900px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800">
                        <TableHead className="w-[100px]">Tanggal</TableHead>
                        <TableHead className="w-[80px]">Jenis</TableHead>
                        <TableHead>Barang</TableHead>
                        <TableHead className="w-[80px]">Jumlah</TableHead>
                        <TableHead className="w-[120px]">Harga Satuan</TableHead>
                        <TableHead className="w-[120px]">Total</TableHead>
                        <TableHead>Referensi</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead className="w-[60px]">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transaksiList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                            Tidak ada data transaksi
                          </TableCell>
                        </TableRow>
                      ) : (
                        transaksiList.map((item) => (
                          <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableCell className="text-xs">
                              {new Date(item.tanggal).toLocaleDateString('id-ID')}
                            </TableCell>
                            <TableCell>
                              <Badge className={item.jenis === 'masuk' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                {item.jenis === 'masuk' ? (
                                  <><ArrowDownCircle className="w-3 h-3 mr-1" /> Masuk</>
                                ) : (
                                  <><ArrowUpCircle className="w-3 h-3 mr-1" /> Keluar</>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{item.barang.nama}</p>
                                <p className="text-xs text-slate-500">{item.barang.kode}</p>
                              </div>
                            </TableCell>
                            <TableCell>{item.jumlah} {item.barang.satuan}</TableCell>
                            <TableCell>Rp {item.hargaSatuan.toLocaleString('id-ID')}</TableCell>
                            <TableCell className="font-semibold">Rp {item.totalHarga.toLocaleString('id-ID')}</TableCell>
                            <TableCell className="text-xs">{item.referensi || '-'}</TableCell>
                            <TableCell className="text-xs">{item.keterangan || '-'}</TableCell>
                            <TableCell>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => {
                                  setEditingItem(item);
                                  setDeleteType('transaksi');
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Kategori Tab */}
        <TabsContent value="kategori" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">Kelola kategori barang</p>
            <Button onClick={() => { resetKategoriForm(); setShowKategoriDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kategori
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kategoriList.map((item) => (
              <Card key={item.id} className="border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{item.nama}</h3>
                      <p className="text-xs text-slate-500 mt-1">{item.deskripsi || 'Tidak ada deskripsi'}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {item._count?.barang || 0} barang
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => {
                          setEditingItem(item);
                          setKategoriForm({
                            nama: item.nama,
                            deskripsi: item.deskripsi || ''
                          });
                          setShowKategoriDialog(true);
                        }}
                      >
                        <Edit className="w-3 h-3 text-blue-500" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => {
                          setEditingItem(item);
                          setDeleteType('kategori');
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {kategoriList.length === 0 && (
              <div className="col-span-full text-center py-8 text-slate-500">
                Belum ada kategori
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Barang Dialog */}
      <Dialog open={showBarangDialog} onOpenChange={setShowBarangDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Barang' : 'Tambah Barang'}</DialogTitle>
            <DialogDescription>
              Isi form berikut untuk {editingItem ? 'mengubah' : 'menambahkan'} barang
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kode *</Label>
                <Input
                  value={barangForm.kode}
                  onChange={(e) => setBarangForm({ ...barangForm, kode: e.target.value })}
                  placeholder="BRG001"
                />
              </div>
              <div className="space-y-2">
                <Label>Nama *</Label>
                <Input
                  value={barangForm.nama}
                  onChange={(e) => setBarangForm({ ...barangForm, nama: e.target.value })}
                  placeholder="Nama barang"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={barangForm.kategoriId} onValueChange={(v) => setBarangForm({ ...barangForm, kategoriId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {kategoriList.map(k => (
                      <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Satuan *</Label>
                <Select value={barangForm.satuan} onValueChange={(v) => setBarangForm({ ...barangForm, satuan: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">Pcs</SelectItem>
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="liter">Liter</SelectItem>
                    <SelectItem value="meter">Meter</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Stok</Label>
                <Input
                  type="number"
                  value={barangForm.stok}
                  onChange={(e) => setBarangForm({ ...barangForm, stok: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Stok Min</Label>
                <Input
                  type="number"
                  value={barangForm.stokMin}
                  onChange={(e) => setBarangForm({ ...barangForm, stokMin: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Harga</Label>
                <Input
                  type="number"
                  value={barangForm.harga}
                  onChange={(e) => setBarangForm({ ...barangForm, harga: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lokasi</Label>
                <Input
                  value={barangForm.lokasi}
                  onChange={(e) => setBarangForm({ ...barangForm, lokasi: e.target.value })}
                  placeholder="Rak A-1"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={barangForm.status} onValueChange={(v) => setBarangForm({ ...barangForm, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="nonaktif">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Keterangan</Label>
              <Textarea
                value={barangForm.keterangan}
                onChange={(e) => setBarangForm({ ...barangForm, keterangan: e.target.value })}
                placeholder="Catatan..."
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBarangDialog(false)}>Batal</Button>
            <Button onClick={handleSaveBarang} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaksi Dialog */}
      <Dialog open={showTransaksiDialog} onOpenChange={setShowTransaksiDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Transaksi Barang</DialogTitle>
            <DialogDescription>
              Catat transaksi barang masuk atau keluar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jenis Transaksi</Label>
                <Select value={transaksiForm.jenis} onValueChange={(v) => setTransaksiForm({ ...transaksiForm, jenis: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masuk">Barang Masuk</SelectItem>
                    <SelectItem value="keluar">Barang Keluar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  value={transaksiForm.tanggal}
                  onChange={(e) => setTransaksiForm({ ...transaksiForm, tanggal: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Barang *</Label>
              <Select value={transaksiForm.barangId} onValueChange={(v) => {
                const barang = barangList.find(b => b.id === v);
                setTransaksiForm({ 
                  ...transaksiForm, 
                  barangId: v,
                  hargaSatuan: barang?.harga || 0
                });
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih barang" />
                </SelectTrigger>
                <SelectContent>
                  {barangList.filter(b => b.status === 'aktif').map(b => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.kode} - {b.nama} (Stok: {b.stok} {b.satuan})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jumlah *</Label>
                <Input
                  type="number"
                  value={transaksiForm.jumlah}
                  onChange={(e) => setTransaksiForm({ ...transaksiForm, jumlah: parseInt(e.target.value) || 0 })}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label>Harga Satuan</Label>
                <Input
                  type="number"
                  value={transaksiForm.hargaSatuan}
                  onChange={(e) => setTransaksiForm({ ...transaksiForm, hargaSatuan: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Referensi / No. Surat</Label>
              <Input
                value={transaksiForm.referensi}
                onChange={(e) => setTransaksiForm({ ...transaksiForm, referensi: e.target.value })}
                placeholder="No. surat jalan / faktur"
              />
            </div>
            
            {transaksiForm.jenis === 'masuk' ? (
              <div className="space-y-2">
                <Label>Pengirim</Label>
                <Input
                  value={transaksiForm.pengirim}
                  onChange={(e) => setTransaksiForm({ ...transaksiForm, pengirim: e.target.value })}
                  placeholder="Nama pengirim"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Penerima</Label>
                <Input
                  value={transaksiForm.penerima}
                  onChange={(e) => setTransaksiForm({ ...transaksiForm, penerima: e.target.value })}
                  placeholder="Nama penerima"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Keterangan</Label>
              <Textarea
                value={transaksiForm.keterangan}
                onChange={(e) => setTransaksiForm({ ...transaksiForm, keterangan: e.target.value })}
                placeholder="Catatan..."
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransaksiDialog(false)}>Batal</Button>
            <Button onClick={handleSaveTransaksi} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kategori Dialog */}
      <Dialog open={showKategoriDialog} onOpenChange={setShowKategoriDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Kategori *</Label>
              <Input
                value={kategoriForm.nama}
                onChange={(e) => setKategoriForm({ ...kategoriForm, nama: e.target.value })}
                placeholder="Nama kategori"
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                value={kategoriForm.deskripsi}
                onChange={(e) => setKategoriForm({ ...kategoriForm, deskripsi: e.target.value })}
                placeholder="Deskripsi kategori..."
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowKategoriDialog(false)}>Batal</Button>
            <Button onClick={handleSaveKategori} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus {deleteType === 'barang' ? 'Barang' : deleteType === 'kategori' ? 'Kategori' : 'Transaksi'}?</DialogTitle>
            <DialogDescription>
              {deleteType === 'transaksi' && 'Stok barang akan dikembalikan ke nilai sebelumnya.'}
              Data akan dihapus secara permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Batal</Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (deleteType === 'barang') {
                  handleDeleteBarang(editingItem.id);
                } else if (deleteType === 'kategori') {
                  handleDeleteKategori(editingItem.id);
                } else {
                  handleDeleteTransaksi(editingItem.id);
                }
              }}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
