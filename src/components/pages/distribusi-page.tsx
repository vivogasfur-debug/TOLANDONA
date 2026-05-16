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
  Download, FileText, FileSpreadsheet, FileType, Calendar,
  TrendingUp, Users, GraduationCap, Building2, RefreshCw, Loader2
} from 'lucide-react';
import { toast } from 'sonner';


interface Distribusi {
  id: string;
  namaSekolah: string;
  klsAL: number; klsAP: number; klsBL: number; klsBP: number;
  kls1L: number; kls1P: number; kls2L: number; kls2P: number;
  kls3L: number; kls3P: number; kls4L: number; kls4P: number;
  kls5L: number; kls5P: number; kls6L: number; kls6P: number;
  kls7L: number; kls7P: number; kls8L: number; kls8P: number;
  kls9L: number; kls9P: number; kls10L: number; kls10P: number;
  kls11L: number; kls11P: number; kls12L: number; kls12P: number;
  kepsekL: number; kepsekP: number;
  guruL: number; guruP: number;
  tendikL: number; tendikP: number;
  nonTendikL: number; nonTendikP: number;
  ujiOrganoleptik: number;
  jumlah: number;
  tanggal: Date;
  createdAt: Date;
}

interface SchoolInfo {
  nama: string;
  tipe: 'TK' | 'SD' | 'SMP' | 'SMA' | 'UNKNOWN';
}

