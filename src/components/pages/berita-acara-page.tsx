'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  MapPin,
  Users,
  Edit,
  Trash2,
  Eye,
  Printer,
  Download,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface BeritaAcara {
  id: string;
  nomor: string;
  tanggal: string;
  judul: string;
  lokasi: string | null;
  peserta: string | null;
  uraian: string;
  kesimpulan: string | null;
  tindakLanjut: string | null;
  picNama: string | null;
  picJabatan: string | null;
  status: string;
  kategori: string | null;
  lampiran: string | null;
  createdAt: string;
  updatedAt: string;
}

const kategoriOptions = [
  { value: 'rapat', label: 'Rapat' },
  { value: 'pelatihan', label: 'Pelatihan' },
  { value: 'sosialisasi', label: 'Sosialisasi' },
  { value: 'pendampingan', label: 'Pendampingan' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'evaluasi', label: 'Evaluasi' },
  { value: 'lainnya', label: 'Lainnya' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft', color: 'bg-slate-100 text-slate-600', icon: Clock },
  { value: 'selesai', label: 'Selesai', color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle },
  { value: 'dibatalkan', label: 'Dibatalkan', color: 'bg-red-100 text-red-600', icon: XCircle },
];

export function BeritaAcaraPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BeritaAcara[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterKategori, setFilterKategori] = useState('all');
  
  // Dialog states
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BeritaAcara | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    nomor: '',
    tanggal: new Date().toISOString().split('T')[0],
    judul: '',
    lokasi: '',
    peserta: '',
    uraian: '',
    kesimpulan: '',
    tindakLanjut: '',
    picNama: '',
    picJabatan: '',
    status: 'draft',
    kategori: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/berita-acara');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch berita acara:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  // Generate nomor berita acara otomatis
  const generateNomor = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const count = data.length + 1;
    return `BA/${year}/${month}/${String(count).padStart(3, '0')}`;
  };

  const handleOpenForm = (item?: BeritaAcara) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        nomor: item.nomor,
        tanggal: new Date(item.tanggal).toISOString().split('T')[0],
        judul: item.judul,
        lokasi: item.lokasi || '',
        peserta: item.peserta || '',
        uraian: item.uraian,
        kesimpulan: item.kesimpulan || '',
        tindakLanjut: item.tindakLanjut || '',
        picNama: item.picNama || '',
        picJabatan: item.picJabatan || '',
        status: item.status,
        kategori: item.kategori || '',
      });
    } else {
      setSelectedItem(null);
      setFormData({
        nomor: generateNomor(),
        tanggal: new Date().toISOString().split('T')[0],
        judul: '',
        lokasi: '',
        peserta: '',
        uraian: '',
        kesimpulan: '',
        tindakLanjut: '',
        picNama: '',
        picJabatan: '',
        status: 'draft',
        kategori: '',
      });
    }
    setShowFormDialog(true);
  };

  const handleSave = async () => {
    if (!formData.judul || !formData.uraian) {
      toast.error('Judul dan uraian harus diisi');
      return;
    }

    try {
      setSaving(true);
      const url = selectedItem 
        ? `/api/berita-acara/${selectedItem.id}`
        : '/api/berita-acara';
      const method = selectedItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
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
      const res = await fetch(`/api/berita-acara/${selectedItem.id}`, {
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

  const handlePrint = (item: BeritaAcara) => {
    const printWindow = window.open('', '_blank', 'width=800,height=1000');
    if (!printWindow) {
      toast.error('Tidak dapat membuka jendela cetak');
      return;
    }

    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Berita Acara - ${item.nomor}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Times New Roman', serif; 
      padding: 40px;
      font-size: 14px;
      line-height: 1.6;
    }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px double #000; padding-bottom: 20px; }
    .header h1 { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
    .header h2 { font-size: 16px; font-weight: bold; }
    .nomor { text-align: left; margin-bottom: 20px; font-weight: bold; }
    .content { margin-bottom: 20px; }
    .content h3 { font-size: 14px; font-weight: bold; margin-bottom: 10px; text-decoration: underline; }
    .info-table { width: 100%; margin-bottom: 15px; }
    .info-table td { padding: 3px 0; vertical-align: top; }
    .info-table td:first-child { width: 120px; font-weight: bold; }
    .uraian { text-align: justify; margin-bottom: 15px; white-space: pre-wrap; }
    .signature-section { margin-top: 50px; display: flex; justify-content: space-between; }
    .signature-box { text-align: center; width: 200px; }
    .signature-line { border-top: 1px solid #000; margin-top: 60px; padding-top: 5px; }
    @media print {
      body { padding: 20px; }
      @page { margin: 1.5cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>BERITA ACARA</h1>
    <h2>${item.judul}</h2>
  </div>
  
  <div class="nomor">Nomor: ${item.nomor}</div>
  
  <div class="content">
    <table class="info-table">
      <tr><td>Hari/Tanggal</td><td>: ${new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
      <tr><td>Tempat</td><td>: ${item.lokasi || '-'}</td></tr>
      <tr><td>Peserta</td><td>: ${item.peserta || '-'}</td></tr>
      <tr><td>Kategori</td><td>: ${item.kategori || '-'}</td></tr>
    </table>
    
    <h3>Uraian Kegiatan:</h3>
    <div class="uraian">${item.uraian}</div>
    
    ${item.kesimpulan ? `<h3>Kesimpulan:</h3><div class="uraian">${item.kesimpulan}</div>` : ''}
    
    ${item.tindakLanjut ? `<h3>Tindak Lanjut:</h3><div class="uraian">${item.tindakLanjut}</div>` : ''}
  </div>
  
  <div class="signature-section">
    <div class="signature-box">
      <div>Mengetahui,</div>
      <div class="signature-line">________________</div>
    </div>
    <div class="signature-box">
      <div>${item.picJabatan || 'Yang Membuat,'}</div>
      <div class="signature-line">${item.picNama || '________________'}</div>
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
    const matchesSearch = item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.nomor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesKategori = filterKategori === 'all' || item.kategori === filterKategori;
    return matchesSearch && matchesStatus && matchesKategori;
  });

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(o => o.value === status);
    if (!option) return <Badge>Draft</Badge>;
    const Icon = option.icon;
    return (
      <Badge className={`${option.color} gap-1`}>
        <Icon className="w-3 h-3" />
        {option.label}
      </Badge>
    );
  };

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
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Berita Acara</h1>
            <p className="text-xs text-slate-500">Kelola dokumen berita acara kegiatan</p>
          </div>
        </div>
        <Button onClick={() => handleOpenForm()} className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600">
          <Plus className="w-4 h-4" />
          Buat Baru
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari judul atau nomor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
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
            <Select value={filterKategori} onValueChange={setFilterKategori}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {kategoriOptions.map(opt => (
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
                      <CardTitle className="text-sm font-semibold line-clamp-2">{item.judul}</CardTitle>
                      <CardDescription className="text-xs mt-1">{item.nomor}</CardDescription>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    {item.lokasi && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{item.lokasi}</span>
                      </div>
                    )}
                    {item.peserta && (
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" />
                        <span>{item.peserta}</span>
                      </div>
                    )}
                    {item.kategori && (
                      <Badge variant="outline" className="text-[10px]">
                        {kategoriOptions.find(k => k.value === item.kategori)?.label || item.kategori}
                      </Badge>
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
            <FileText className="w-16 h-16 text-slate-300 mb-4" />
            <p className="font-medium">Tidak ada data</p>
            <p className="text-sm">Belum ada berita acara yang dibuat</p>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Edit Berita Acara' : 'Buat Berita Acara Baru'}</DialogTitle>
            <DialogDescription>
              Isi form berikut untuk {selectedItem ? 'mengubah' : 'membuat'} berita acara
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nomor</Label>
                <Input
                  value={formData.nomor}
                  onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
                  placeholder="Nomor berita acara"
                />
              </div>
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Judul Kegiatan *</Label>
              <Input
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                placeholder="Judul kegiatan"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lokasi</Label>
                <Input
                  value={formData.lokasi}
                  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                  placeholder="Tempat kegiatan"
                />
              </div>
              <div className="space-y-2">
                <Label>Peserta</Label>
                <Input
                  value={formData.peserta}
                  onChange={(e) => setFormData({ ...formData, peserta: e.target.value })}
                  placeholder="Jumlah/atendees"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={formData.kategori} onValueChange={(v) => setFormData({ ...formData, kategori: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {kategoriOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            
            <div className="space-y-2">
              <Label>Uraian Kegiatan *</Label>
              <Textarea
                value={formData.uraian}
                onChange={(e) => setFormData({ ...formData, uraian: e.target.value })}
                placeholder="Deskripsi lengkap kegiatan..."
                rows={5}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Kesimpulan</Label>
              <Textarea
                value={formData.kesimpulan}
                onChange={(e) => setFormData({ ...formData, kesimpulan: e.target.value })}
                placeholder="Kesimpulan kegiatan..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tindak Lanjut</Label>
              <Textarea
                value={formData.tindakLanjut}
                onChange={(e) => setFormData({ ...formData, tindakLanjut: e.target.value })}
                placeholder="Rencana tindak lanjut..."
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama PIC</Label>
                <Input
                  value={formData.picNama}
                  onChange={(e) => setFormData({ ...formData, picNama: e.target.value })}
                  placeholder="Nama penanggung jawab"
                />
              </div>
              <div className="space-y-2">
                <Label>Jabatan PIC</Label>
                <Input
                  value={formData.picJabatan}
                  onChange={(e) => setFormData({ ...formData, picJabatan: e.target.value })}
                  placeholder="Jabatan"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-indigo-500 to-purple-600">
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
            <DialogTitle>{selectedItem?.judul}</DialogTitle>
            <DialogDescription>{selectedItem?.nomor}</DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Tanggal:</span>
                  <p className="font-medium">{new Date(selectedItem.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <span className="text-slate-500">Lokasi:</span>
                  <p className="font-medium">{selectedItem.lokasi || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Peserta:</span>
                  <p className="font-medium">{selectedItem.peserta || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Kategori:</span>
                  <p className="font-medium">{selectedItem.kategori || '-'}</p>
                </div>
              </div>
              
              <div>
                <span className="text-slate-500 text-sm">Uraian Kegiatan:</span>
                <p className="mt-1 text-sm whitespace-pre-wrap">{selectedItem.uraian}</p>
              </div>
              
              {selectedItem.kesimpulan && (
                <div>
                  <span className="text-slate-500 text-sm">Kesimpulan:</span>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selectedItem.kesimpulan}</p>
                </div>
              )}
              
              {selectedItem.tindakLanjut && (
                <div>
                  <span className="text-slate-500 text-sm">Tindak Lanjut:</span>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selectedItem.tindakLanjut}</p>
                </div>
              )}
              
              {(selectedItem.picNama || selectedItem.picJabatan) && (
                <div className="pt-4 border-t">
                  <span className="text-slate-500 text-sm">Penanggung Jawab:</span>
                  <p className="font-medium">{selectedItem.picNama} {selectedItem.picJabatan && `(${selectedItem.picJabatan})`}</p>
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
    </div>
  );
}
