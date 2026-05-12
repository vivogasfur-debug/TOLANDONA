'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  PieChart as PieChartIcon, BarChart3, Plus, Pencil, Trash2,
  Download, FileText, FileSpreadsheet, FileType, Calendar, School,
  TrendingUp, Filter, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface Distribusi {
  id: string;
  namaSekolah: string;
  kategori: string;
  kelas: string;
  jumlah: number;
  total: number;
  tanggal: Date;
  createdAt: Date;
}

interface RekapData {
  namaSekolah: string;
  distribusi: Array<{
    kategori: string;
    kelas: string;
    jumlah: number;
    total: number;
    tanggal: Date;
  }>;
  totalJumlah: number;
  totalAll: number;
  byKategori: Record<string, { jumlah: number; total: number }>;
}

interface RekapResponse {
  rekap: RekapData[];
  filteredData: Distribusi[];
  grandTotal: { jumlah: number; total: number };
  byKategori: Record<string, { jumlah: number; total: number }>;
  years: number[];
  weeklySummary: Array<{ month: number; monthName: string; totalJumlah: number; totalAll: number; count: number }>;
  monthlySummary: Array<{ month: number; monthName: string; totalJumlah: number; totalAll: number; count: number }>;
  yearlySummary: Array<{ year: number; totalJumlah: number; totalAll: number; count: number }>;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

// Kategori options
const KATEGORI_OPTIONS = [
  { value: 'Siswa', label: 'Siswa' },
  { value: 'Guru', label: 'Guru' },
  { value: 'Uji Organoleptik', label: 'Uji Organoleptik' },
];

// Detect school level from name
function detectSchoolLevel(schoolName: string): string {
  const name = schoolName.toLowerCase();
  
  if (name.includes('tk') || name.includes('taman kanak-kanak') || name.includes('raudhatul athfal') || name.includes('ra ')) {
    return 'TK';
  }
  if (name.includes('paud') || name.includes('pendidikan anak usia dini')) {
    return 'PAUD';
  }
  if (name.includes('mi ') || name.includes('madrasah ibtidaiyah')) {
    return 'MI';
  }
  if (name.includes('sd ') || name.includes('sekolah dasar')) {
    return 'SD';
  }
  if (name.includes('mts ') || name.includes('madrasah tsanawiyah')) {
    return 'MTs';
  }
  if (name.includes('smp ') || name.includes('sekolah menengah pertama')) {
    return 'SMP';
  }
  if (name.includes('ma ') || name.includes('madrasah aliyah')) {
    return 'MA';
  }
  if (name.includes('smk ') || name.includes('sekolah menengah kejuruan')) {
    return 'SMK';
  }
  if (name.includes('sma ') || name.includes('sekolah menengah atas')) {
    return 'SMA';
  }
  
  return 'UNKNOWN';
}

// Get class options based on school level and category
function getKelasOptions(schoolLevel: string, kategori: string): string[] {
  // For Guru and Uji Organoleptik, show type options
  if (kategori === 'Guru') {
    return [
      'Kepala Sekolah',
      'Guru',
      'Tendik',
      'Non Tendik',
    ];
  }
  
  if (kategori === 'Uji Organoleptik') {
    return [
      'Uji Organoleptik',
    ];
  }
  
  // For Siswa, show class options based on school level
  switch (schoolLevel) {
    case 'TK':
    case 'PAUD':
      return ['Kelompok Bermain', 'TK A', 'TK B'];
    case 'SD':
    case 'MI':
      return ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];
    case 'SMP':
    case 'MTs':
      return ['Kelas 7', 'Kelas 8', 'Kelas 9'];
    case 'SMA':
    case 'SMK':
    case 'MA':
      return ['Kelas 10', 'Kelas 11', 'Kelas 12'];
    default:
      // Return all options for unknown school type
      return [
        'Kelompok Bermain', 'TK A', 'TK B',
        'Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6',
        'Kelas 7', 'Kelas 8', 'Kelas 9',
        'Kelas 10', 'Kelas 11', 'Kelas 12',
      ];
  }
}