interface RekapResponse {
  filteredData: Distribusi[];
  totals: {
    siswa: Record<string, { L: number; P: number }>;
    guru: Record<string, { L: number; P: number }>;
    ujiOrganoleptik: number;
    jumlah: number;
  };
  years: number[];
  monthlySummary: Array<{ month: number; monthName: string; jumlah: number; count: number }>;
  yearlySummary: Array<{ year: number; jumlah: number; count: number }>;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Function to detect school type from name
function detectSchoolType(name: string): 'TK' | 'SD' | 'SMP' | 'SMA' | 'UNKNOWN' {
  const lowerName = name.toLowerCase();
  
  // TK/PAUD/RA detection
  if (
    lowerName.includes('tk ') || 
    lowerName.startsWith('tk') ||
    lowerName.includes(' paud') ||
    lowerName.startsWith('paud') ||
    lowerName.includes('ra ') ||
    lowerName.startsWith('ra') ||
    lowerName.includes('taman kanak-kanak') ||
    lowerName.includes('raudhatul athfal')
  ) {
    return 'TK';
  }
  
  // SD/MI detection
  if (
    lowerName.includes('sd ') ||
    lowerName.startsWith('sd') ||
    lowerName.includes(' sd') ||
    lowerName.includes('mi ') ||
    lowerName.startsWith('mi') ||
    lowerName.includes(' mi') ||
    lowerName.includes('sekolah dasar') ||
    lowerName.includes('madrasah ibtidaiyah')
  ) {
    return 'SD';
  }
  
  // SMP/MTs detection
  if (
    lowerName.includes('smp ') ||
    lowerName.startsWith('smp') ||
    lowerName.includes(' smp') ||
    lowerName.includes('mts ') ||
    lowerName.startsWith('mts') ||
    lowerName.includes(' mts') ||
    lowerName.includes('sekolah menengah pertama') ||
    lowerName.includes('madrasah tsanawiyah')
  ) {
    return 'SMP';
  }
  
  // SMA/SMK/MA detection
  if (
    lowerName.includes('sma ') ||
    lowerName.startsWith('sma') ||
    lowerName.includes(' sma') ||
    lowerName.includes('smk ') ||
    lowerName.startsWith('smk') ||
    lowerName.includes(' smk') ||
    lowerName.includes('ma ') ||
    lowerName.startsWith('ma') ||
    lowerName.includes(' ma ') ||
    lowerName.includes('sekolah menengah atas') ||
    lowerName.includes('sekolah menengah kejuruan') ||
    lowerName.includes('madrasah aliyah')
  ) {
    return 'SMA';
  }
  
  return 'UNKNOWN';
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
    // Siswa TK/PAUD
    klsAL: '', klsAP: '', klsBL: '', klsBP: '',
    // Siswa SD/MI
    kls1L: '', kls1P: '', kls2L: '', kls2P: '', kls3L: '', kls3P: '',
    kls4L: '', kls4P: '', kls5L: '', kls5P: '', kls6L: '', kls6P: '',
    // Siswa SMP/MTs
    kls7L: '', kls7P: '', kls8L: '', kls8P: '', kls9L: '', kls9P: '',
    // Siswa SMA/SMK/MA
    kls10L: '', kls10P: '', kls11L: '', kls11P: '', kls12L: '', kls12P: '',
    // Guru
    kepsekL: '', kepsekP: '', guruL: '', guruP: '',
    tendikL: '', tendikP: '', nonTendikL: '', nonTendikP: '',
    // Uji Organoleptik
    ujiOrganoleptik: '',
    tanggal: new Date().toISOString().split('T')[0],
  });

  // Filter state
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterWeek, setFilterWeek] = useState(1);
  
  // Harian (Daily) state
  const [harianDate, setHarianDate] = useState(new Date().toISOString().split('T')[0]);
  const [harianData, setHarianData] = useState<Distribusi[]>([]);
  const [harianLoading, setHarianLoading] = useState(false);

  // Schools list with type info
  const [schools, setSchools] = useState<SchoolInfo[]>([]);
  const [loadingSchoolData, setLoadingSchoolData] = useState(false);
  
  // Selected school type for dynamic form
  const selectedSchoolType = useMemo(() => {
    return detectSchoolType(formData.namaSekolah);
  }, [formData.namaSekolah]);

  useEffect(() => {
    fetchDistribusi();
    fetchRekap();
    fetchSchools();
    fetchHarianData();
  }, []);

  useEffect(() => {
    fetchRekap();
  }, [filterPeriod, filterYear, filterMonth, filterWeek]);
  
  // Fetch harian data when date changes
  useEffect(() => {
    fetchHarianData();
  }, [harianDate]);

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
  
  // Fetch data for specific date (harian)
  const fetchHarianData = async () => {
    try {
      setHarianLoading(true);
      const res = await fetch(`/api/distribusi?tanggal=${harianDate}&limit=1000`);
      const data = await res.json();
      if (data.success) {
        setHarianData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch harian data:', error);
    } finally {
      setHarianLoading(false);
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

  // Fetch school data (siswa & guru) for auto-fill
  const fetchSchoolData = async (namaSekolah: string) => {
    if (!namaSekolah || isEditing) return;
    
    try {
      setLoadingSchoolData(true);
      const encodedName = encodeURIComponent(namaSekolah);
      const res = await fetch(`/api/sekolah/${encodedName}`);
      const result = await res.json();
      
      if (result.success && result.data) {
        const d = result.data;
        const ujiMsg = d.ujiOrganoleptik > 0 ? `, ${d.ujiOrganoleptik} uji organoleptik` : '';
        toast.success(`Data ditemukan: ${d.totalSiswa} siswa, ${d.totalGuru} guru${ujiMsg}`);
        
        // Auto-fill form with fetched data
        setFormData(prev => ({
          ...prev,
          // TK/PAUD
          klsAL: d.klsAL?.toString() || prev.klsAL,
          klsAP: d.klsAP?.toString() || prev.klsAP,
          klsBL: d.klsBL?.toString() || prev.klsBL,
          klsBP: d.klsBP?.toString() || prev.klsBP,
          // SD/MI
          kls1L: d.kls1L?.toString() || prev.kls1L,
          kls1P: d.kls1P?.toString() || prev.kls1P,
          kls2L: d.kls2L?.toString() || prev.kls2L,
          kls2P: d.kls2P?.toString() || prev.kls2P,
          kls3L: d.kls3L?.toString() || prev.kls3L,
          kls3P: d.kls3P?.toString() || prev.kls3P,
          kls4L: d.kls4L?.toString() || prev.kls4L,
          kls4P: d.kls4P?.toString() || prev.kls4P,
          kls5L: d.kls5L?.toString() || prev.kls5L,
          kls5P: d.kls5P?.toString() || prev.kls5P,
          kls6L: d.kls6L?.toString() || prev.kls6L,
          kls6P: d.kls6P?.toString() || prev.kls6P,
          // SMP/MTs
          kls7L: d.kls7L?.toString() || prev.kls7L,
          kls7P: d.kls7P?.toString() || prev.kls7P,
          kls8L: d.kls8L?.toString() || prev.kls8L,
          kls8P: d.kls8P?.toString() || prev.kls8P,
          kls9L: d.kls9L?.toString() || prev.kls9L,
          kls9P: d.kls9P?.toString() || prev.kls9P,
          // SMA/SMK/MA
          kls10L: d.kls10L?.toString() || prev.kls10L,
          kls10P: d.kls10P?.toString() || prev.kls10P,
          kls11L: d.kls11L?.toString() || prev.kls11L,
          kls11P: d.kls11P?.toString() || prev.kls11P,
          kls12L: d.kls12L?.toString() || prev.kls12L,
          kls12P: d.kls12P?.toString() || prev.kls12P,
          // Guru
          kepsekL: d.kepsekL?.toString() || prev.kepsekL,
          kepsekP: d.kepsekP?.toString() || prev.kepsekP,
          guruL: d.guruL?.toString() || prev.guruL,
          guruP: d.guruP?.toString() || prev.guruP,
          tendikL: d.tendikL?.toString() || prev.tendikL,
          tendikP: d.tendikP?.toString() || prev.tendikP,
          nonTendikL: d.nonTendikL?.toString() || prev.nonTendikL,
          nonTendikP: d.nonTendikP?.toString() || prev.nonTendikP,
          // Uji Organoleptik
          ujiOrganoleptik: d.ujiOrganoleptik?.toString() || prev.ujiOrganoleptik,
        }));
      } else {
        toast.info('Tidak ada data siswa/guru di database untuk sekolah ini');
      }
    } catch (error) {
      console.error('Failed to fetch school data:', error);
    } finally {
      setLoadingSchoolData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.namaSekolah) {
      toast.error('Nama sekolah harus diisi');
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
      klsAL: item.klsAL.toString(), klsAP: item.klsAP.toString(),
      klsBL: item.klsBL.toString(), klsBP: item.klsBP.toString(),
      kls1L: item.kls1L.toString(), kls1P: item.kls1P.toString(),
      kls2L: item.kls2L.toString(), kls2P: item.kls2P.toString(),
      kls3L: item.kls3L.toString(), kls3P: item.kls3P.toString(),
      kls4L: item.kls4L.toString(), kls4P: item.kls4P.toString(),
      kls5L: item.kls5L.toString(), kls5P: item.kls5P.toString(),
      kls6L: item.kls6L.toString(), kls6P: item.kls6P.toString(),
      kls7L: item.kls7L.toString(), kls7P: item.kls7P.toString(),
      kls8L: item.kls8L.toString(), kls8P: item.kls8P.toString(),
      kls9L: item.kls9L.toString(), kls9P: item.kls9P.toString(),
      kls10L: item.kls10L.toString(), kls10P: item.kls10P.toString(),
      kls11L: item.kls11L.toString(), kls11P: item.kls11P.toString(),
      kls12L: item.kls12L.toString(), kls12P: item.kls12P.toString(),
      kepsekL: item.kepsekL.toString(), kepsekP: item.kepsekP.toString(),
      guruL: item.guruL.toString(), guruP: item.guruP.toString(),
      tendikL: item.tendikL.toString(), tendikP: item.tendikP.toString(),
      nonTendikL: item.nonTendikL.toString(), nonTendikP: item.nonTendikP.toString(),
      ujiOrganoleptik: item.ujiOrganoleptik.toString(),
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
      klsAL: '', klsAP: '', klsBL: '', klsBP: '',
      kls1L: '', kls1P: '', kls2L: '', kls2P: '', kls3L: '', kls3P: '',
      kls4L: '', kls4P: '', kls5L: '', kls5P: '', kls6L: '', kls6P: '',
      kls7L: '', kls7P: '', kls8L: '', kls8P: '', kls9L: '', kls9P: '',
      kls10L: '', kls10P: '', kls11L: '', kls11P: '', kls12L: '', kls12P: '',
      kepsekL: '', kepsekP: '', guruL: '', guruP: '',
      tendikL: '', tendikP: '', nonTendikL: '', nonTendikP: '',
      ujiOrganoleptik: '',
      tanggal: new Date().toISOString().split('T')[0],
    });
  };

  const exportToCSV = () => {
    const headers = 'No,Sekolah,Kls A L,Kls A P,Kls B L,Kls B P,Kls 1 L,Kls 1 P,Kls 2 L,Kls 2 P,Kls 3 L,Kls 3 P,Kls 4 L,Kls 4 P,Kls 5 L,Kls 5 P,Kls 6 L,Kls 6 P,Kls 7 L,Kls 7 P,Kls 8 L,Kls 8 P,Kls 9 L,Kls 9 P,Kls 10 L,Kls 10 P,Kls 11 L,Kls 11 P,Kls 12 L,Kls 12 P,Kepsek L,Kepsek P,Guru L,Guru P,Tendik L,Tendik P,Non Tendik L,Non Tendik P,Uji Org,Jumlah,Tanggal\n';
    const rows = distribusiData.map((d, i) => 
      `${i + 1},"${d.namaSekolah}",${d.klsAL},${d.klsAP},${d.klsBL},${d.klsBP},${d.kls1L},${d.kls1P},${d.kls2L},${d.kls2P},${d.kls3L},${d.kls3P},${d.kls4L},${d.kls4P},${d.kls5L},${d.kls5P},${d.kls6L},${d.kls6P},${d.kls7L},${d.kls7P},${d.kls8L},${d.kls8P},${d.kls9L},${d.kls9P},${d.kls10L},${d.kls10P},${d.kls11L},${d.kls11P},${d.kls12L},${d.kls12P},${d.kepsekL},${d.kepsekP},${d.guruL},${d.guruP},${d.tendikL},${d.tendikP},${d.nonTendikL},${d.nonTendikP},${d.ujiOrganoleptik},${d.jumlah},"${new Date(d.tanggal).toLocaleDateString('id-ID')}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'distribusi.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate form total
  const calculateFormTotal = () => {
    const siswa = 
      (parseInt(formData.klsAL) || 0) + (parseInt(formData.klsAP) || 0) +
      (parseInt(formData.klsBL) || 0) + (parseInt(formData.klsBP) || 0) +
      (parseInt(formData.kls1L) || 0) + (parseInt(formData.kls1P) || 0) +
      (parseInt(formData.kls2L) || 0) + (parseInt(formData.kls2P) || 0) +
      (parseInt(formData.kls3L) || 0) + (parseInt(formData.kls3P) || 0) +
      (parseInt(formData.kls4L) || 0) + (parseInt(formData.kls4P) || 0) +
      (parseInt(formData.kls5L) || 0) + (parseInt(formData.kls5P) || 0) +
      (parseInt(formData.kls6L) || 0) + (parseInt(formData.kls6P) || 0) +
      (parseInt(formData.kls7L) || 0) + (parseInt(formData.kls7P) || 0) +
      (parseInt(formData.kls8L) || 0) + (parseInt(formData.kls8P) || 0) +
      (parseInt(formData.kls9L) || 0) + (parseInt(formData.kls9P) || 0) +
      (parseInt(formData.kls10L) || 0) + (parseInt(formData.kls10P) || 0) +
      (parseInt(formData.kls11L) || 0) + (parseInt(formData.kls11P) || 0) +
      (parseInt(formData.kls12L) || 0) + (parseInt(formData.kls12P) || 0);
    
    const guru = 
      (parseInt(formData.kepsekL) || 0) + (parseInt(formData.kepsekP) || 0) +
      (parseInt(formData.guruL) || 0) + (parseInt(formData.guruP) || 0) +
      (parseInt(formData.tendikL) || 0) + (parseInt(formData.tendikP) || 0) +
      (parseInt(formData.nonTendikL) || 0) + (parseInt(formData.nonTendikP) || 0);
    
    return siswa + guru + (parseInt(formData.ujiOrganoleptik) || 0);
  };

  // Get school type label
  const getSchoolTypeLabel = (type: string) => {
    switch (type) {
      case 'TK': return 'TK/PAUD/RA';
      case 'SD': return 'SD/MI';
      case 'SMP': return 'SMP/MTs';
      case 'SMA': return 'SMA/SMK/MA';
      default: return 'Pilih Jenjang';
    }
  };

  // Render class input fields based on school type
  const renderClassFields = () => {
    const classInput = (label: string, lKey: string, pKey: string) => (
      <div className="col-span-2">
        <Label className="text-xs">{label}</Label>
        <div className="flex gap-1">
          <Input 
            type="number" 
            placeholder="L" 
            value={formData[lKey as keyof typeof formData] as string} 
            onChange={(e) => setFormData({...formData, [lKey]: e.target.value})} 
            className="w-16" 
            min="0" 
          />
          <Input 
            type="number" 
            placeholder="P" 
            value={formData[pKey as keyof typeof formData] as string} 
            onChange={(e) => setFormData({...formData, [pKey]: e.target.value})} 
            className="w-16" 
            min="0" 
          />
        </div>
      </div>
    );

    const allFields = (
      <>
        {/* TK/PAUD - Always shown */}
        <div className="col-span-full mb-2">
          <span className="text-sm font-medium text-pink-600">TK/PAUD/RA:</span>
        </div>
        {classInput('Kls A', 'klsAL', 'klsAP')}
        {classInput('Kls B', 'klsBL', 'klsBP')}
        
        {/* SD/MI */}
        <div className="col-span-full mb-2 mt-4">
          <span className="text-sm font-medium text-cyan-600">SD/MI:</span>
        </div>
        {[1,2,3,4,5,6].map(k => classInput(`Kls ${k}`, `kls${k}L`, `kls${k}P`))}
        
        {/* SMP/MTs */}
        <div className="col-span-full mb-2 mt-4">
          <span className="text-sm font-medium text-green-600">SMP/MTs:</span>
        </div>
        {[7,8,9].map(k => classInput(`Kls ${k}`, `kls${k}L`, `kls${k}P`))}
        
        {/* SMA/SMK/MA */}
        <div className="col-span-full mb-2 mt-4">
          <span className="text-sm font-medium text-purple-600">SMA/SMK/MA:</span>
        </div>
        {[10,11,12].map(k => classInput(`Kls ${k}`, `kls${k}L`, `kls${k}P`))}
      </>
    );

    switch (selectedSchoolType) {
      case 'TK':
        return (
          <>
            <div className="col-span-full mb-2">
              <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100">
                TK/PAUD/RA - Kelas A & B
              </Badge>
            </div>
            {classInput('Kls A', 'klsAL', 'klsAP')}
            {classInput('Kls B', 'klsBL', 'klsBP')}
          </>
        );
      case 'SD':
        return (
          <>
            <div className="col-span-full mb-2">
              <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100">
                SD/MI - Kelas 1-6
              </Badge>
            </div>
            {[1,2,3,4,5,6].map(k => classInput(`Kls ${k}`, `kls${k}L`, `kls${k}P`))}
          </>
        );
      case 'SMP':
        return (
          <>
            <div className="col-span-full mb-2">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                SMP/MTs - Kelas 7-9
              </Badge>
            </div>
            {[7,8,9].map(k => classInput(`Kls ${k}`, `kls${k}L`, `kls${k}P`))}
          </>
        );
      case 'SMA':
        return (
          <>
            <div className="col-span-full mb-2">
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                SMA/SMK/MA - Kelas 10-12
              </Badge>
            </div>
            {[10,11,12].map(k => classInput(`Kls ${k}`, `kls${k}L`, `kls${k}P`))}
          </>
        );
      default:
        return (
          <>
            <div className="col-span-full mb-2 p-3 bg-slate-100 rounded-lg">
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Pilih atau ketik nama sekolah terlebih dahulu untuk menampilkan pilihan kelas yang sesuai
              </p>
            </div>
          </>
        );
    }
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
            <h1 className="text-2xl font-bold">Rekapitulasi Distribusi Data</h1>
            <p className="text-sm text-slate-500">Kelola data distribusi siswa dan guru</p>
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
        <TabsList className="grid w-full grid-cols-6 max-w-3xl">
          <TabsTrigger value="data" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Data
          </TabsTrigger>
          <TabsTrigger value="harian" className="gap-2">
            <Calendar className="w-4 h-4" />
            Harian
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
            <CardContent className="p-0 relative">
              {/* Scroll navigation buttons */}
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b">
                <span className="text-xs text-slate-500">Geser tabel untuk melihat semua kolom</span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const container = document.getElementById('distribusi-table-scroll');
                      if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
                    }}
                    className="gap-1 h-7 text-xs"
                  >
                    ← Kiri
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const container = document.getElementById('distribusi-table-scroll');
                      if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
                    }}
                    className="gap-1 h-7 text-xs"
                  >
                    Kanan →
                  </Button>
                </div>
              </div>
              <div 
                id="distribusi-table-scroll"
                className="overflow-x-auto"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  msOverflowStyle: '-ms-autohiding-scrollbar'
                }}
              >
                <Table className="w-full" style={{ minWidth: '1600px' }}>
                    <TableHeader>
                      {/* Header Row 1 - Group Headers */}
                      <TableRow className="bg-slate-100 dark:bg-slate-800">
                        <TableHead rowSpan={3} className="sticky-col border text-center align-middle bg-slate-200 dark:bg-slate-700 w-[50px] min-w-[50px]">No</TableHead>
                        <TableHead rowSpan={3} className="sticky-col-2 border text-center align-middle bg-slate-200 dark:bg-slate-700 w-[200px] min-w-[200px]">Nama Sekolah</TableHead>
                        <TableHead colSpan={4} className="border text-center bg-pink-100 dark:bg-pink-900/30">TK/PAUD</TableHead>
                        <TableHead colSpan={12} className="border text-center bg-cyan-100 dark:bg-cyan-900/30">SD/MI</TableHead>
                        <TableHead colSpan={6} className="border text-center bg-green-100 dark:bg-green-900/30">SMP/MTs</TableHead>
                        <TableHead colSpan={6} className="border text-center bg-purple-100 dark:bg-purple-900/30">SMA/SMK/MA</TableHead>
                        <TableHead colSpan={8} className="border text-center bg-amber-100 dark:bg-amber-900/30">GURU</TableHead>
                        <TableHead rowSpan={3} className="border text-center align-middle bg-red-100 dark:bg-red-900/30 min-w-[60px]">Uji Org.</TableHead>
                        <TableHead rowSpan={3} className="border text-center align-middle bg-emerald-100 dark:bg-emerald-900/30 min-w-[60px]">Jumlah</TableHead>
                        <TableHead rowSpan={3} className="border text-center align-middle bg-slate-200 dark:bg-slate-700 min-w-[100px]">Tanggal</TableHead>
                        <TableHead rowSpan={3} className="border text-center align-middle bg-slate-200 dark:bg-slate-700 min-w-[80px]">Aksi</TableHead>
                      </TableRow>
                      {/* Header Row 2 - Class Names */}
                      <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                        {/* TK/PAUD */}
                        <TableHead colSpan={2} className="border text-center bg-pink-50 dark:bg-pink-900/20">Kls A</TableHead>
                        <TableHead colSpan={2} className="border text-center bg-pink-50 dark:bg-pink-900/20">Kls B</TableHead>
                        {/* SD/MI */}
                        <TableHead colSpan={2} className="border text-center bg-cyan-50 dark:bg-cyan-900/20">Kls 1</TableHead>
                        <TableHead colSpan={2} className="border text-center bg-cyan-50 dark:bg-cyan-900/20">Kls 2</TableHead>
                        <TableHead colSpan={2} className="border text-center bg-cyan-50 dark:bg-cyan-900/20">Kls 3</TableHead>
                        <TableHead colSpan={2} className="border text-center bg-cyan-50 dark:bg-cyan-900/20">Kls 4</TableHead>
                        <TableHead colSpan={2} className="border text-center bg-cyan-50 dark:bg-cyan-900/20">Kls 5</TableHead>
                        <TableHead colSpan={2} className="border text-center bg-cyan-50 dark:bg-cyan-900/20">Kls 6</TableHead>
                        {/* SMP/MTs */}
                        <TableHead colSpan={2} className="border text-center bg-green-50 dark:bg-green-900/20">Kls 7</TableHead>
                        <TableHead colSpan={2} className="border text-center bg-green-50 dark:bg-green-900/20">Kls 8</TableHead>
                        <TableHead colSpan={2} className="border text-center bg-green-50 dark:bg-green-900/20">Kls 9</TableHead>
                        {/* SMA/SMK/MA */}
                        <TableHead colSpan={2} className="border text-center bg-purple-50 dark:bg-purple-900/20">Kls 10</TableHead>
                        <TableHead colSpan={2} className="border text-center bg-purple-50 dark:bg-purple-900/20">Kls 11</TableHead>
                        <TableHead colSpan={2} className="border text-center bg-purple-50 dark:bg-purple-900/20">Kls 12</TableHead>
                        {/* Guru */}
                        <TableHead colSpan={2} className="border text-center bg-amber-50 dark:bg-amber-900/20">Kepsek</TableHead>
                        <TableHead colSpan={2} className="border text-center bg-amber-50 dark:bg-amber-900/20">Guru</TableHead>
                        <TableHead colSpan={2} className="border text-center bg-amber-50 dark:bg-amber-900/20">Tendik</TableHead>
                        <TableHead colSpan={2} className="border text-center bg-amber-50 dark:bg-amber-900/20">Non Tendik</TableHead>
                      </TableRow>
                      {/* Header Row 3 - Gender (L/P) */}
                      <TableRow className="bg-slate-100 dark:bg-slate-800/70">
                        {/* TK/PAUD - Kls A, Kls B */}
                        <TableHead className="border text-center w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">L</TableHead>
                        <TableHead className="border text-center w-8 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium">P</TableHead>
                        <TableHead className="border text-center w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">L</TableHead>
                        <TableHead className="border text-center w-8 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium">P</TableHead>
                        {/* SD/MI - Kls 1-6 */}
                        <TableHead className="border text-center w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">L</TableHead>
                        <TableHead className="border text-center w-8 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium">P</TableHead>
                        <TableHead className="border text-center w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">L</TableHead>
                        <TableHead className="border text-center w-8 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium">P</TableHead>
                        <TableHead className="border text-center w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">L</TableHead>
                        <TableHead className="border text-center w-8 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium">P</TableHead>
                        <TableHead className="border text-center w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">L</TableHead>
                        <TableHead className="border text-center w-8 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium">P</TableHead>
                        <TableHead className="border text-center w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">L</TableHead>
                        <TableHead className="border text-center w-8 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium">P</TableHead>
                        <TableHead className="border text-center w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">L</TableHead>
                        <TableHead className="border text-center w-8 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium">P</TableHead>
                        {/* SMP/MTs - Kls 7-9 */}
                        <TableHead className="border text-center w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">L</TableHead>
                        <TableHead className="border text-center w-8 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium">P</TableHead>
                        <TableHead className="border text-center w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">L</TableHead>
                        <TableHead className="border text-center w-8 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium">P</TableHead>
                        <TableHead className="border text-center w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">L</TableHead>
                        <TableHead className="border text-center w-8 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium">P</TableHead>
                        {/* SMA/SMK/MA - Kls 10-12 */}
                        <TableHead className="border text-center w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">L</TableHead>
                        <TableHead className="border text-center w-8 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium">P</TableHead>
                        <TableHead className="border text-center w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">L</TableHead>
                        <TableHead className="border text-center w-8 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium">P</TableHead>
                        <TableHead className="border text-center w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">L</TableHead>
                        <TableHead className="border text-center w-8 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium">P</TableHead>
                        {/* Guru */}
                        <TableHead className="border text-center w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">L</TableHead>
                        <TableHead className="border text-center w-8 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium">P</TableHead>
                        <TableHead className="border text-center w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">L</TableHead>
                        <TableHead className="border text-center w-8 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium">P</TableHead>
                        <TableHead className="border text-center w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">L</TableHead>
                        <TableHead className="border text-center w-8 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium">P</TableHead>
                        <TableHead className="border text-center w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">L</TableHead>
                        <TableHead className="border text-center w-8 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium">P</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {distribusiData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={39} className="text-center py-8 text-slate-500">
                            Belum ada data distribusi
                          </TableCell>
                        </TableRow>
                      ) : (
                        distribusiData.map((item, index) => (
                          <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableCell className="sticky-col border text-center bg-white dark:bg-slate-900">{(pagination.page - 1) * pagination.limit + index + 1}</TableCell>
                            <TableCell className="sticky-col-2 border font-medium bg-white dark:bg-slate-900">{item.namaSekolah}</TableCell>
                            {/* TK/PAUD */}
                            <TableCell className="border text-center bg-blue-50 dark:bg-blue-900/20">{item.klsAL || '-'}</TableCell>
                            <TableCell className="border text-center bg-pink-50 dark:bg-pink-900/20">{item.klsAP || '-'}</TableCell>
                            <TableCell className="border text-center bg-blue-50 dark:bg-blue-900/20">{item.klsBL || '-'}</TableCell>
                            <TableCell className="border text-center bg-pink-50 dark:bg-pink-900/20">{item.klsBP || '-'}</TableCell>
                            {/* SD/MI */}
                            <TableCell className="border text-center bg-blue-50 dark:bg-blue-900/20">{item.kls1L || '-'}</TableCell>
                            <TableCell className="border text-center bg-pink-50 dark:bg-pink-900/20">{item.kls1P || '-'}</TableCell>
                            <TableCell className="border text-center bg-blue-50 dark:bg-blue-900/20">{item.kls2L || '-'}</TableCell>
                            <TableCell className="border text-center bg-pink-50 dark:bg-pink-900/20">{item.kls2P || '-'}</TableCell>
                            <TableCell className="border text-center bg-blue-50 dark:bg-blue-900/20">{item.kls3L || '-'}</TableCell>
                            <TableCell className="border text-center bg-pink-50 dark:bg-pink-900/20">{item.kls3P || '-'}</TableCell>
                            <TableCell className="border text-center bg-blue-50 dark:bg-blue-900/20">{item.kls4L || '-'}</TableCell>
                            <TableCell className="border text-center bg-pink-50 dark:bg-pink-900/20">{item.kls4P || '-'}</TableCell>
                            <TableCell className="border text-center bg-blue-50 dark:bg-blue-900/20">{item.kls5L || '-'}</TableCell>
                            <TableCell className="border text-center bg-pink-50 dark:bg-pink-900/20">{item.kls5P || '-'}</TableCell>
                            <TableCell className="border text-center bg-blue-50 dark:bg-blue-900/20">{item.kls6L || '-'}</TableCell>
                            <TableCell className="border text-center bg-pink-50 dark:bg-pink-900/20">{item.kls6P || '-'}</TableCell>
                            {/* SMP/MTs */}
                            <TableCell className="border text-center bg-blue-50 dark:bg-blue-900/20">{item.kls7L || '-'}</TableCell>
                            <TableCell className="border text-center bg-pink-50 dark:bg-pink-900/20">{item.kls7P || '-'}</TableCell>
                            <TableCell className="border text-center bg-blue-50 dark:bg-blue-900/20">{item.kls8L || '-'}</TableCell>
                            <TableCell className="border text-center bg-pink-50 dark:bg-pink-900/20">{item.kls8P || '-'}</TableCell>
                            <TableCell className="border text-center bg-blue-50 dark:bg-blue-900/20">{item.kls9L || '-'}</TableCell>
                            <TableCell className="border text-center bg-pink-50 dark:bg-pink-900/20">{item.kls9P || '-'}</TableCell>
                            {/* SMA/SMK/MA */}
                            <TableCell className="border text-center bg-blue-50 dark:bg-blue-900/20">{item.kls10L || '-'}</TableCell>
                            <TableCell className="border text-center bg-pink-50 dark:bg-pink-900/20">{item.kls10P || '-'}</TableCell>
                            <TableCell className="border text-center bg-blue-50 dark:bg-blue-900/20">{item.kls11L || '-'}</TableCell>
                            <TableCell className="border text-center bg-pink-50 dark:bg-pink-900/20">{item.kls11P || '-'}</TableCell>
                            <TableCell className="border text-center bg-blue-50 dark:bg-blue-900/20">{item.kls12L || '-'}</TableCell>
                            <TableCell className="border text-center bg-pink-50 dark:bg-pink-900/20">{item.kls12P || '-'}</TableCell>
                            {/* Guru */}
                            <TableCell className="border text-center bg-blue-50 dark:bg-blue-900/20">{item.kepsekL || '-'}</TableCell>
                            <TableCell className="border text-center bg-pink-50 dark:bg-pink-900/20">{item.kepsekP || '-'}</TableCell>
                            <TableCell className="border text-center bg-blue-50 dark:bg-blue-900/20">{item.guruL || '-'}</TableCell>
                            <TableCell className="border text-center bg-pink-50 dark:bg-pink-900/20">{item.guruP || '-'}</TableCell>
                            <TableCell className="border text-center bg-blue-50 dark:bg-blue-900/20">{item.tendikL || '-'}</TableCell>
                            <TableCell className="border text-center bg-pink-50 dark:bg-pink-900/20">{item.tendikP || '-'}</TableCell>
                            <TableCell className="border text-center bg-blue-50 dark:bg-blue-900/20">{item.nonTendikL || '-'}</TableCell>
                            <TableCell className="border text-center bg-pink-50 dark:bg-pink-900/20">{item.nonTendikP || '-'}</TableCell>
                            {/* Uji Org & Jumlah */}
                            <TableCell className="border text-center">{item.ujiOrganoleptik || '-'}</TableCell>
                            <TableCell className="border text-center font-bold text-emerald-600">{item.jumlah}</TableCell>
                            <TableCell className="border text-center">{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
                            <TableCell className="border text-center">
                              <div className="flex justify-center gap-1">
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(item)}>
                                  <Pencil className="w-3 h-3 text-blue-500" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDelete(item.id)}>
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
            </CardContent>
          </Card>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
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
        </TabsContent>

        {/* Harian Tab - Daily View */}
        <TabsContent value="harian" className="space-y-4 mt-4">
          {/* Date Navigation */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const prev = new Date(harianDate);
                    prev.setDate(prev.getDate() - 1);
                    setHarianDate(prev.toISOString().split('T')[0]);
                  }}
                >
                  ← Sebelumnya
                </Button>
                
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-2">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                  <Input
                    type="date"
                    value={harianDate}
                    onChange={(e) => setHarianDate(e.target.value)}
                    className="border-0 bg-transparent font-semibold w-40"
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const next = new Date(harianDate);
                    next.setDate(next.getDate() + 1);
                    setHarianDate(next.toISOString().split('T')[0]);
                  }}
                >
                  Selanjutnya →
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setHarianDate(new Date().toISOString().split('T')[0])}
                >
                  Hari Ini
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Daily Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Total Sekolah</p>
                <p className="text-xl font-bold text-emerald-600">{harianData.length}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Total Siswa</p>
                <p className="text-xl font-bold text-cyan-600">
                  {harianData.reduce((sum, d) => 
                    sum + d.klsAL + d.klsAP + d.klsBL + d.klsBP +
                    d.kls1L + d.kls1P + d.kls2L + d.kls2P + d.kls3L + d.kls3P +
                    d.kls4L + d.kls4P + d.kls5L + d.kls5P + d.kls6L + d.kls6P +
                    d.kls7L + d.kls7P + d.kls8L + d.kls8P + d.kls9L + d.kls9P +
                    d.kls10L + d.kls10P + d.kls11L + d.kls11P + d.kls12L + d.kls12P, 0
                  ).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Total Guru</p>
                <p className="text-xl font-bold text-amber-600">
                  {harianData.reduce((sum, d) => 
                    sum + d.kepsekL + d.kepsekP + d.guruL + d.guruP + 
                    d.tendikL + d.tendikP + d.nonTendikL + d.nonTendikP, 0
                  ).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Grand Total</p>
                <p className="text-xl font-bold text-purple-600">
                  {harianData.reduce((sum, d) => sum + d.jumlah, 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Data Table */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                Data Distribusi - {new Date(harianDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </CardTitle>
              <CardDescription>
                {harianLoading ? 'Memuat data...' : `${harianData.length} sekolah`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {harianLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                </div>
              ) : harianData.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">Tidak ada data</p>
                  <p className="text-sm">Belum ada distribusi pada tanggal ini</p>
                </div>
              ) : (
                <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <Table className="w-full" style={{ minWidth: '800px' }}>
                    <TableHeader>
                      <TableRow className="bg-slate-100 dark:bg-slate-800">
                        <TableHead className="sticky-col border text-center w-12 bg-slate-200 dark:bg-slate-700">No</TableHead>
                        <TableHead className="sticky-col-2 border min-w-[200px] bg-slate-200 dark:bg-slate-700">Nama Sekolah</TableHead>
                        <TableHead className="border text-center bg-pink-50 dark:bg-pink-900/20">TK/PAUD</TableHead>
                        <TableHead className="border text-center bg-cyan-50 dark:bg-cyan-900/20">SD/MI</TableHead>
                        <TableHead className="border text-center bg-green-50 dark:bg-green-900/20">SMP</TableHead>
                        <TableHead className="border text-center bg-purple-50 dark:bg-purple-900/20">SMA</TableHead>
                        <TableHead className="border text-center bg-amber-50 dark:bg-amber-900/20">Guru</TableHead>
                        <TableHead className="border text-center bg-red-50 dark:bg-red-900/20">Uji Org</TableHead>
                        <TableHead className="border text-center bg-emerald-50 dark:bg-emerald-900/20 font-bold">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {harianData.map((item, index) => {
                        const tkTotal = item.klsAL + item.klsAP + item.klsBL + item.klsBP;
                        const sdTotal = item.kls1L + item.kls1P + item.kls2L + item.kls2P + 
                                      item.kls3L + item.kls3P + item.kls4L + item.kls4P + 
                                      item.kls5L + item.kls5P + item.kls6L + item.kls6P;
                        const smpTotal = item.kls7L + item.kls7P + item.kls8L + item.kls8P + item.kls9L + item.kls9P;
                        const smaTotal = item.kls10L + item.kls10P + item.kls11L + item.kls11P + item.kls12L + item.kls12P;
                        const guruTotal = item.kepsekL + item.kepsekP + item.guruL + item.guruP + 
                                        item.tendikL + item.tendikP + item.nonTendikL + item.nonTendikP;
                        
                        return (
                          <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableCell className="sticky-col border text-center text-slate-400 bg-white dark:bg-slate-900">{index + 1}</TableCell>
                            <TableCell className="sticky-col-2 border font-medium bg-white dark:bg-slate-900">{item.namaSekolah}</TableCell>
                            <TableCell className="border text-center bg-pink-50/50 dark:bg-pink-900/10">
                              {tkTotal > 0 ? tkTotal : '-'}
                            </TableCell>
                            <TableCell className="border text-center bg-cyan-50/50 dark:bg-cyan-900/10">
                              {sdTotal > 0 ? sdTotal : '-'}
                            </TableCell>
                            <TableCell className="border text-center bg-green-50/50 dark:bg-green-900/10">
                              {smpTotal > 0 ? smpTotal : '-'}
                            </TableCell>
                            <TableCell className="border text-center bg-purple-50/50 dark:bg-purple-900/10">
                              {smaTotal > 0 ? smaTotal : '-'}
                            </TableCell>
                            <TableCell className="border text-center bg-amber-50/50 dark:bg-amber-900/10">
                              {guruTotal > 0 ? guruTotal : '-'}
                            </TableCell>
                            <TableCell className="border text-center">{item.ujiOrganoleptik || '-'}</TableCell>
                            <TableCell className="border text-center font-bold text-emerald-600">{item.jumlah}</TableCell>
                          </TableRow>
                        );
                      })}
                      {/* Total Row */}
                      <TableRow className="bg-slate-200 dark:bg-slate-700 font-bold">
                        <TableCell colSpan={2} className="border text-right sticky-col sticky-col-2 bg-slate-200 dark:bg-slate-700">TOTAL</TableCell>
                        <TableCell className="border text-center bg-pink-100 dark:bg-pink-900/30">
                          {harianData.reduce((sum, d) => sum + d.klsAL + d.klsAP + d.klsBL + d.klsBP, 0)}
                        </TableCell>
                        <TableCell className="border text-center bg-cyan-100 dark:bg-cyan-900/30">
                          {harianData.reduce((sum, d) => sum + d.kls1L + d.kls1P + d.kls2L + d.kls2P + 
                            d.kls3L + d.kls3P + d.kls4L + d.kls4P + d.kls5L + d.kls5P + d.kls6L + d.kls6P, 0)}
                        </TableCell>
                        <TableCell className="border text-center bg-green-100 dark:bg-green-900/30">
                          {harianData.reduce((sum, d) => sum + d.kls7L + d.kls7P + d.kls8L + d.kls8P + d.kls9L + d.kls9P, 0)}
                        </TableCell>
                        <TableCell className="border text-center bg-purple-100 dark:bg-purple-900/30">
                          {harianData.reduce((sum, d) => sum + d.kls10L + d.kls10P + d.kls11L + d.kls11P + d.kls12L + d.kls12P, 0)}
                        </TableCell>
                        <TableCell className="border text-center bg-amber-100 dark:bg-amber-900/30">
                          {harianData.reduce((sum, d) => sum + d.kepsekL + d.kepsekP + d.guruL + d.guruP + 
                            d.tendikL + d.tendikP + d.nonTendikL + d.nonTendikP, 0)}
                        </TableCell>
                        <TableCell className="border text-center">
                          {harianData.reduce((sum, d) => sum + (d.ujiOrganoleptik || 0), 0)}
                        </TableCell>
                        <TableCell className="border text-center bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700">
                          {harianData.reduce((sum, d) => sum + d.jumlah, 0)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hasil Tab */}
        <TabsContent value="hasil" className="space-y-6 mt-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Rekapitulasi Hasil</CardTitle>
              <CardDescription>Ringkasan total distribusi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                  <p className="text-sm text-slate-500">Total Siswa</p>
                  <p className="text-2xl font-bold text-cyan-600">
                    {rekapData ? Object.values(rekapData.totals.siswa).reduce((sum, k) => sum + k.L + k.P, 0) : 0}
                  </p>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-sm text-slate-500">Total Guru</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {rekapData ? Object.values(rekapData.totals.guru).reduce((sum, k) => sum + k.L + k.P, 0) : 0}
                  </p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-slate-500">Uji Organoleptik</p>
                  <p className="text-2xl font-bold text-red-600">{rekapData?.totals.ujiOrganoleptik || 0}</p>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <p className="text-sm text-slate-500">Total Keseluruhan</p>
                  <p className="text-2xl font-bold text-emerald-600">{rekapData?.totals.jumlah || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
          
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Total Data</p>
                <p className="text-xl font-bold text-emerald-600">{rekapData?.filteredData.length || 0}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Total Siswa</p>
                <p className="text-xl font-bold text-cyan-600">
                  {rekapData ? Object.values(rekapData.totals.siswa).reduce((sum, k) => sum + k.L + k.P, 0).toLocaleString() : 0}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Total Guru</p>
                <p className="text-xl font-bold text-amber-600">
                  {rekapData ? Object.values(rekapData.totals.guru).reduce((sum, k) => sum + k.L + k.P, 0).toLocaleString() : 0}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Grand Total</p>
                <p className="text-xl font-bold text-purple-600">{(rekapData?.totals.jumlah || 0).toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Table */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-0 relative">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b">
                <span className="text-sm font-medium">Rekapitulasi Minggu {filterWeek} {MONTHS[filterMonth - 1]} {filterYear}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    const container = document.getElementById('mingguan-table-scroll');
                    if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
                  }} className="gap-1 h-7 text-xs">← Kiri</Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    const container = document.getElementById('mingguan-table-scroll');
                    if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
                  }} className="gap-1 h-7 text-xs">Kanan →</Button>
                </div>
              </div>
              <div id="mingguan-table-scroll" className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                <Table className="w-full" style={{ minWidth: '800px' }}>
                  <TableHeader>
                    <TableRow className="bg-slate-100 dark:bg-slate-800">
                      <TableHead className="sticky-col border text-center w-12 bg-slate-200 dark:bg-slate-700">No</TableHead>
                      <TableHead className="sticky-col-2 border min-w-[200px] bg-slate-200 dark:bg-slate-700">Nama Sekolah</TableHead>
                      <TableHead className="border text-center bg-pink-50 dark:bg-pink-900/20">TK/PAUD</TableHead>
                      <TableHead className="border text-center bg-cyan-50 dark:bg-cyan-900/20">SD/MI</TableHead>
                      <TableHead className="border text-center bg-green-50 dark:bg-green-900/20">SMP</TableHead>
                      <TableHead className="border text-center bg-purple-50 dark:bg-purple-900/20">SMA</TableHead>
                      <TableHead className="border text-center bg-amber-50 dark:bg-amber-900/20">Guru</TableHead>
                      <TableHead className="border text-center bg-red-50 dark:bg-red-900/20">Uji Org</TableHead>
                      <TableHead className="border text-center bg-emerald-50 dark:bg-emerald-900/20 font-bold">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rekapData?.filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-slate-500">Tidak ada data</TableCell>
                      </TableRow>
                    ) : (
                      rekapData?.filteredData.map((item, index) => {
                        const tkTotal = item.klsAL + item.klsAP + item.klsBL + item.klsBP;
                        const sdTotal = item.kls1L + item.kls1P + item.kls2L + item.kls2P + 
                                      item.kls3L + item.kls3P + item.kls4L + item.kls4P + 
                                      item.kls5L + item.kls5P + item.kls6L + item.kls6P;
                        const smpTotal = item.kls7L + item.kls7P + item.kls8L + item.kls8P + item.kls9L + item.kls9P;
                        const smaTotal = item.kls10L + item.kls10P + item.kls11L + item.kls11P + item.kls12L + item.kls12P;
                        const guruTotal = item.kepsekL + item.kepsekP + item.guruL + item.guruP + 
                                        item.tendikL + item.tendikP + item.nonTendikL + item.nonTendikP;
                        return (
                          <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableCell className="sticky-col border text-center bg-white dark:bg-slate-900">{index + 1}</TableCell>
                            <TableCell className="sticky-col-2 border font-medium bg-white dark:bg-slate-900">{item.namaSekolah}</TableCell>
                            <TableCell className="border text-center bg-pink-50/50 dark:bg-pink-900/10">{tkTotal || '-'}</TableCell>
                            <TableCell className="border text-center bg-cyan-50/50 dark:bg-cyan-900/10">{sdTotal || '-'}</TableCell>
                            <TableCell className="border text-center bg-green-50/50 dark:bg-green-900/10">{smpTotal || '-'}</TableCell>
                            <TableCell className="border text-center bg-purple-50/50 dark:bg-purple-900/10">{smaTotal || '-'}</TableCell>
                            <TableCell className="border text-center bg-amber-50/50 dark:bg-amber-900/10">{guruTotal || '-'}</TableCell>
                            <TableCell className="border text-center">{item.ujiOrganoleptik || '-'}</TableCell>
                            <TableCell className="border text-center font-bold text-emerald-600">{item.jumlah}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulanan" className="space-y-6 mt-6">
          {/* Year Filter */}
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
          
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Total Data</p>
                <p className="text-xl font-bold text-emerald-600">{rekapData?.filteredData.length || 0}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Total Siswa</p>
                <p className="text-xl font-bold text-cyan-600">
                  {rekapData ? Object.values(rekapData.totals.siswa).reduce((sum, k) => sum + k.L + k.P, 0).toLocaleString() : 0}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Total Guru</p>
                <p className="text-xl font-bold text-amber-600">
                  {rekapData ? Object.values(rekapData.totals.guru).reduce((sum, k) => sum + k.L + k.P, 0).toLocaleString() : 0}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Grand Total</p>
                <p className="text-xl font-bold text-purple-600">{(rekapData?.totals.jumlah || 0).toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Grafik Bulanan {filterYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={rekapData?.monthlySummary || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="monthName" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="jumlah" name="Total" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Table */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-0 relative">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b">
                <span className="text-sm font-medium">Data Bulanan {filterYear}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    const container = document.getElementById('bulanan-table-scroll');
                    if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
                  }} className="gap-1 h-7 text-xs">← Kiri</Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    const container = document.getElementById('bulanan-table-scroll');
                    if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
                  }} className="gap-1 h-7 text-xs">Kanan →</Button>
                </div>
              </div>
              <div id="bulanan-table-scroll" className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                <Table className="w-full" style={{ minWidth: '800px' }}>
                  <TableHeader>
                    <TableRow className="bg-slate-100 dark:bg-slate-800">
                      <TableHead className="sticky-col border text-center w-12 bg-slate-200 dark:bg-slate-700">No</TableHead>
                      <TableHead className="sticky-col-2 border min-w-[200px] bg-slate-200 dark:bg-slate-700">Nama Sekolah</TableHead>
                      <TableHead className="border text-center bg-pink-50 dark:bg-pink-900/20">TK/PAUD</TableHead>
                      <TableHead className="border text-center bg-cyan-50 dark:bg-cyan-900/20">SD/MI</TableHead>
                      <TableHead className="border text-center bg-green-50 dark:bg-green-900/20">SMP</TableHead>
                      <TableHead className="border text-center bg-purple-50 dark:bg-purple-900/20">SMA</TableHead>
                      <TableHead className="border text-center bg-amber-50 dark:bg-amber-900/20">Guru</TableHead>
                      <TableHead className="border text-center bg-red-50 dark:bg-red-900/20">Uji Org</TableHead>
                      <TableHead className="border text-center bg-emerald-50 dark:bg-emerald-900/20 font-bold">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rekapData?.filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-slate-500">Tidak ada data</TableCell>
                      </TableRow>
                    ) : (
                      rekapData?.filteredData.map((item, index) => {
                        const tkTotal = item.klsAL + item.klsAP + item.klsBL + item.klsBP;
                        const sdTotal = item.kls1L + item.kls1P + item.kls2L + item.kls2P + 
                                      item.kls3L + item.kls3P + item.kls4L + item.kls4P + 
                                      item.kls5L + item.kls5P + item.kls6L + item.kls6P;
                        const smpTotal = item.kls7L + item.kls7P + item.kls8L + item.kls8P + item.kls9L + item.kls9P;
                        const smaTotal = item.kls10L + item.kls10P + item.kls11L + item.kls11P + item.kls12L + item.kls12P;
                        const guruTotal = item.kepsekL + item.kepsekP + item.guruL + item.guruP + 
                                        item.tendikL + item.tendikP + item.nonTendikL + item.nonTendikP;
                        return (
                          <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableCell className="sticky-col border text-center bg-white dark:bg-slate-900">{index + 1}</TableCell>
                            <TableCell className="sticky-col-2 border font-medium bg-white dark:bg-slate-900">{item.namaSekolah}</TableCell>
                            <TableCell className="border text-center bg-pink-50/50 dark:bg-pink-900/10">{tkTotal || '-'}</TableCell>
                            <TableCell className="border text-center bg-cyan-50/50 dark:bg-cyan-900/10">{sdTotal || '-'}</TableCell>
                            <TableCell className="border text-center bg-green-50/50 dark:bg-green-900/10">{smpTotal || '-'}</TableCell>
                            <TableCell className="border text-center bg-purple-50/50 dark:bg-purple-900/10">{smaTotal || '-'}</TableCell>
                            <TableCell className="border text-center bg-amber-50/50 dark:bg-amber-900/10">{guruTotal || '-'}</TableCell>
                            <TableCell className="border text-center">{item.ujiOrganoleptik || '-'}</TableCell>
                            <TableCell className="border text-center font-bold text-emerald-600">{item.jumlah}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tahunan" className="space-y-6 mt-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Total Data</p>
                <p className="text-xl font-bold text-emerald-600">{rekapData?.filteredData.length || 0}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Total Siswa</p>
                <p className="text-xl font-bold text-cyan-600">
                  {rekapData ? Object.values(rekapData.totals.siswa).reduce((sum, k) => sum + k.L + k.P, 0).toLocaleString() : 0}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Total Guru</p>
                <p className="text-xl font-bold text-amber-600">
                  {rekapData ? Object.values(rekapData.totals.guru).reduce((sum, k) => sum + k.L + k.P, 0).toLocaleString() : 0}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Grand Total</p>
                <p className="text-xl font-bold text-purple-600">{(rekapData?.totals.jumlah || 0).toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Grafik Tahunan</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={rekapData?.yearlySummary || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="jumlah" name="Total" stroke="#10b981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Table */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-0 relative">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b">
                <span className="text-sm font-medium">Data Tahunan</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    const container = document.getElementById('tahunan-table-scroll');
                    if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
                  }} className="gap-1 h-7 text-xs">← Kiri</Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    const container = document.getElementById('tahunan-table-scroll');
                    if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
                  }} className="gap-1 h-7 text-xs">Kanan →</Button>
                </div>
              </div>
              <div id="tahunan-table-scroll" className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                <Table className="w-full" style={{ minWidth: '800px' }}>
                  <TableHeader>
                    <TableRow className="bg-slate-100 dark:bg-slate-800">
                      <TableHead className="sticky-col border text-center w-12 bg-slate-200 dark:bg-slate-700">No</TableHead>
                      <TableHead className="sticky-col-2 border min-w-[200px] bg-slate-200 dark:bg-slate-700">Nama Sekolah</TableHead>
                      <TableHead className="border text-center bg-pink-50 dark:bg-pink-900/20">TK/PAUD</TableHead>
                      <TableHead className="border text-center bg-cyan-50 dark:bg-cyan-900/20">SD/MI</TableHead>
                      <TableHead className="border text-center bg-green-50 dark:bg-green-900/20">SMP</TableHead>
                      <TableHead className="border text-center bg-purple-50 dark:bg-purple-900/20">SMA</TableHead>
                      <TableHead className="border text-center bg-amber-50 dark:bg-amber-900/20">Guru</TableHead>
                      <TableHead className="border text-center bg-red-50 dark:bg-red-900/20">Uji Org</TableHead>
                      <TableHead className="border text-center bg-emerald-50 dark:bg-emerald-900/20 font-bold">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rekapData?.filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-slate-500">Tidak ada data</TableCell>
                      </TableRow>
                    ) : (
                      rekapData?.filteredData.map((item, index) => {
                        const tkTotal = item.klsAL + item.klsAP + item.klsBL + item.klsBP;
                        const sdTotal = item.kls1L + item.kls1P + item.kls2L + item.kls2P + 
                                      item.kls3L + item.kls3P + item.kls4L + item.kls4P + 
                                      item.kls5L + item.kls5P + item.kls6L + item.kls6P;
                        const smpTotal = item.kls7L + item.kls7P + item.kls8L + item.kls8P + item.kls9L + item.kls9P;
                        const smaTotal = item.kls10L + item.kls10P + item.kls11L + item.kls11P + item.kls12L + item.kls12P;
                        const guruTotal = item.kepsekL + item.kepsekP + item.guruL + item.guruP + 
                                        item.tendikL + item.tendikP + item.nonTendikL + item.nonTendikP;
                        return (
                          <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableCell className="sticky-col border text-center bg-white dark:bg-slate-900">{index + 1}</TableCell>
                            <TableCell className="sticky-col-2 border font-medium bg-white dark:bg-slate-900">{item.namaSekolah}</TableCell>
                            <TableCell className="border text-center bg-pink-50/50 dark:bg-pink-900/10">{tkTotal || '-'}</TableCell>
                            <TableCell className="border text-center bg-cyan-50/50 dark:bg-cyan-900/10">{sdTotal || '-'}</TableCell>
                            <TableCell className="border text-center bg-green-50/50 dark:bg-green-900/10">{smpTotal || '-'}</TableCell>
                            <TableCell className="border text-center bg-purple-50/50 dark:bg-purple-900/10">{smaTotal || '-'}</TableCell>
                            <TableCell className="border text-center bg-amber-50/50 dark:bg-amber-900/10">{guruTotal || '-'}</TableCell>
                            <TableCell className="border text-center">{item.ujiOrganoleptik || '-'}</TableCell>
                            <TableCell className="border text-center font-bold text-emerald-600">{item.jumlah}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Data Distribusi' : 'Tambah Data Distribusi'}</DialogTitle>
            <DialogDescription>
              Isi data distribusi siswa dan guru
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Sekolah</Label>
                <Select 
                  value={formData.namaSekolah} 
                  onValueChange={(v) => {
                    setFormData({ ...formData, namaSekolah: v });
                    // Auto-fetch school data when school is selected
                    fetchSchoolData(v);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih sekolah" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map(s => (
                      <SelectItem key={s.nama} value={s.nama}>
                        {s.nama} {s.tipe !== 'UNKNOWN' && `(${s.tipe})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    value={!schools.find(s => s.nama === formData.namaSekolah) ? formData.namaSekolah : ''}
                    onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                    onBlur={(e) => {
                      if (e.target.value) fetchSchoolData(e.target.value);
                    }}
                    placeholder="Atau ketik nama sekolah"
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => fetchSchoolData(formData.namaSekolah)}
                    disabled={!formData.namaSekolah || loadingSchoolData}
                    title="Ambil data dari database"
                  >
                    {loadingSchoolData ? (
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

            {/* School Type Indicator */}
            {selectedSchoolType !== 'UNKNOWN' && formData.namaSekolah && (
              <div className="p-3 bg-slate-100 rounded-lg">
                <span className="text-sm font-medium">
                  Jenjang Terdeteksi: <Badge variant="outline">{getSchoolTypeLabel(selectedSchoolType)}</Badge>
                </span>
              </div>
            )}

            {/* Siswa Section - Dynamic based on school type */}
            <div className="border rounded-lg p-4 bg-cyan-50 dark:bg-cyan-900/20">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" /> SISWA
              </h3>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {renderClassFields()}
              </div>
            </div>

            {/* Guru Section */}
            <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-900/20">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> GURU
              </h3>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                <div className="col-span-2">
                  <Label className="text-xs">Kepala Sekolah</Label>
                  <div className="flex gap-1">
                    <Input type="number" placeholder="L" value={formData.kepsekL} onChange={(e) => setFormData({...formData, kepsekL: e.target.value})} className="w-16" min="0" />
                    <Input type="number" placeholder="P" value={formData.kepsekP} onChange={(e) => setFormData({...formData, kepsekP: e.target.value})} className="w-16" min="0" />
                  </div>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Guru</Label>
                  <div className="flex gap-1">
                    <Input type="number" placeholder="L" value={formData.guruL} onChange={(e) => setFormData({...formData, guruL: e.target.value})} className="w-16" min="0" />
                    <Input type="number" placeholder="P" value={formData.guruP} onChange={(e) => setFormData({...formData, guruP: e.target.value})} className="w-16" min="0" />
                  </div>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Tendik</Label>
                  <div className="flex gap-1">
                    <Input type="number" placeholder="L" value={formData.tendikL} onChange={(e) => setFormData({...formData, tendikL: e.target.value})} className="w-16" min="0" />
                    <Input type="number" placeholder="P" value={formData.tendikP} onChange={(e) => setFormData({...formData, tendikP: e.target.value})} className="w-16" min="0" />
                  </div>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Non Tendik</Label>
                  <div className="flex gap-1">
                    <Input type="number" placeholder="L" value={formData.nonTendikL} onChange={(e) => setFormData({...formData, nonTendikL: e.target.value})} className="w-16" min="0" />
                    <Input type="number" placeholder="P" value={formData.nonTendikP} onChange={(e) => setFormData({...formData, nonTendikP: e.target.value})} className="w-16" min="0" />
                  </div>
                </div>
              </div>
            </div>

            {/* Uji Organoleptik */}
            <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
              <h3 className="font-bold mb-3">UJI ORGANOLEPTIK</h3>
              <div className="w-32">
                <Label className="text-xs">Jumlah</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={formData.ujiOrganoleptik} 
                  onChange={(e) => setFormData({...formData, ujiOrganoleptik: e.target.value})} 
                  min="0" 
                />
              </div>
            </div>

            {/* Total */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Total Jumlah:</span>
                <span className="text-2xl font-bold text-emerald-600">{calculateFormTotal()}</span>
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
