'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { Plus, Pencil, Trash2, Baby, Heart, Users, UserCheck, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DistribusiPosyandu {
  id: string;
  namaPosyandu: string;
  balitaL: number;
  balitaP: number;
  bumilP: number;
  busuiP: number;
  lansiaL: number;
  lansiaP: number;
  wusP: number;
  jumlah: number;
  tanggal: Date;
  createdAt: Date;
}

interface PosyanduInfo {
  nama: string;
}

export function DistribusiPosyanduTab() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DistribusiPosyandu[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [posyanduList, setPosyanduList] = useState<PosyanduInfo[]>([]);
  const [loadingPosyanduData, setLoadingPosyanduData] = useState(false);

  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    namaPosyandu: '',
    balitaL: '',
    balitaP: '',
    bumilP: '',
    busuiP: '',
    lansiaL: '',
    lansiaP: '',
    wusP: '',
    tanggal: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
    fetchPosyanduList();
  }, [pagination.page]);

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/distribusi-posyandu?page=${page}&limit=${pagination.limit}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Gagal memuat data distribusi posyandu');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosyanduList = async () => {
    try {
      const res = await fetch('/api/posyandu');
      const result = await res.json();
      if (result.success) {
        // Get unique posyandu names
        const uniquePosyandu = [...new Set(result.posyandu?.map((p: { posyandu: string }) => p.posyandu).filter(Boolean))];
        setPosyanduList(uniquePosyandu.map((nama: string) => ({ nama })));
      }
    } catch (error) {
      console.error('Failed to fetch posyandu list:', error);
    }
  };

  // Fetch posyandu data for auto-fill
  const fetchPosyanduData = async (namaPosyandu: string) => {
    if (!namaPosyandu || isEditing) return;

    try {
      setLoadingPosyanduData(true);
      const encodedName = encodeURIComponent(namaPosyandu);
      const res = await fetch(`/api/posyandu-data/${encodedName}`);
      const result = await res.json();

      if (result.success && result.data) {
        const d = result.data;
        toast.success(`Data ditemukan: ${result.totalData} orang`);

        // Auto-fill form with fetched data
        setFormData(prev => ({
          ...prev,
          balitaL: d.balitaL?.toString() || '',
          balitaP: d.balitaP?.toString() || '',
          bumilP: d.bumilP?.toString() || '',
          busuiP: d.busuiP?.toString() || '',
          lansiaL: d.lansiaL?.toString() || '',
          lansiaP: d.lansiaP?.toString() || '',
          wusP: d.wusP?.toString() || '',
        }));
      } else {
        toast.info('Tidak ada data di database untuk posyandu ini');
      }
    } catch (error) {
      console.error('Failed to fetch posyandu data:', error);
    } finally {
      setLoadingPosyanduData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.namaPosyandu) {
      toast.error('Nama posyandu harus diisi');
      return;
    }

    try {
      const url = isEditing ? `/api/distribusi-posyandu/${editingId}` : '/api/distribusi-posyandu';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        setIsDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Gagal menyimpan data');
    }
  };

  const handleEdit = (item: DistribusiPosyandu) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormData({
      namaPosyandu: item.namaPosyandu,
      balitaL: item.balitaL.toString(),
      balitaP: item.balitaP.toString(),
      bumilP: item.bumilP.toString(),
      busuiP: item.busuiP.toString(),
      lansiaL: item.lansiaL.toString(),
      lansiaP: item.lansiaP.toString(),
      wusP: item.wusP.toString(),
      tanggal: new Date(item.tanggal).toISOString().split('T')[0],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;

    try {
      const res = await fetch(`/api/distribusi-posyandu/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      toast.error('Gagal menghapus data');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      namaPosyandu: '',
      balitaL: '',
      balitaP: '',
      bumilP: '',
      busuiP: '',
      lansiaL: '',
      lansiaP: '',
      wusP: '',
      tanggal: new Date().toISOString().split('T')[0],
    });
  };

  const calculateFormTotal = () => {
    return (
      (parseInt(formData.balitaL) || 0) +
      (parseInt(formData.balitaP) || 0) +
      (parseInt(formData.bumilP) || 0) +
      (parseInt(formData.busuiP) || 0) +
      (parseInt(formData.lansiaL) || 0) +
      (parseInt(formData.lansiaP) || 0) +
      (parseInt(formData.wusP) || 0)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">Data distribusi makanan untuk 10 posyandu</p>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} size="sm">
          <Plus className="w-4 h-4 mr-2" />Tambah Data
        </Button>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full" style={{ minWidth: '800px' }}>
              <TableHeader>
                <TableRow className="bg-slate-100 dark:bg-slate-800">
                  <TableHead rowSpan={2} className="sticky-col border text-center align-middle bg-slate-200 dark:bg-slate-700 w-[50px]">No</TableHead>
                  <TableHead rowSpan={2} className="sticky-col-2 border text-center align-middle bg-slate-200 dark:bg-slate-700 w-[150px]">Nama Posyandu</TableHead>
                  <TableHead colSpan={2} className="border text-center bg-pink-100 dark:bg-pink-900/30">
                    <div className="flex items-center justify-center gap-1">
                      <Baby className="w-4 h-4" /> Balita
                    </div>
                  </TableHead>
                  <TableHead className="border text-center bg-purple-100 dark:bg-purple-900/30">
                    <div className="flex items-center justify-center gap-1">
                      <Heart className="w-4 h-4" /> Ibu Hamil
                    </div>
                  </TableHead>
                  <TableHead className="border text-center bg-cyan-100 dark:bg-cyan-900/30">
                    <div className="flex items-center justify-center gap-1">
                      <Heart className="w-4 h-4" /> Ibu Menyusui
                    </div>
                  </TableHead>
                  <TableHead colSpan={2} className="border text-center bg-amber-100 dark:bg-amber-900/30">
                    <div className="flex items-center justify-center gap-1">
                      <UserCheck className="w-4 h-4" /> Lansia
                    </div>
                  </TableHead>
                  <TableHead className="border text-center bg-green-100 dark:bg-green-900/30">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-4 h-4" /> WUS
                    </div>
                  </TableHead>
                  <TableHead rowSpan={2} className="border text-center align-middle bg-emerald-100 dark:bg-emerald-900/30 font-bold">Jumlah</TableHead>
                  <TableHead rowSpan={2} className="border text-center align-middle bg-slate-200 dark:bg-slate-700">Tanggal</TableHead>
                  <TableHead rowSpan={2} className="border text-center align-middle bg-slate-200 dark:bg-slate-700">Aksi</TableHead>
                </TableRow>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="border text-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 font-medium">L</TableHead>
                  <TableHead className="border text-center bg-pink-100 dark:bg-pink-900/30 text-pink-700 font-medium">P</TableHead>
                  <TableHead className="border text-center bg-pink-50 dark:bg-pink-900/20 text-pink-700 font-medium">P</TableHead>
                  <TableHead className="border text-center bg-pink-50 dark:bg-pink-900/20 text-pink-700 font-medium">P</TableHead>
                  <TableHead className="border text-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 font-medium">L</TableHead>
                  <TableHead className="border text-center bg-pink-100 dark:bg-pink-900/30 text-pink-700 font-medium">P</TableHead>
                  <TableHead className="border text-center bg-pink-50 dark:bg-pink-900/20 text-pink-700 font-medium">P</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8">Memuat data...</TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-slate-500">
                      Belum ada data distribusi posyandu
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <TableCell className="sticky-col border text-center bg-white dark:bg-slate-900">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </TableCell>
                      <TableCell className="sticky-col-2 border font-medium bg-white dark:bg-slate-900">
                        {item.namaPosyandu}
                      </TableCell>
                      <TableCell className="border text-center bg-blue-50 dark:bg-blue-900/20">{item.balitaL || '-'}</TableCell>
                      <TableCell className="border text-center bg-pink-50 dark:bg-pink-900/20">{item.balitaP || '-'}</TableCell>
                      <TableCell className="border text-center bg-purple-50 dark:bg-purple-900/20">{item.bumilP || '-'}</TableCell>
                      <TableCell className="border text-center bg-cyan-50 dark:bg-cyan-900/20">{item.busuiP || '-'}</TableCell>
                      <TableCell className="border text-center bg-blue-50 dark:bg-blue-900/20">{item.lansiaL || '-'}</TableCell>
                      <TableCell className="border text-center bg-pink-50 dark:bg-pink-900/20">{item.lansiaP || '-'}</TableCell>
                      <TableCell className="border text-center bg-green-50 dark:bg-green-900/20">{item.wusP || '-'}</TableCell>
                      <TableCell className="border text-center font-bold text-emerald-600">{item.jumlah}</TableCell>
                      <TableCell className="border text-center">
                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="border text-center">
                        <div className="flex gap-1 justify-center">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} title="Edit">
                            <Pencil className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} title="Hapus">
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
            <div className="flex justify-between items-center p-4 border-t">
              <span className="text-sm text-slate-500">
                Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} data
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchData(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchData(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Data Distribusi Posyandu' : 'Tambah Data Distribusi Posyandu'}</DialogTitle>
            <DialogDescription>
              Isi data distribusi untuk posyandu
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Posyandu</Label>
                <Select
                  value={formData.namaPosyandu}
                  onValueChange={(v) => {
                    setFormData({ ...formData, namaPosyandu: v });
                    fetchPosyanduData(v);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih posyandu" />
                  </SelectTrigger>
                  <SelectContent>
                    {posyanduList.map((p) => (
                      <SelectItem key={p.nama} value={p.nama}>
                        {p.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    value={!posyanduList.find((p) => p.nama === formData.namaPosyandu) ? formData.namaPosyandu : ''}
                    onChange={(e) => setFormData({ ...formData, namaPosyandu: e.target.value })}
                    onBlur={(e) => {
                      if (e.target.value) fetchPosyanduData(e.target.value);
                    }}
                    placeholder="Atau ketik nama posyandu"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fetchPosyanduData(formData.namaPosyandu)}
                    disabled={!formData.namaPosyandu || loadingPosyanduData}
                    title="Ambil data dari database"
                  >
                    {loadingPosyanduData ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>
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

            {/* Balita */}
            <div className="border rounded-lg p-3 bg-pink-50 dark:bg-pink-900/20">
              <Label className="font-bold flex items-center gap-2 mb-2">
                <Baby className="w-4 h-4" /> Balita (0-5 tahun)
              </Label>
              <div className="flex gap-2">
                <div>
                  <Label className="text-xs text-blue-600">Laki-laki</Label>
                  <Input
                    type="number"
                    placeholder="L"
                    value={formData.balitaL}
                    onChange={(e) => setFormData({ ...formData, balitaL: e.target.value })}
                    min="0"
                    className="w-24"
                  />
                </div>
                <div>
                  <Label className="text-xs text-pink-600">Perempuan</Label>
                  <Input
                    type="number"
                    placeholder="P"
                    value={formData.balitaP}
                    onChange={(e) => setFormData({ ...formData, balitaP: e.target.value })}
                    min="0"
                    className="w-24"
                  />
                </div>
              </div>
            </div>

            {/* Ibu Hamil */}
            <div className="border rounded-lg p-3 bg-purple-50 dark:bg-purple-900/20">
              <Label className="font-bold flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4" /> Ibu Hamil
              </Label>
              <div className="w-24">
                <Label className="text-xs text-pink-600">Jumlah</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.bumilP}
                  onChange={(e) => setFormData({ ...formData, bumilP: e.target.value })}
                  min="0"
                />
              </div>
            </div>

            {/* Ibu Menyusui */}
            <div className="border rounded-lg p-3 bg-cyan-50 dark:bg-cyan-900/20">
              <Label className="font-bold flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4" /> Ibu Menyusui
              </Label>
              <div className="w-24">
                <Label className="text-xs text-pink-600">Jumlah</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.busuiP}
                  onChange={(e) => setFormData({ ...formData, busuiP: e.target.value })}
                  min="0"
                />
              </div>
            </div>

            {/* Lansia */}
            <div className="border rounded-lg p-3 bg-amber-50 dark:bg-amber-900/20">
              <Label className="font-bold flex items-center gap-2 mb-2">
                <UserCheck className="w-4 h-4" /> Lansia (60+ tahun)
              </Label>
              <div className="flex gap-2">
                <div>
                  <Label className="text-xs text-blue-600">Laki-laki</Label>
                  <Input
                    type="number"
                    placeholder="L"
                    value={formData.lansiaL}
                    onChange={(e) => setFormData({ ...formData, lansiaL: e.target.value })}
                    min="0"
                    className="w-24"
                  />
                </div>
                <div>
                  <Label className="text-xs text-pink-600">Perempuan</Label>
                  <Input
                    type="number"
                    placeholder="P"
                    value={formData.lansiaP}
                    onChange={(e) => setFormData({ ...formData, lansiaP: e.target.value })}
                    min="0"
                    className="w-24"
                  />
                </div>
              </div>
            </div>

            {/* WUS */}
            <div className="border rounded-lg p-3 bg-green-50 dark:bg-green-900/20">
              <Label className="font-bold flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" /> WUS (Wanita Usia Subur 15-49 tahun)
              </Label>
              <div className="w-24">
                <Label className="text-xs text-pink-600">Jumlah</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.wusP}
                  onChange={(e) => setFormData({ ...formData, wusP: e.target.value })}
                  min="0"
                />
              </div>
            </div>

            {/* Total */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-bold">Total Jumlah:</span>
                <span className="text-xl font-bold text-emerald-600">{calculateFormTotal()}</span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit">
                {isEditing ? 'Simpan Perubahan' : 'Tambah Data'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
