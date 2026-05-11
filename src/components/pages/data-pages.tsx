'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search, Download, Upload, ChevronLeft, ChevronRight, GraduationCap, Users, Baby, FileSpreadsheet, Loader2, Check, Trash2, AlertTriangle, Edit, ChevronDown, ChevronUp, Maximize2, Minimize2
} from 'lucide-react';
import { toast } from 'sonner';

interface DataPageProps {
  type: 'guru' | 'siswa' | 'posyandu';
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Filters {
  schools?: string[];
  jenjang?: string[];
  sekolah?: string[];
  kategori?: string[];
  posyandu?: string[];
}

interface EditFormData {
  [key: string]: string;
}

export function DataPage({ type }: DataPageProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<Filters>({});
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<Record<string, string>>({});
  
  // UI State
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Import/Export states
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [clearingData, setClearingData] = useState(false);
  const [clearExisting, setClearExisting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Edit/Delete states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (search) params.append('search', search);
      
      Object.entries(selectedFilter).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });

      const res = await fetch(`/api/${type}?${params}`);
      const result = await res.json();
      
      if (result.success) {
        setData(result.data);
        setPagination(prev => ({ ...prev, total: result.pagination.total, totalPages: result.pagination.totalPages }));
        if (result.filters) {
          setFilters(result.filters);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [type, pagination.page, pagination.limit, search, selectedFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchData();
  };

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilter(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Export handler
  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(`/api/export?type=${type}&format=csv`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_data.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Data berhasil diekspor');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal mengekspor data');
    } finally {
      setExporting(false);
    }
  };

  // Import handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Pilih file terlebih dahulu');
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', type);
      formData.append('clearExisting', clearExisting.toString());

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setShowImportDialog(false);
        setSelectedFile(null);
        setClearExisting(false);
        fetchData();
      } else {
        toast.error(result.error || 'Gagal mengimpor data');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Gagal mengimpor data');
    } finally {
      setImporting(false);
    }
  };

  // Clear all data handler
  const handleClearAll = async () => {
    setClearingData(true);
    try {
      const response = await fetch(`/api/${type}/clear`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Semua data ${type} berhasil dihapus`);
        setShowClearDialog(false);
        fetchData();
      } else {
        toast.error(result.error || 'Gagal menghapus data');
      }
    } catch (error) {
      console.error('Clear error:', error);
      toast.error('Gagal menghapus data');
    } finally {
      setClearingData(false);
    }
  };

  // Edit handlers
  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setEditFormData({
      nama: item.nama || '',
      jk: item.jk || '',
      alamat: item.alamat || '',
      nik: item.nik || '',
      tempatLahir: item.tempatLahir || '',
      tanggalLahir: item.tanggalLahir || '',
      umur: item.umur || '',
      // Type specific fields
      ...(type === 'guru' && {
        sekolah: item.sekolah || '',
        nuptk: item.nuptk || '',
        jenisTendik: item.jenisTendik || '',
        nip: item.nip || '',
      }),
      ...(type === 'siswa' && {
        jenjang: item.jenjang || '',
        namaSekolah: item.namaSekolah || '',
        nisn: item.nisn || '',
        kelas: item.kelas || '',
      }),
      ...(type === 'posyandu' && {
        posyandu: item.posyandu || '',
        kategori: item.kategori || '',
      }),
    });
    setShowEditDialog(true);
  };

  const handleEditSubmit = async () => {
    if (!editingItem) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/${type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingItem.id, ...editFormData }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Data berhasil diperbarui');
        setShowEditDialog(false);
        setEditingItem(null);
        fetchData();
      } else {
        toast.error(result.error || 'Gagal memperbarui data');
      }
    } catch (error) {
      console.error('Edit error:', error);
      toast.error('Gagal memperbarui data');
    } finally {
      setSaving(false);
    }
  };

  // Delete handlers
  const openDeleteDialog = (item: any) => {
    setDeletingItem(item);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/${type}?id=${deletingItem.id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Data berhasil dihapus');
        setShowDeleteDialog(false);
        setDeletingItem(null);
        fetchData();
      } else {
        toast.error(result.error || 'Gagal menghapus data');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Gagal menghapus data');
    } finally {
      setDeleting(false);
    }
  };

  // Column configurations - ALL columns for each type
  const getTypeConfig = () => {
    switch (type) {
      case 'guru':
        return {
          title: 'Data Guru',
          icon: GraduationCap,
          color: 'text-emerald-500',
          gradient: 'from-emerald-500 to-teal-600',
          columns: [
            { key: 'nama', label: 'Nama' },
            { key: 'jk', label: 'JK' },
            { key: 'sekolah', label: 'Sekolah' },
            { key: 'nuptk', label: 'NUPTK' },
            { key: 'nik', label: 'NIK' },
            { key: 'nip', label: 'NIP' },
            { key: 'jenisTendik', label: 'Jenis Tendik' },
            { key: 'tempatLahir', label: 'Tempat Lahir' },
            { key: 'tanggalLahir', label: 'Tgl Lahir' },
            { key: 'umur', label: 'Umur' },
            { key: 'alamat', label: 'Alamat' },
          ],
          filterKey: 'sekolah',
          editFields: [
            { key: 'nama', label: 'Nama', type: 'text' },
            { key: 'jk', label: 'Jenis Kelamin', type: 'select', options: ['L', 'P'] },
            { key: 'sekolah', label: 'Sekolah', type: 'text' },
            { key: 'nuptk', label: 'NUPTK', type: 'text' },
            { key: 'nik', label: 'NIK', type: 'text' },
            { key: 'nip', label: 'NIP', type: 'text' },
            { key: 'jenisTendik', label: 'Jenis Tendik', type: 'text' },
            { key: 'tempatLahir', label: 'Tempat Lahir', type: 'text' },
            { key: 'tanggalLahir', label: 'Tanggal Lahir', type: 'text' },
            { key: 'umur', label: 'Umur', type: 'text' },
            { key: 'alamat', label: 'Alamat', type: 'textarea' },
          ],
        };
      case 'siswa':
        return {
          title: 'Data Siswa',
          icon: Users,
          color: 'text-cyan-500',
          gradient: 'from-cyan-500 to-blue-600',
          columns: [
            { key: 'nama', label: 'Nama' },
            { key: 'jk', label: 'JK' },
            { key: 'jenjang', label: 'Jenjang' },
            { key: 'namaSekolah', label: 'Nama Sekolah' },
            { key: 'kelas', label: 'Kelas' },
            { key: 'nisn', label: 'NISN' },
            { key: 'nik', label: 'NIK' },
            { key: 'tempatLahir', label: 'Tempat Lahir' },
            { key: 'tanggalLahir', label: 'Tgl Lahir' },
            { key: 'umur', label: 'Umur' },
            { key: 'alamat', label: 'Alamat' },
          ],
          filterKey: 'namaSekolah',
          editFields: [
            { key: 'nama', label: 'Nama', type: 'text' },
            { key: 'jk', label: 'Jenis Kelamin', type: 'select', options: ['L', 'P'] },
            { key: 'jenjang', label: 'Jenjang', type: 'text' },
            { key: 'namaSekolah', label: 'Nama Sekolah', type: 'text' },
            { key: 'kelas', label: 'Kelas', type: 'text' },
            { key: 'nisn', label: 'NISN', type: 'text' },
            { key: 'nik', label: 'NIK', type: 'text' },
            { key: 'tempatLahir', label: 'Tempat Lahir', type: 'text' },
            { key: 'tanggalLahir', label: 'Tanggal Lahir', type: 'text' },
            { key: 'umur', label: 'Umur', type: 'text' },
            { key: 'alamat', label: 'Alamat', type: 'textarea' },
          ],
        };
      case 'posyandu':
        return {
          title: 'Data Posyandu',
          icon: Baby,
          color: 'text-pink-500',
          gradient: 'from-pink-500 to-rose-600',
          columns: [
            { key: 'nama', label: 'Nama' },
            { key: 'jk', label: 'JK' },
            { key: 'posyandu', label: 'Posyandu' },
            { key: 'kategori', label: 'Kategori' },
            { key: 'nik', label: 'NIK' },
            { key: 'tempatLahir', label: 'Tempat Lahir' },
            { key: 'tanggalLahir', label: 'Tgl Lahir' },
            { key: 'umur', label: 'Umur' },
            { key: 'alamat', label: 'Alamat' },
          ],
          filterKey: 'posyandu',
          editFields: [
            { key: 'nama', label: 'Nama', type: 'text' },
            { key: 'jk', label: 'Jenis Kelamin', type: 'select', options: ['L', 'P'] },
            { key: 'posyandu', label: 'Posyandu', type: 'text' },
            { key: 'kategori', label: 'Kategori', type: 'text' },
            { key: 'nik', label: 'NIK', type: 'text' },
            { key: 'tempatLahir', label: 'Tempat Lahir', type: 'text' },
            { key: 'tanggalLahir', label: 'Tanggal Lahir', type: 'text' },
            { key: 'umur', label: 'Umur', type: 'text' },
            { key: 'alamat', label: 'Alamat', type: 'textarea' },
          ],
        };
    }
  };

  const config = getTypeConfig();

  const renderCell = (item: any, key: string) => {
    const value = item[key];
    if (value === null || value === undefined || value === '') return '-';
    
    if (key === 'jk') {
      return (
        <Badge variant={value === 'L' ? 'default' : 'secondary'} className="text-xs">
          {value}
        </Badge>
      );
    }
    
    if (key === 'kategori') {
      return <Badge variant="outline" className="text-xs">{value}</Badge>;
    }
    
    return value;
  };

  const getFilterOptions = () => {
    switch (type) {
      case 'guru':
        return (
          <>
            <Select value={selectedFilter.jk || 'all'} onValueChange={(v) => handleFilterChange('jk', v)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Jenis Kelamin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua JK</SelectItem>
                <SelectItem value="L">Laki-laki</SelectItem>
                <SelectItem value="P">Perempuan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedFilter.sekolah || 'all'} onValueChange={(v) => handleFilterChange('sekolah', v)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sekolah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Sekolah</SelectItem>
                {filters.schools?.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        );
      case 'siswa':
        return (
          <>
            <Select value={selectedFilter.jk || 'all'} onValueChange={(v) => handleFilterChange('jk', v)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Jenis Kelamin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua JK</SelectItem>
                <SelectItem value="L">Laki-laki</SelectItem>
                <SelectItem value="P">Perempuan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedFilter.jenjang || 'all'} onValueChange={(v) => handleFilterChange('jenjang', v)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Jenjang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenjang</SelectItem>
                {filters.jenjang?.map((j) => (
                  <SelectItem key={j} value={j}>{j}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedFilter.namaSekolah || 'all'} onValueChange={(v) => handleFilterChange('namaSekolah', v)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Nama Sekolah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Sekolah</SelectItem>
                {filters.sekolah?.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        );
      case 'posyandu':
        return (
          <>
            <Select value={selectedFilter.jk || 'all'} onValueChange={(v) => handleFilterChange('jk', v)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Jenis Kelamin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua JK</SelectItem>
                <SelectItem value="L">Laki-laki</SelectItem>
                <SelectItem value="P">Perempuan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedFilter.kategori || 'all'} onValueChange={(v) => handleFilterChange('kategori', v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {filters.kategori?.map((k) => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedFilter.posyandu || 'all'} onValueChange={(v) => handleFilterChange('posyandu', v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Posyandu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Posyandu</SelectItem>
                {filters.posyandu?.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
            <config.icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{config.title}</h1>
            <p className="text-sm text-slate-500">Total: {pagination.total.toLocaleString()} data</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="gap-2"
          >
            {isMinimized ? (
              <>
                <Maximize2 className="w-4 h-4" />
                Maximize
              </>
            ) : (
              <>
                <Minimize2 className="w-4 h-4" />
                Minimize
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportDialog(true)}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting || pagination.total === 0}
            className="gap-2"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export CSV
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowClearDialog(true)}
            disabled={pagination.total === 0}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Semua
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Filters */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Cari nama, NISN, NIK, Sekolah..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                      Cari
                    </Button>
                  </form>
                  <div className="flex flex-wrap gap-2">
                    {getFilterOptions()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-10" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                          <TableHead className="w-12 text-center">#</TableHead>
                          {config.columns.map((col) => (
                            <TableHead key={col.key} className="whitespace-nowrap">{col.label}</TableHead>
                          ))}
                          <TableHead className="w-28 text-center sticky right-0 bg-slate-50 dark:bg-slate-800/50">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={config.columns.length + 2} className="text-center py-8 text-slate-500">
                              <div className="flex flex-col items-center gap-2">
                                <FileSpreadsheet className="w-12 h-12 text-slate-300" />
                                <p>Tidak ada data ditemukan</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowImportDialog(true)}
                                  className="mt-2"
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  Import Data
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          data.map((item, index) => (
                            <motion.tr
                              key={item.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.02 }}
                              className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                            >
                              <TableCell className="text-center text-slate-400">
                                {(pagination.page - 1) * pagination.limit + index + 1}
                              </TableCell>
                              {config.columns.map((col) => (
                                <TableCell key={col.key} className="max-w-[200px] truncate">
                                  {renderCell(item, col.key)}
                                </TableCell>
                              ))}
                              <TableCell className="sticky right-0 bg-white dark:bg-slate-900">
                                <div className="flex gap-1 justify-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditDialog(item)}
                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openDeleteDialog(item)}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Menampilkan {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} data
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className={pagination.page === pageNum ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' : ''}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-500" />
              Import Data {config.title}
            </DialogTitle>
            <DialogDescription>
              Upload file CSV untuk mengimpor data. Format file harus sesuai dengan template.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="text-center">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600">
                    <Check className="w-4 h-4" />
                    <span className="font-medium">{selectedFile.name}</span>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">
                    Drag & drop atau klik untuk memilih file CSV
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3"
                >
                  Pilih File
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="clearExisting"
                checked={clearExisting}
                onCheckedChange={(checked) => setClearExisting(checked as boolean)}
              />
              <label
                htmlFor="clearExisting"
                className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                Hapus data lama sebelum import
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowImportDialog(false);
                setSelectedFile(null);
                setClearExisting(false);
              }}
            >
              Batal
            </Button>
            <Button
              onClick={handleImport}
              disabled={!selectedFile || importing}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengimpor...
                </>
              ) : (
                'Import'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Confirmation Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Hapus Semua Data
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus semua data {config.title}? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAll}
              disabled={clearingData}
            >
              {clearingData ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Semua
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-500" />
              Edit Data {config.title}
            </DialogTitle>
            <DialogDescription>
              Perbarui data pada formulir di bawah ini.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {config.editFields.map((field) => (
              <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <Label htmlFor={field.key} className="text-sm font-medium">
                  {field.label}
                </Label>
                {field.type === 'select' ? (
                  <Select
                    value={editFormData[field.key] || ''}
                    onValueChange={(v) => setEditFormData(prev => ({ ...prev, [field.key]: v }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={`Pilih ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-</SelectItem>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt === 'L' ? 'Laki-laki' : 'Perempuan'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'textarea' ? (
                  <Textarea
                    id={field.key}
                    value={editFormData[field.key] || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <Input
                    id={field.key}
                    type="text"
                    value={editFormData[field.key] || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="mt-1"
                  />
                )}
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Batal
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={saving}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
            >
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Hapus Data
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data <strong>{deletingItem?.nama}</strong>? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
