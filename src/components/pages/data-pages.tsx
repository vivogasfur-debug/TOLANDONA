'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  Search, Download, Upload, ChevronLeft, ChevronRight, GraduationCap, Users, Baby, FileSpreadsheet, Loader2, Check, Trash2, AlertTriangle, Edit, Plus
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
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [clearingData, setClearingData] = useState(false);
  const [clearExisting, setClearExisting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [exportFileName, setExportFileName] = useState('');

  // Add/Edit/Delete states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [formNama, setFormNama] = useState('');
  const [formJk, setFormJk] = useState('');
  const [formAlamat, setFormAlamat] = useState('');
  const [formNik, setFormNik] = useState('');
  const [formTempatLahir, setFormTempatLahir] = useState('');
  const [formTanggalLahir, setFormTanggalLahir] = useState('');
  const [formUmur, setFormUmur] = useState('');
  const [formSekolah, setFormSekolah] = useState('');
  const [formNuptk, setFormNuptk] = useState('');
  const [formJenisTendik, setFormJenisTendik] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formJenjang, setFormJenjang] = useState('');
  const [formNamaSekolah, setFormNamaSekolah] = useState('');
  const [formNisn, setFormNisn] = useState('');
  const [formKelas, setFormKelas] = useState('');
  const [formPosyandu, setFormPosyandu] = useState('');
  const [formKategori, setFormKategori] = useState('');

  const fetchData = useCallback(async (searchValue?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      
      // Use passed searchValue or current search state
      const currentSearch = searchValue !== undefined ? searchValue : search;
      if (currentSearch) params.append('search', currentSearch);
      
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
  }, [type, pagination.page, pagination.limit, selectedFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    // Pass current search value directly
    fetchData(search);
  };

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilter(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const openExportDialog = () => {
    // Set default filename based on type and current date
    const today = new Date().toISOString().split('T')[0];
    const searchSuffix = search ? `_cari_${search.replace(/\s+/g, '_')}` : '';
    setExportFileName(`${type}_data${searchSuffix}_${today}`);
    setShowExportDialog(true);
  };

  const handleExport = async () => {
    if (!exportFileName.trim()) {
      toast.error('Nama file tidak boleh kosong');
      return;
    }

    setExporting(true);
    try {
      // Build URL with search and filter parameters
      const params = new URLSearchParams();
      params.append('type', type);
      params.append('format', 'csv');
      if (search) params.append('search', search);
      
      // Add filters
      Object.entries(selectedFilter).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/export?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportFileName}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Data berhasil diekspor');
      setShowExportDialog(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal mengekspor data');
    } finally {
      setExporting(false);
    }
  };

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
      const formDataObj = new FormData();
      formDataObj.append('file', selectedFile);
      formDataObj.append('type', type);
      formDataObj.append('clearExisting', clearExisting.toString());

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formDataObj,
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

  const resetForm = () => {
    setFormNama('');
    setFormJk('');
    setFormAlamat('');
    setFormNik('');
    setFormTempatLahir('');
    setFormTanggalLahir('');
    setFormUmur('');
    setFormSekolah('');
    setFormNuptk('');
    setFormJenisTendik('');
    setFormNip('');
    setFormJenjang('');
    setFormNamaSekolah('');
    setFormNisn('');
    setFormKelas('');
    setFormPosyandu('');
    setFormKategori('');
  };

  const getFormData = () => {
    const baseData: Record<string, string | null> = {
      nama: formNama.trim() || null,
      jk: formJk || null,
      alamat: formAlamat.trim() || null,
      nik: formNik.trim() || null,
      tempatLahir: formTempatLahir.trim() || null,
      tanggalLahir: formTanggalLahir.trim() || null,
      umur: formUmur.trim() || null,
    };
    
    if (type === 'guru') {
      return {
        ...baseData,
        sekolah: formSekolah.trim() || null,
        nuptk: formNuptk.trim() || null,
        jenisTendik: formJenisTendik.trim() || null,
        nip: formNip.trim() || null,
      };
    } else if (type === 'siswa') {
      return {
        ...baseData,
        jenjang: formJenjang.trim() || null,
        namaSekolah: formNamaSekolah.trim() || null,
        nisn: formNisn.trim() || null,
        kelas: formKelas.trim() || null,
      };
    } else {
      return {
        ...baseData,
        posyandu: formPosyandu.trim() || null,
        kategori: formKategori.trim() || null,
      };
    }
  };

  // Fungsi untuk menghitung umur dari tanggal lahir
  const calculateAge = (tanggalLahir: string | null | undefined): string => {
    if (!tanggalLahir) return '-';
    
    try {
      // Parse tanggal lahir - bisa dalam format berbeda
      let birthDate: Date;
      
      // Coba format YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(tanggalLahir)) {
        birthDate = new Date(tanggalLahir);
      } 
      // Coba format DD/MM/YYYY atau DD-MM-YYYY
      else if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(tanggalLahir)) {
        const parts = tanggalLahir.split(/[\/\-]/);
        birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
      // Coba parse langsung
      else {
        birthDate = new Date(tanggalLahir);
      }
      
      // Validasi tanggal
      if (isNaN(birthDate.getTime())) return '-';
      
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age >= 0 ? `${age} tahun` : '-';
    } catch {
      return '-';
    }
  };

  // Fungsi untuk mengkonversi format tanggal ke YYYY-MM-DD untuk input date
  const convertToISODate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    
    try {
      // Jika sudah format YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }
      
      // Jika format DD/MM/YYYY atau DD-MM-YYYY
      if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(dateStr)) {
        const parts = dateStr.split(/[\/\-]/);
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
      }
      
      // Coba parse dengan Date object
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      
      return '';
    } catch {
      return '';
    }
  };

  const populateForm = (item: any) => {
    setFormNama(item.nama || '');
    setFormJk(item.jk || '');
    setFormAlamat(item.alamat || '');
    setFormNik(item.nik || '');
    setFormTempatLahir(item.tempatLahir || '');
    
    // Convert date to YYYY-MM-DD format for date input
    const isoDate = convertToISODate(item.tanggalLahir);
    setFormTanggalLahir(isoDate);
    
    // Set umur - if empty, calculate from tanggalLahir
    if (item.umur && item.umur !== '#ERROR!' && !String(item.umur).includes('ERROR')) {
      setFormUmur(item.umur);
    } else if (isoDate) {
      setFormUmur(calculateAge(isoDate));
    } else {
      setFormUmur('');
    }
    
    if (type === 'guru') {
      setFormSekolah(item.sekolah || '');
      setFormNuptk(item.nuptk || '');
      setFormJenisTendik(item.jenisTendik || '');
      setFormNip(item.nip || '');
    } else if (type === 'siswa') {
      setFormJenjang(item.jenjang || '');
      setFormNamaSekolah(item.namaSekolah || '');
      setFormNisn(item.nisn || '');
      setFormKelas(item.kelas || '');
    } else {
      setFormPosyandu(item.posyandu || '');
      setFormKategori(item.kategori || '');
    }
  };

  const openAddDialog = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleAddSubmit = async () => {
    if (!formNama.trim()) {
      toast.error('Nama wajib diisi');
      return;
    }

    setSaving(true);
    try {
      const formDataObj = getFormData();
      // Ensure nama is a string
      formDataObj.nama = formNama.trim();
      
      const response = await fetch(`/api/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataObj),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Data berhasil ditambahkan');
        setShowAddDialog(false);
        resetForm();
        fetchData();
      } else {
        toast.error(result.error || 'Gagal menambahkan data');
      }
    } catch (error) {
      console.error('Add error:', error);
      toast.error('Gagal menambahkan data');
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    populateForm(item);
    setShowEditDialog(true);
  };

  const handleEditSubmit = async () => {
    if (!editingItem) return;
    if (!formNama.trim()) {
      toast.error('Nama wajib diisi');
      return;
    }
    
    setSaving(true);
    try {
      const formDataObj = getFormData();
      // Ensure nama is a string
      formDataObj.nama = formNama.trim();
      
      const response = await fetch(`/api/${type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingItem.id, ...formDataObj }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Data berhasil diperbarui');
        setShowEditDialog(false);
        setEditingItem(null);
        resetForm();
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

  const getTypeConfig = () => {
    switch (type) {
      case 'guru':
        return {
          title: 'Data Guru',
          icon: GraduationCap,
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
        };
      case 'siswa':
        return {
          title: 'Data Siswa',
          icon: Users,
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
        };
      case 'posyandu':
        return {
          title: 'Data Posyandu',
          icon: Baby,
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
        };
    }
  };

  const config = getTypeConfig();

  const renderCell = (item: any, key: string) => {
    const value = item[key];
    
    if (key === 'umur') {
      // Jika umur sudah ada dan valid, tampilkan
      if (value && value !== '#ERROR!' && !String(value).includes('ERROR')) {
        return String(value);
      }
      // Jika tidak, hitung dari tanggal lahir
      return calculateAge(item.tanggalLahir);
    }
    
    if (value === null || value === undefined || value === '' || value === '#ERROR!') return '-';
    
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
    
    return String(value);
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

  const renderFormFields = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
      <div>
        <Label htmlFor="nama" className="text-sm font-medium">
          Nama <span className="text-red-500">*</span>
        </Label>
        <Input
          id="nama"
          type="text"
          value={formNama}
          onChange={(e) => setFormNama(e.target.value)}
          className="mt-1"
          placeholder="Masukkan nama"
        />
      </div>
      
      <div>
        <Label htmlFor="jk" className="text-sm font-medium">Jenis Kelamin</Label>
        <Select value={formJk || undefined} onValueChange={(v) => setFormJk(v === 'none' ? '' : v)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Pilih JK" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-</SelectItem>
            <SelectItem value="L">Laki-laki</SelectItem>
            <SelectItem value="P">Perempuan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type === 'guru' && (
        <>
          <div>
            <Label className="text-sm font-medium">Sekolah</Label>
            <Input type="text" value={formSekolah} onChange={(e) => setFormSekolah(e.target.value)} className="mt-1" placeholder="Masukkan sekolah" />
          </div>
          <div>
            <Label className="text-sm font-medium">NUPTK</Label>
            <Input type="text" value={formNuptk} onChange={(e) => setFormNuptk(e.target.value)} className="mt-1" placeholder="Masukkan NUPTK" />
          </div>
          <div>
            <Label className="text-sm font-medium">NIP</Label>
            <Input type="text" value={formNip} onChange={(e) => setFormNip(e.target.value)} className="mt-1" placeholder="Masukkan NIP" />
          </div>
          <div>
            <Label className="text-sm font-medium">Jenis Tendik</Label>
            <Input type="text" value={formJenisTendik} onChange={(e) => setFormJenisTendik(e.target.value)} className="mt-1" placeholder="Masukkan jenis tendik" />
          </div>
        </>
      )}

      {type === 'siswa' && (
        <>
          <div>
            <Label className="text-sm font-medium">Jenjang</Label>
            <Input type="text" value={formJenjang} onChange={(e) => setFormJenjang(e.target.value)} className="mt-1" placeholder="Masukkan jenjang" />
          </div>
          <div>
            <Label className="text-sm font-medium">Nama Sekolah</Label>
            <Input type="text" value={formNamaSekolah} onChange={(e) => setFormNamaSekolah(e.target.value)} className="mt-1" placeholder="Masukkan nama sekolah" />
          </div>
          <div>
            <Label className="text-sm font-medium">Kelas</Label>
            <Input type="text" value={formKelas} onChange={(e) => setFormKelas(e.target.value)} className="mt-1" placeholder="Masukkan kelas" />
          </div>
          <div>
            <Label className="text-sm font-medium">NISN</Label>
            <Input type="text" value={formNisn} onChange={(e) => setFormNisn(e.target.value)} className="mt-1" placeholder="Masukkan NISN" />
          </div>
        </>
      )}

      {type === 'posyandu' && (
        <>
          <div>
            <Label className="text-sm font-medium">Posyandu</Label>
            <Input type="text" value={formPosyandu} onChange={(e) => setFormPosyandu(e.target.value)} className="mt-1" placeholder="Masukkan posyandu" />
          </div>
          <div>
            <Label className="text-sm font-medium">Kategori</Label>
            <Input type="text" value={formKategori} onChange={(e) => setFormKategori(e.target.value)} className="mt-1" placeholder="Masukkan kategori" />
          </div>
        </>
      )}

      <div>
        <Label className="text-sm font-medium">NIK</Label>
        <Input type="text" value={formNik} onChange={(e) => setFormNik(e.target.value)} className="mt-1" placeholder="Masukkan NIK" />
      </div>
      <div>
        <Label className="text-sm font-medium">Tempat Lahir</Label>
        <Input type="text" value={formTempatLahir} onChange={(e) => setFormTempatLahir(e.target.value)} className="mt-1" placeholder="Masukkan tempat lahir" />
      </div>
      <div>
        <Label className="text-sm font-medium">Tanggal Lahir</Label>
        <Input 
          type="date" 
          value={formTanggalLahir} 
          onChange={(e) => {
            const newDate = e.target.value;
            setFormTanggalLahir(newDate);
            // Auto-calculate age when date changes
            if (newDate) {
              const calculatedAge = calculateAge(newDate);
              setFormUmur(calculatedAge);
            }
          }} 
          className="mt-1" 
        />
      </div>
      <div>
        <Label className="text-sm font-medium">Umur</Label>
        <Input 
          type="text" 
          value={formUmur} 
          onChange={(e) => setFormUmur(e.target.value)} 
          className="mt-1 bg-slate-50 dark:bg-slate-800" 
          placeholder="Otomatis dari tgl lahir" 
        />
        <p className="text-xs text-slate-500 mt-1">Dihitung otomatis dari tanggal lahir</p>
      </div>
      <div className="sm:col-span-2">
        <Label className="text-sm font-medium">Alamat</Label>
        <Textarea value={formAlamat} onChange={(e) => setFormAlamat(e.target.value)} className="mt-1" placeholder="Masukkan alamat" rows={2} />
      </div>
    </div>
  );

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
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={openAddDialog} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
            <Plus className="w-4 h-4" />
            Tambah Data
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)} className="gap-2">
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={openExportDialog} disabled={exporting || pagination.total === 0} className="gap-2">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export CSV
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setShowClearDialog(true)} disabled={pagination.total === 0} className="gap-2">
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
      <Card className="border-0 shadow-lg overflow-hidden">
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
                  <TableRow className="bg-slate-100 dark:bg-slate-800">
                    <TableHead className="w-12 text-center font-semibold">#</TableHead>
                    {config.columns.map((col) => (
                      <TableHead key={col.key} className="whitespace-nowrap font-semibold">{col.label}</TableHead>
                    ))}
                    <TableHead className="w-32 text-center font-semibold bg-slate-100 dark:bg-slate-800">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={config.columns.length + 2} className="text-center py-8 text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <FileSpreadsheet className="w-12 h-12 text-slate-300" />
                          <p>Tidak ada data ditemukan</p>
                          <Button onClick={openAddDialog} className="mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Data
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((item, index) => (
                      <TableRow key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <TableCell className="text-center text-slate-400">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </TableCell>
                        {config.columns.map((col) => (
                          <TableCell key={col.key} className="max-w-[200px] truncate">
                            {renderCell(item, col.key)}
                          </TableCell>
                        ))}
                        <TableCell>
                          <div className="flex gap-2 justify-center">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(item)} className="h-8 w-8 p-0 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700" title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openDeleteDialog(item)} className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" title="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
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
            <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1}>
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
            <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-500" />
              Tambah Data {config.title}
            </DialogTitle>
            <DialogDescription>Isi formulir di bawah ini untuk menambahkan data baru. Field dengan * wajib diisi.</DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Batal</Button>
            <Button onClick={handleAddSubmit} disabled={saving} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              {saving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menyimpan...</>) : (<><Plus className="w-4 h-4 mr-2" />Tambah</>)}
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
            <DialogDescription>Perbarui data pada formulir di bawah ini. Field dengan * wajib diisi.</DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Batal</Button>
            <Button onClick={handleEditSubmit} disabled={saving} className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
              {saving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menyimpan...</>) : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Hapus Data
            </DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus data <strong>{deletingItem?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menghapus...</>) : (<><Trash2 className="w-4 h-4 mr-2" />Hapus</>)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-500" />
              Import Data {config.title}
            </DialogTitle>
            <DialogDescription>Upload file CSV untuk mengimpor data.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6">
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
              <div className="text-center">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600">
                    <Check className="w-4 h-4" />
                    <span className="font-medium">{selectedFile.name}</span>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">Klik untuk memilih file CSV</p>
                )}
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="mt-3">Pilih File</Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="clearExisting" checked={clearExisting} onCheckedChange={(checked) => setClearExisting(checked as boolean)} />
              <label htmlFor="clearExisting" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">Hapus data lama sebelum import</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowImportDialog(false); setSelectedFile(null); setClearExisting(false); }}>Batal</Button>
            <Button onClick={handleImport} disabled={!selectedFile || importing} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              {importing ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Mengimpor...</>) : 'Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-500" />
              Export Data {config.title}
            </DialogTitle>
            <DialogDescription>
              {search || Object.values(selectedFilter).some(v => v && v !== 'all') 
                ? `Akan mengekspor ${pagination.total} data sesuai filter/pencarian.`
                : `Akan mengekspor semua ${pagination.total} data.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Nama File</Label>
              <Input 
                type="text" 
                value={exportFileName} 
                onChange={(e) => setExportFileName(e.target.value)} 
                className="mt-1" 
                placeholder="Masukkan nama file"
              />
              <p className="text-xs text-slate-500 mt-1">File akan disimpan dengan ekstensi .csv</p>
            </div>
            {(search || Object.values(selectedFilter).some(v => v && v !== 'all')) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Filter aktif:</strong>
                </p>
                {search && <p className="text-xs text-blue-600 dark:text-blue-400">• Pencarian: "{search}"</p>}
                {Object.entries(selectedFilter).map(([key, value]) => (
                  value && value !== 'all' && (
                    <p key={key} className="text-xs text-blue-600 dark:text-blue-400">• {key}: {value}</p>
                  )
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>Batal</Button>
            <Button onClick={handleExport} disabled={exporting || !exportFileName.trim()} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              {exporting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Mengekspor...</>) : (<><Download className="w-4 h-4 mr-2" />Export</>)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Hapus Semua Data
            </DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus semua data {config.title}? Tindakan ini tidak dapat dibatalkan.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleClearAll} disabled={clearingData}>
              {clearingData ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menghapus...</>) : (<><Trash2 className="w-4 h-4 mr-2" />Hapus Semua</>)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