// Get school level display name
function getSchoolLevelName(level: string): string {
  const names: Record<string, string> = {
    'TK': 'Taman Kanak-kanak',
    'PAUD': 'PAUD',
    'SD': 'Sekolah Dasar',
    'MI': 'Madrasah Ibtidaiyah',
    'SMP': 'Sekolah Menengah Pertama',
    'MTs': 'Madrasah Tsanawiyah',
    'SMA': 'Sekolah Menengah Atas',
    'SMK': 'Sekolah Menengah Kejuruan',
    'MA': 'Madrasah Aliyah',
    'UNKNOWN': 'Tidak Diketahui',
  };
  return names[level] || level;
}

export function DistribusiPage() {
  const [activeTab, setActiveTab] = useState('data');
  const [loading, setLoading] = useState(true);
  const [distribusiData, setDistribusiData] = useState<Distribusi[]>([]);
  const [rekapData, setRekapData] = useState<RekapResponse | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  
  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    namaSekolah: '',
    kategori: 'Siswa',
    kelas: '',
    jumlah: '',
    total: '',
    tanggal: new Date().toISOString().split('T')[0],
  });

  // Filter state
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterWeek, setFilterWeek] = useState(1);

  // Schools list from database
  const [schools, setSchools] = useState<string[]>([]);

  // Calculate school level and class options
  const schoolLevel = useMemo(() => detectSchoolLevel(formData.namaSekolah), [formData.namaSekolah]);
  const kelasOptions = useMemo(() => getKelasOptions(schoolLevel, formData.kategori), [schoolLevel, formData.kategori]);

  useEffect(() => {
    fetchDistribusi();
    fetchRekap();
    fetchSchools();
  }, []);

  useEffect(() => {
    fetchRekap();
  }, [filterPeriod, filterYear, filterMonth, filterWeek]);

  // Reset kelas when kategori or school changes
  useEffect(() => {
    if (kelasOptions.length > 0 && !kelasOptions.includes(formData.kelas)) {
      setFormData(prev => ({ ...prev, kelas: '' }));
    }
  }, [kelasOptions, formData.kelas]);

  const fetchDistribusi = async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/distribusi?page=${page}&limit=${pagination.limit}`);
      const data = await res.json();
      if (data.success) {
        setDistribusiData(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch distribusi:', error);
      toast.error('Gagal memuat data distribusi');
    } finally {
      setLoading(false);
    }
  };

  const fetchRekap = async () => {
    try {
      const params = new URLSearchParams({
        period: filterPeriod,
        year: filterYear.toString(),
        month: filterMonth.toString(),
        week: filterWeek.toString(),
      });
      const res = await fetch(`/api/distribusi/rekap?${params}`);
      const data = await res.json();
      if (data.success) {
        setRekapData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch rekap:', error);
    }
  };

  const fetchSchools = async () => {
    try {
      const res = await fetch('/api/sekolah');
      const data = await res.json();
      if (data.success) {
        setSchools(data.sekolah || []);
      }
    } catch (error) {
      console.error('Failed to fetch schools:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.namaSekolah || !formData.kategori || !formData.kelas || !formData.jumlah || !formData.total) {
      toast.error('Semua field harus diisi');
      return;
    }

    try {
      const url = isEditing ? `/api/distribusi/${editingId}` : '/api/distribusi';
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setIsDialogOpen(false);
        resetForm();
        fetchDistribusi();
        fetchRekap();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error saving distribusi:', error);
      toast.error('Gagal menyimpan data');
    }
  };

  const handleEdit = (item: Distribusi) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormData({
      namaSekolah: item.namaSekolah,
      kategori: item.kategori,
      kelas: item.kelas,
      jumlah: item.jumlah.toString(),
      total: item.total.toString(),
      tanggal: new Date(item.tanggal).toISOString().split('T')[0],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    
    try {
      const res = await fetch(`/api/distribusi/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchDistribusi();
        fetchRekap();
      }
    } catch (error) {
      console.error('Error deleting distribusi:', error);
      toast.error('Gagal menghapus data');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      namaSekolah: '',
      kategori: 'Siswa',
      kelas: '',
      jumlah: '',
      total: '',
      tanggal: new Date().toISOString().split('T')[0],
    });
  };

  const exportToCSV = () => {
    const headers = 'No,Sekolah,Kategori,Kelas,Jumlah,Total,Tanggal\n';
    const rows = distribusiData.map((d, i) => 
      `${i + 1},"${d.namaSekolah}","${d.kategori}","${d.kelas}",${d.jumlah},${d.total},"${new Date(d.tanggal).toLocaleDateString('id-ID')}"`
    ).join('\n');
    downloadFile(headers + rows, 'distribusi.csv', 'text/csv');
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !rekapData) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
            <PieChartIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Distribusi Data</h1>
            <p className="text-sm text-slate-500">Kelola data distribusi dan rekapitulasi</p>
          </div>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCSV}>
                <FileText className="w-4 h-4 mr-2" />Export CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />Tambah Data
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-2xl">
          <TabsTrigger value="data" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Data
          </TabsTrigger>
          <TabsTrigger value="hasil" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Hasil
          </TabsTrigger>
          <TabsTrigger value="mingguan" className="gap-2">
            <Calendar className="w-4 h-4" />
            Mingguan
          </TabsTrigger>
          <TabsTrigger value="bulanan" className="gap-2">
            <Calendar className="w-4 h-4" />
            Bulanan
          </TabsTrigger>
          <TabsTrigger value="tahunan" className="gap-2">
            <Calendar className="w-4 h-4" />
            Tahunan
          </TabsTrigger>
        </TabsList>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-6 mt-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Data Distribusi</CardTitle>
              <CardDescription>Daftar data distribusi yang telah diinput</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead>No</TableHead>
                      <TableHead>Nama Sekolah</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead className="text-center">Jumlah</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distribusiData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                          Belum ada data distribusi
                        </TableCell>
                      </TableRow>
                    ) : (
                      distribusiData.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{(pagination.page - 1) * pagination.limit + index + 1}</TableCell>
                          <TableCell className="font-medium">{item.namaSekolah}</TableCell>
                          <TableCell>
                            <Badge variant={item.kategori === 'Guru' ? 'default' : item.kategori === 'Uji Organoleptik' ? 'secondary' : 'outline'}>
                              {item.kategori}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.kelas}</TableCell>
                          <TableCell className="text-center">{item.jumlah}</TableCell>
                          <TableCell className="text-center font-bold">{item.total}</TableCell>
                          <TableCell>{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                              <Button size="icon" variant="ghost" onClick={() => handleEdit(item)}>
                                <Pencil className="w-4 h-4 text-blue-500" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => fetchDistribusi(pagination.page - 1)}
                  >
                    Sebelumnya
                  </Button>
                  <span className="flex items-center px-4">
                    Hal {pagination.page} dari {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => fetchDistribusi(pagination.page + 1)}
                  >
                    Selanjutnya
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hasil Tab (All Results) */}
        <TabsContent value="hasil" className="space-y-6 mt-6">
          {/* Summary by Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(rekapData?.byKategori || {}).map(([kategori, data]) => (
              <Card key={kategori} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{kategori}</p>
                      <p className="text-2xl font-bold">{data.total}</p>
                      <p className="text-xs text-slate-400">Jumlah: {data.jumlah}</p>
                    </div>
                    <Badge variant={kategori === 'Guru' ? 'default' : kategori === 'Uji Organoleptik' ? 'secondary' : 'outline'}>
                      {kategori}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Rekapitulasi Hasil Distribusi</CardTitle>
              <CardDescription>Ringkasan hasil distribusi per sekolah</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead>No</TableHead>
                      <TableHead>Nama Sekolah</TableHead>
                      <TableHead className="text-center">Siswa</TableHead>
                      <TableHead className="text-center">Guru</TableHead>
                      <TableHead className="text-center">Uji Org.</TableHead>
                      <TableHead className="text-center">Grand Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rekapData?.rekap.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          Tidak ada data
                        </TableCell>
                      </TableRow>
                    ) : (
                      rekapData?.rekap.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{item.namaSekolah}</TableCell>
                          <TableCell className="text-center">{item.byKategori['Siswa']?.total || 0}</TableCell>
                          <TableCell className="text-center">{item.byKategori['Guru']?.total || 0}</TableCell>
                          <TableCell className="text-center">{item.byKategori['Uji Organoleptik']?.total || 0}</TableCell>
                          <TableCell className="text-center font-bold text-emerald-600">{item.totalAll}</TableCell>
                        </TableRow>
                      ))
                    )}
                    {rekapData && rekapData.rekap.length > 0 && (
                      <TableRow className="bg-emerald-50 dark:bg-emerald-900/20 font-bold">
                        <TableCell colSpan={2}>TOTAL</TableCell>
                        <TableCell className="text-center">{rekapData.byKategori['Siswa']?.total || 0}</TableCell>
                        <TableCell className="text-center">{rekapData.byKategori['Guru']?.total || 0}</TableCell>
                        <TableCell className="text-center">{rekapData.byKategori['Uji Organoleptik']?.total || 0}</TableCell>
                        <TableCell className="text-center text-emerald-600">{rekapData.grandTotal.total}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mingguan Tab */}
        <TabsContent value="mingguan" className="space-y-6 mt-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Label>Tahun:</Label>
              <Select value={filterYear.toString()} onValueChange={(v) => setFilterYear(parseInt(v))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rekapData?.years.map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  )) || <SelectItem value={filterYear.toString()}>{filterYear}</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>Bulan:</Label>
              <Select value={filterMonth.toString()} onValueChange={(v) => setFilterMonth(parseInt(v))}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>Minggu:</Label>
              <Select value={filterWeek.toString()} onValueChange={(v) => setFilterWeek(parseInt(v))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(w => (
                    <SelectItem key={w} value={w.toString()}>Minggu {w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Rekapitulasi Mingguan</CardTitle>
              <CardDescription>
                Data distribusi Minggu {filterWeek} {MONTHS[filterMonth - 1]} {filterYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead>No</TableHead>
                      <TableHead>Nama Sekolah</TableHead>
                      <TableHead className="text-center">Siswa</TableHead>
                      <TableHead className="text-center">Guru</TableHead>
                      <TableHead className="text-center">Uji Org.</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rekapData?.rekap.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          Tidak ada data untuk periode ini
                        </TableCell>
                      </TableRow>
                    ) : (
                      rekapData?.rekap.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{item.namaSekolah}</TableCell>
                          <TableCell className="text-center">{item.byKategori['Siswa']?.total || 0}</TableCell>
                          <TableCell className="text-center">{item.byKategori['Guru']?.total || 0}</TableCell>
                          <TableCell className="text-center">{item.byKategori['Uji Organoleptik']?.total || 0}</TableCell>
                          <TableCell className="text-center font-bold text-emerald-600">{item.totalAll}</TableCell>
                        </TableRow>
                      ))
                    )}
                    {rekapData && rekapData.rekap.length > 0 && (
                      <TableRow className="bg-emerald-50 dark:bg-emerald-900/20 font-bold">
                        <TableCell colSpan={2}>TOTAL</TableCell>
                        <TableCell className="text-center">{rekapData.byKategori['Siswa']?.total || 0}</TableCell>
                        <TableCell className="text-center">{rekapData.byKategori['Guru']?.total || 0}</TableCell>
                        <TableCell className="text-center">{rekapData.byKategori['Uji Organoleptik']?.total || 0}</TableCell>
                        <TableCell className="text-center text-emerald-600">{rekapData.grandTotal.total}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulanan Tab */}
        <TabsContent value="bulanan" className="space-y-6 mt-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Label>Tahun:</Label>
              <Select value={filterYear.toString()} onValueChange={(v) => setFilterYear(parseInt(v))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rekapData?.years.map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  )) || <SelectItem value={filterYear.toString()}>{filterYear}</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Grafik Bulanan</CardTitle>
                <CardDescription>Tren distribusi tahun {filterYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={rekapData?.monthlySummary || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="monthName" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalAll" name="Total" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="count" name="Jumlah Transaksi" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Tabel Bulanan</CardTitle>
                <CardDescription>Ringkasan per bulan tahun {filterYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-80 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                        <TableHead>Bulan</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Transaksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rekapData?.monthlySummary.filter(m => m.count > 0).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.monthName}</TableCell>
                          <TableCell className="text-center font-bold text-emerald-600">{item.totalAll}</TableCell>
                          <TableCell className="text-center">{item.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tahunan Tab */}
        <TabsContent value="tahunan" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Grafik Tahunan</CardTitle>
                <CardDescription>Tren distribusi per tahun</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={rekapData?.yearlySummary || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="totalAll" name="Total" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="count" name="Jumlah Transaksi" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Tabel Tahunan</CardTitle>
                <CardDescription>Ringkasan per tahun</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead>Tahun</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Transaksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rekapData?.yearlySummary.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.year}</TableCell>
                        <TableCell className="text-center font-bold text-emerald-600">{item.totalAll}</TableCell>
                        <TableCell className="text-center">{item.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Data Distribusi' : 'Tambah Data Distribusi'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Perbarui data distribusi' : 'Masukkan data distribusi baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="namaSekolah">Nama Sekolah</Label>
              <Select value={formData.namaSekolah} onValueChange={(v) => setFormData({ ...formData, namaSekolah: v, kelas: '' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih sekolah" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Allow custom school input */}
              <Input
                value={!schools.includes(formData.namaSekolah) ? formData.namaSekolah : ''}
                onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value, kelas: '' })}
                placeholder="Atau ketik nama sekolah lain"
                className="mt-1"
              />
              {formData.namaSekolah && (
                <p className="text-xs text-slate-500">
                  Jenjang: {getSchoolLevelName(schoolLevel)}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Select value={formData.kategori} onValueChange={(v) => setFormData({ ...formData, kategori: v, kelas: '' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {KATEGORI_OPTIONS.map(k => (
                    <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="kelas">
                {formData.kategori === 'Guru' ? 'Jenis Tenaga' : 
                 formData.kategori === 'Uji Organoleptik' ? 'Kategori' : 'Kelas'}
              </Label>
              <Select value={formData.kelas} onValueChange={(v) => setFormData({ ...formData, kelas: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    formData.kategori === 'Guru' ? 'Pilih jenis tenaga' :
                    formData.kategori === 'Uji Organoleptik' ? 'Pilih kategori' :
                    'Pilih kelas'
                  } />
                </SelectTrigger>
                <SelectContent>
                  {kelasOptions.map(k => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.kategori === 'Siswa' && schoolLevel === 'UNKNOWN' && (
                <p className="text-xs text-amber-500">
                  Pilih nama sekolah terlebih dahulu untuk melihat pilihan kelas yang sesuai
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jumlah">Jumlah</Label>
                <Input
                  id="jumlah"
                  type="number"
                  value={formData.jumlah}
                  onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="total">Total</Label>
                <Input
                  id="total"
                  type="number"
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                id="tanggal"
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit">
                {isEditing ? 'Perbarui' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
