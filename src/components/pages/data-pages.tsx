'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Search, Filter, Download, Upload, ChevronLeft, ChevronRight, GraduationCap, Users, Baby, FileSpreadsheet, Loader2, Check, Trash2, AlertTriangle } from 'lucide-react';
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
  
  // Import/Export states
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [clearingData, setClearingData] = useState(false);
  const [clearExisting, setClearExisting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const getTypeConfig = () => {
    switch (type) {
      case 'guru':
        return {
          title: 'Data Guru',
          icon: GraduationCap,
          color: 'text-emerald-500',
          gradient: 'from-emerald-500 to-teal-600',
          columns: ['Nama', 'JK', 'Sekolah', 'NUPTK', 'NIK', 'Alamat'],
          filterKey: 'sekolah',
        };
      case 'siswa':
        return {
          title: 'Data Siswa',
          icon: Users,
          color: 'text-cyan-500',
          gradient: 'from-cyan-500 to-blue-600',
          columns: ['Nama', 'JK', 'Jenjang', 'Nama Sekolah', 'Kelas', 'NISN'],
          filterKey: 'namaSekolah',
        };
      case 'posyandu':
        return {
          title: 'Data Posyandu',
          icon: Baby,
          color: 'text-pink-500',
          gradient: 'from-pink-500 to-rose-600',
          columns: ['Nama', 'JK', 'Posyandu', 'Kategori', 'Umur', 'Alamat'],
          filterKey: 'posyandu',
        };
    }
  };

  const config = getTypeConfig();

  const renderCell = (item: any, column: string) => {
    switch (column) {
      case 'Nama':
        return item.nama || '-';
      case 'JK':
        return (
          <Badge variant={item.jk === 'L' ? 'default' : 'secondary'} className="text-xs">
            {item.jk || '-'}
          </Badge>
        );
      case 'Sekolah':
        return item.sekolah || '-';
      case 'Nama Sekolah':
        return item.namaSekolah || '-';
      case 'NUPTK':
        return item.nuptk || '-';
      case 'NIK':
        return item.nik || '-';
      case 'Alamat':
        return item.alamat || '-';
      case 'Jenjang':
        return item.jenjang || '-';
      case 'Kelas':
        return item.kelas || '-';
      case 'NISN':
        return item.nisn || '-';
      case 'Posyandu':
        return item.posyandu || '-';
      case 'Kategori':
        return item.kategori ? (
          <Badge variant="outline" className="text-xs">{item.kategori}</Badge>
        ) : '-';
      case 'Umur':
        return item.umur || '-';
      default:
        return '-';
    }
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
        <div className="flex gap-2">
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

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Cari nama, NISN, NIK..."
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
                      <TableHead key={col}>{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={config.columns.length + 1} className="text-center py-8 text-slate-500">
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
                          <TableCell key={col} className="max-w-[200px] truncate">
                            {renderCell(item, col)}
                          </TableCell>
                        ))}
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
    </div>
  );
}
