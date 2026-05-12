'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Download, FileSpreadsheet, BarChart3, PieChart as PieChartIcon,
  Users, GraduationCap, Baby, School, FileText, HeartHandshake, BabyIcon,
  FileDown, FileType
} from 'lucide-react';

interface Stats {
  totalGuru: number;
  totalSiswa: number;
  totalPosyandu: number;
  totalRelawan: number;
  guruGender: Array<{ name: string; value: number }>;
  siswaGender: Array<{ name: string; value: number }>;
  posyanduGender: Array<{ name: string; value: number }>;
  relawanGender: Array<{ name: string; value: number }>;
  guruSekolah: Array<{ name: string; value: number }>;
  siswaSekolah: Array<{ name: string; value: number }>;
  siswaJenjang: Array<{ name: string; value: number }>;
  posyanduList: Array<{ name: string; value: number }>;
  posyanduKategori: Array<{ name: string; value: number }>;
  jenisTendik: Array<{ name: string; value: number }>;
}

interface SchoolData {
  namaSekolah: string;
  siswaL: number;
  siswaP: number;
  siswaTotal: number;
  kelasBreakdown: Record<string, { L: number; P: number; Total: number }>;
}

interface GuruData {
  namaSekolah: string;
  guruL: number;
  guruP: number;
  guruTotal: number;
  tendikBreakdown: Record<string, { L: number; P: number; Total: number }>;
}

interface RekapSekolahData {
  tk: SchoolData[];
  sd: SchoolData[];
  smp: SchoolData[];
  sma: SchoolData[];
  guru: GuruData[];
  totals: {
    tk: { totalL: number; totalP: number; grandTotal: number };
    sd: { totalL: number; totalP: number; grandTotal: number };
    smp: { totalL: number; totalP: number; grandTotal: number };
    sma: { totalL: number; totalP: number; grandTotal: number };
    guru: { totalL: number; totalP: number; grandTotal: number };
  };
}

interface Rekap3BData {
  posyandu: string;
  balitaL: number;
  balitaP: number;
  balitaTotal: number;
  bumil: number;
  menyusui: number;
  lansia: number;
  total: number;
}

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

export function RekapitulasiPage() {
  const [activeTab, setActiveTab] = useState('umum');
  const [stats, setStats] = useState<Stats | null>(null);
  const [schoolData, setSchoolData] = useState<RekapSekolahData | null>(null);
  const [rekap3BData, setRekap3BData] = useState<Rekap3BData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchSchoolData();
    fetchRekap3B();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolData = async () => {
    try {
      const res = await fetch('/api/rekapitulasi/sekolah');
      const data = await res.json();
      if (data.success) {
        setSchoolData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch school data:', error);
    }
  };

  const fetchRekap3B = async () => {
    try {
      const res = await fetch('/api/rekapitulasi/tigab');
      const data = await res.json();
      if (data.success) {
        setRekap3BData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch 3B data:', error);
    }
  };

  const exportToCSV = (data: Array<{ name: string; value: number }>, filename: string) => {
    const csv = data.map(item => `${item.name},${item.value}`).join('\n');
    const blob = new Blob([`Nama,Jumlah\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const export3BToCSV = () => {
    const headers = 'No,Posyandu,Balita L,Balita P,Total Balita,Bumil,Menyusui,Lansia,Total\n';
    const rows = rekap3BData.map((s, i) => 
      `${i+1},"${s.posyandu}",${s.balitaL},${s.balitaP},${s.balitaTotal},${s.bumil},${s.menyusui},${s.lansia},${s.total}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rekapitulasi_3b.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Rekapitulasi Data</h1>
            <p className="text-sm text-slate-500">Ringkasan dan statistik data keseluruhan</p>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="umum" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Umum
          </TabsTrigger>
          <TabsTrigger value="sekolah" className="gap-2">
            <School className="w-4 h-4" />
            Sekolah
          </TabsTrigger>
          <TabsTrigger value="tigab" className="gap-2">
            <FileText className="w-4 h-4" />
            3B
          </TabsTrigger>
        </TabsList>

        {/* Tab Umum */}
        <TabsContent value="umum" className="space-y-6 mt-6">
          <RekapitulasiUmum stats={stats} exportToCSV={exportToCSV} />
        </TabsContent>

        {/* Tab Sekolah */}
        <TabsContent value="sekolah" className="space-y-6 mt-6">
          <RekapitulasiSekolahDetail schoolData={schoolData} />
        </TabsContent>

        {/* Tab 3B */}
        <TabsContent value="tigab" className="space-y-6 mt-6">
          <Rekapitulasi3B rekap3BData={rekap3BData} onExport={export3BToCSV} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Rekapitulasi Umum Component
function RekapitulasiUmum({ stats, exportToCSV }: { 
  stats: Stats | null; 
  exportToCSV: (data: Array<{ name: string; value: number }>, filename: string) => void;
}) {
  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Rekapitulasi Guru" total={stats?.totalGuru || 0} icon={GraduationCap} color="emerald" genderData={stats?.guruGender || []} />
        <SummaryCard title="Rekapitulasi Siswa" total={stats?.totalSiswa || 0} icon={Users} color="cyan" genderData={stats?.siswaGender || []} />
        <SummaryCard title="Rekapitulasi Posyandu" total={stats?.totalPosyandu || 0} icon={Baby} color="pink" genderData={stats?.posyanduGender || []} />
        <SummaryCard title="Rekapitulasi Relawan" total={stats?.totalRelawan || 0} icon={HeartHandshake} color="amber" genderData={stats?.relawanGender || []} />
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-emerald-500" />Distribusi Guru per Sekolah</CardTitle>
              <CardDescription>Top 10 sekolah dengan guru terbanyak</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => exportToCSV(stats?.guruSekolah || [], 'guru-per-sekolah')}>
              <Download className="w-4 h-4 mr-2" />Export
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats?.guruSekolah || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {(stats?.guruSekolah || []).map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-cyan-500" />Distribusi Siswa per Jenjang</CardTitle>
              <CardDescription>Jumlah siswa berdasarkan jenjang pendidikan</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => exportToCSV(stats?.siswaJenjang || [], 'siswa-per-jenjang')}>
              <Download className="w-4 h-4 mr-2" />Export
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats?.siswaJenjang || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {(stats?.siswaJenjang || []).map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Baby className="w-5 h-5 text-pink-500" />Kategori Posyandu</CardTitle>
              <CardDescription>Distribusi berdasarkan kategori</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => exportToCSV(stats?.posyanduKategori || [], 'kategori-posyandu')}>
              <Download className="w-4 h-4 mr-2" />Export
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats?.posyanduKategori || []} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {(stats?.posyanduKategori || []).map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><PieChartIcon className="w-5 h-5 text-purple-500" />Jenis Tendik Guru</CardTitle>
              <CardDescription>Distribusi berdasarkan jenis tenaga pendidik</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => exportToCSV(stats?.jenisTendik || [], 'jenis-tendik')}>
              <Download className="w-4 h-4 mr-2" />Export
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats?.jenisTendik || []} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {(stats?.jenisTendik || []).map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileSpreadsheet className="w-5 h-5 text-orange-500" />Ringkasan Data</CardTitle>
          <CardDescription>Rekapitulasi lengkap semua data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-center">Laki-laki</TableHead>
                  <TableHead className="text-center">Perempuan</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium"><div className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-emerald-500" />Guru</div></TableCell>
                  <TableCell className="text-center">{stats?.guruGender?.find(g => g.name === 'L')?.value || 0}</TableCell>
                  <TableCell className="text-center">{stats?.guruGender?.find(g => g.name === 'P')?.value || 0}</TableCell>
                  <TableCell className="text-center font-bold">{stats?.totalGuru || 0}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium"><div className="flex items-center gap-2"><Users className="w-4 h-4 text-cyan-500" />Siswa</div></TableCell>
                  <TableCell className="text-center">{stats?.siswaGender?.find(g => g.name === 'L')?.value || 0}</TableCell>
                  <TableCell className="text-center">{stats?.siswaGender?.find(g => g.name === 'P')?.value || 0}</TableCell>
                  <TableCell className="text-center font-bold">{stats?.totalSiswa || 0}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium"><div className="flex items-center gap-2"><Baby className="w-4 h-4 text-pink-500" />Posyandu</div></TableCell>
                  <TableCell className="text-center">{stats?.posyanduGender?.find(g => g.name === 'L')?.value || 0}</TableCell>
                  <TableCell className="text-center">{stats?.posyanduGender?.find(g => g.name === 'P')?.value || 0}</TableCell>
                  <TableCell className="text-center font-bold">{stats?.totalPosyandu || 0}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium"><div className="flex items-center gap-2"><HeartHandshake className="w-4 h-4 text-amber-500" />Relawan</div></TableCell>
                  <TableCell className="text-center">{stats?.relawanGender?.find(g => g.name === 'L')?.value || 0}</TableCell>
                  <TableCell className="text-center">{stats?.relawanGender?.find(g => g.name === 'P')?.value || 0}</TableCell>
                  <TableCell className="text-center font-bold">{stats?.totalRelawan || 0}</TableCell>
                </TableRow>
                <TableRow className="bg-emerald-50 dark:bg-emerald-900/20">
                  <TableCell className="font-bold">Total Keseluruhan</TableCell>
                  <TableCell className="text-center font-bold">
                    {(stats?.guruGender?.find(g => g.name === 'L')?.value || 0) + (stats?.siswaGender?.find(g => g.name === 'L')?.value || 0) + (stats?.posyanduGender?.find(g => g.name === 'L')?.value || 0) + (stats?.relawanGender?.find(g => g.name === 'L')?.value || 0)}
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {(stats?.guruGender?.find(g => g.name === 'P')?.value || 0) + (stats?.siswaGender?.find(g => g.name === 'P')?.value || 0) + (stats?.posyanduGender?.find(g => g.name === 'P')?.value || 0) + (stats?.relawanGender?.find(g => g.name === 'P')?.value || 0)}
                  </TableCell>
                  <TableCell className="text-center font-bold text-emerald-600">{(stats?.totalGuru || 0) + (stats?.totalSiswa || 0) + (stats?.totalPosyandu || 0) + (stats?.totalRelawan || 0)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// Summary Card Component
function SummaryCard({ title, total, icon: Icon, color, genderData }: {
  title: string;
  total: number;
  icon: React.ElementType;
  color: string;
  genderData: Array<{ name: string; value: number }>;
}) {
  const colorClasses: Record<string, string> = {
    emerald: 'from-emerald-500 to-teal-600',
    cyan: 'from-cyan-500 to-blue-600',
    pink: 'from-pink-500 to-rose-600',
    amber: 'from-amber-500 to-orange-600',
  };

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardContent className="p-0">
        <div className={`bg-gradient-to-r ${colorClasses[color]} p-4 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{title}</p>
              <p className="text-2xl font-bold">{total.toLocaleString()}</p>
            </div>
            <Icon className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="p-3 flex justify-around text-sm">
          <div className="text-center">
            <p className="text-slate-500">Laki-laki</p>
            <p className="font-bold text-blue-600">{genderData.find(g => g.name === 'L')?.value || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-slate-500">Perempuan</p>
            <p className="font-bold text-pink-600">{genderData.find(g => g.name === 'P')?.value || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Rekapitulasi Sekolah Detail Component
function RekapitulasiSekolahDetail({ schoolData }: { schoolData: RekapSekolahData | null }) {
  const [subTab, setSubTab] = useState('tk');

  if (!schoolData) {
    return <div className="p-4 text-center text-slate-500">Memuat data...</div>;
  }

  const exportSekolahToCSV = (data: SchoolData[], kelasList: string[], filename: string) => {
    const headers = `No,Sekolah,${kelasList.map(k => `${k} L,${k} P,${k} Total`).join(',')},Total L,Total P,Total\n`;
    const rows = data.map((s, i) => {
      const kelasValues = kelasList.map(k => {
        const kelas = s.kelasBreakdown[k] || { L: 0, P: 0, Total: 0 };
        return `${kelas.L},${kelas.P},${kelas.Total}`;
      }).join(',');
      return `${i+1},"${s.namaSekolah}",${kelasValues},${s.siswaL},${s.siswaP},${s.siswaTotal}`;
    }).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSekolahToExcel = async (data: SchoolData[], kelasList: string[], filename: string) => {
    try {
      const res = await fetch('/api/export/rekap-sekolah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, kelasList, filename, format: 'xlsx' }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export Excel error:', error);
    }
  };

  const exportSekolahToPDF = async (data: SchoolData[], kelasList: string[], filename: string, title: string) => {
    try {
      const res = await fetch('/api/export/rekap-sekolah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, kelasList, filename, format: 'pdf', title }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export PDF error:', error);
    }
  };

  const exportGuruToCSV = () => {
    const tendikTypes = ['Kepala Sekolah', 'Guru', 'Guru Tendik', 'Tenaga Kependidikan', 'Non Tendik'];
    const headers = `No,Sekolah,${tendikTypes.map(t => `${t} L,${t} P,${t} Total`).join(',')},Uji Organoleptik,Total L,Total P,Total\n`;
    const rows = schoolData.guru.map((s, i) => {
      const tendikValues = tendikTypes.map(t => {
        const tendik = s.tendikBreakdown[t] || { L: 0, P: 0, Total: 0 };
        return `${tendik.L},${tendik.P},${tendik.Total}`;
      }).join(',');
      // Uji Organoleptik = Kepala Sekolah + Guru (yang wajib uji organoleptik)
      const kepsek = s.tendikBreakdown['Kepala Sekolah'] || { L: 0, P: 0, Total: 0 };
      const guru = s.tendikBreakdown['Guru'] || { L: 0, P: 0, Total: 0 };
      const ujiOrganoleptik = kepsek.Total + guru.Total;
      return `${i+1},"${s.namaSekolah}",${tendikValues},${ujiOrganoleptik},${s.guruL},${s.guruP},${s.guruTotal}`;
    }).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rekapitulasi_guru.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportGuruToExcel = async () => {
    try {
      const res = await fetch('/api/export/rekap-guru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: schoolData.guru, format: 'xlsx' }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rekapitulasi_guru.xlsx';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export Excel error:', error);
    }
  };

  const exportGuruToPDF = async () => {
    try {
      const res = await fetch('/api/export/rekap-guru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: schoolData.guru, format: 'pdf' }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rekapitulasi_guru.pdf';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export PDF error:', error);
    }
  };

  return (
    <Tabs value={subTab} onValueChange={setSubTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="tk" className="gap-1"><BabyIcon className="w-4 h-4" />TK/PAUD</TabsTrigger>
        <TabsTrigger value="sd" className="gap-1"><School className="w-4 h-4" />SD/MI</TabsTrigger>
        <TabsTrigger value="smp" className="gap-1"><School className="w-4 h-4" />SMP/MTs</TabsTrigger>
        <TabsTrigger value="sma" className="gap-1"><School className="w-4 h-4" />SMA/SMK/MA</TabsTrigger>
        <TabsTrigger value="guru" className="gap-1"><GraduationCap className="w-4 h-4" />Guru</TabsTrigger>
      </TabsList>

      {/* TK/PAUD Tab */}
      <TabsContent value="tk">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>REKAP TK/PAUD</CardTitle>
              <CardDescription>Data siswa TK/PAUD per kelas</CardDescription>
            </div>
            <div className="flex gap-2 items-center">
              <Button variant="outline" size="sm" onClick={() => exportSekolahToCSV(schoolData.tk, ['A', 'B'], 'rekapitulasi_tk')}>
                <Download className="w-4 h-4 mr-2" />Export
              </Button>
              <Badge variant="outline">Total: {schoolData.totals.tk.grandTotal.toLocaleString()} siswa</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="border-collapse border border-slate-300">
                <TableHeader>
                  {/* Main Header Row */}
                  <TableRow className="bg-slate-100 dark:bg-slate-800">
                    <TableHead rowSpan={2} className="border border-slate-300 text-center align-middle bg-slate-200 dark:bg-slate-700 min-w-[200px]">NAMA SEKOLAH</TableHead>
                    <TableHead colSpan={2} className="border border-slate-300 text-center bg-pink-100 dark:bg-pink-900/30">KLS A</TableHead>
                    <TableHead colSpan={2} className="border border-slate-300 text-center bg-pink-100 dark:bg-pink-900/30">KLS B</TableHead>
                    <TableHead colSpan={2} className="border border-slate-300 text-center bg-emerald-100 dark:bg-emerald-900/30">JUMLAH</TableHead>
                    <TableHead rowSpan={2} className="border border-slate-300 text-center align-middle bg-blue-100 dark:bg-blue-900/30 font-bold min-w-[60px]">TOTAL</TableHead>
                  </TableRow>
                  {/* Sub Header Row */}
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="border border-slate-300 text-center w-12 bg-pink-50 dark:bg-pink-900/20">L</TableHead>
                    <TableHead className="border border-slate-300 text-center w-12 bg-green-50 dark:bg-green-900/20">P</TableHead>
                    <TableHead className="border border-slate-300 text-center w-12 bg-pink-50 dark:bg-pink-900/20">L</TableHead>
                    <TableHead className="border border-slate-300 text-center w-12 bg-green-50 dark:bg-green-900/20">P</TableHead>
                    <TableHead className="border border-slate-300 text-center w-12 bg-pink-50 dark:bg-pink-900/20">L</TableHead>
                    <TableHead className="border border-slate-300 text-center w-12 bg-green-50 dark:bg-green-900/20">P</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolData.tk.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="border border-slate-300 text-center py-8 text-slate-500">Tidak ada data TK/PAUD</TableCell>
                    </TableRow>
                  ) : (
                    schoolData.tk.map((s, i) => {
                      const kelasA = s.kelasBreakdown['A'] || { L: 0, P: 0 };
                      const kelasB = s.kelasBreakdown['B'] || { L: 0, P: 0 };
                      return (
                        <TableRow key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <TableCell className="border border-slate-300 font-medium">{s.namaSekolah}</TableCell>
                          <TableCell className="border border-slate-300 text-center">{kelasA.L}</TableCell>
                          <TableCell className="border border-slate-300 text-center">{kelasA.P}</TableCell>
                          <TableCell className="border border-slate-300 text-center">{kelasB.L}</TableCell>
                          <TableCell className="border border-slate-300 text-center">{kelasB.P}</TableCell>
                          <TableCell className="border border-slate-300 text-center font-medium">{s.siswaL}</TableCell>
                          <TableCell className="border border-slate-300 text-center font-medium">{s.siswaP}</TableCell>
                          <TableCell className="border border-slate-300 text-center font-bold text-blue-600">{s.siswaTotal}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                  {schoolData.tk.length > 0 && (
                    <TableRow className="bg-blue-50 dark:bg-blue-900/20 font-bold">
                      <TableCell className="border border-slate-300">JUMLAH</TableCell>
                      <TableCell className="border border-slate-300 text-center">{schoolData.tk.reduce((sum, s) => sum + (s.kelasBreakdown['A']?.L || 0), 0)}</TableCell>
                      <TableCell className="border border-slate-300 text-center">{schoolData.tk.reduce((sum, s) => sum + (s.kelasBreakdown['A']?.P || 0), 0)}</TableCell>
                      <TableCell className="border border-slate-300 text-center">{schoolData.tk.reduce((sum, s) => sum + (s.kelasBreakdown['B']?.L || 0), 0)}</TableCell>
                      <TableCell className="border border-slate-300 text-center">{schoolData.tk.reduce((sum, s) => sum + (s.kelasBreakdown['B']?.P || 0), 0)}</TableCell>
                      <TableCell className="border border-slate-300 text-center">{schoolData.totals.tk.totalL}</TableCell>
                      <TableCell className="border border-slate-300 text-center">{schoolData.totals.tk.totalP}</TableCell>
                      <TableCell className="border border-slate-300 text-center text-blue-700">{schoolData.totals.tk.grandTotal}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* SD Tab */}
      <TabsContent value="sd">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>REKAP SD/MI</CardTitle>
              <CardDescription>Data siswa per kelas (Kelas 1-6)</CardDescription>
            </div>
            <div className="flex gap-2 items-center">
              <Button variant="outline" size="sm" onClick={() => exportSekolahToCSV(schoolData.sd, ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'], 'rekapitulasi_sd')}>
                <Download className="w-4 h-4 mr-2" />Export
              </Button>
              <Badge variant="outline">Total: {schoolData.totals.sd.grandTotal.toLocaleString()} siswa</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="border-collapse border border-slate-300">
                <TableHeader>
                  {/* Main Header Row */}
                  <TableRow className="bg-slate-100 dark:bg-slate-800">
                    <TableHead rowSpan={2} className="border border-slate-300 text-center align-middle bg-slate-200 dark:bg-slate-700 min-w-[200px]">UNIT PENERIMA MANFAAT</TableHead>
                    {[1, 2, 3, 4, 5, 6].map(k => (
                      <TableHead key={k} colSpan={2} className="border border-slate-300 text-center bg-pink-100 dark:bg-pink-900/30">KLS {k}</TableHead>
                    ))}
                    <TableHead colSpan={2} className="border border-slate-300 text-center bg-emerald-100 dark:bg-emerald-900/30">JUMLAH</TableHead>
                    <TableHead rowSpan={2} className="border border-slate-300 text-center align-middle bg-blue-100 dark:bg-blue-900/30 font-bold min-w-[60px]">TOTAL</TableHead>
                  </TableRow>
                  {/* Sub Header Row */}
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    {[1, 2, 3, 4, 5, 6].map(k => (
                      <React.Fragment key={k}>
                        <TableHead className="border border-slate-300 text-center w-12 bg-pink-50 dark:bg-pink-900/20">L</TableHead>
                        <TableHead className="border border-slate-300 text-center w-12 bg-green-50 dark:bg-green-900/20">P</TableHead>
                      </React.Fragment>
                    ))}
                    <TableHead className="border border-slate-300 text-center w-12 bg-pink-50 dark:bg-pink-900/20">L</TableHead>
                    <TableHead className="border border-slate-300 text-center w-12 bg-green-50 dark:bg-green-900/20">P</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolData.sd.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={16} className="border border-slate-300 text-center py-8 text-slate-500">Tidak ada data SD/MI</TableCell>
                    </TableRow>
                  ) : (
                    schoolData.sd.map((s, i) => (
                      <TableRow key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableCell className="border border-slate-300 font-medium">{s.namaSekolah}</TableCell>
                        {[1, 2, 3, 4, 5, 6].map(k => {
                          const kelas = s.kelasBreakdown[`Kelas ${k}`] || { L: 0, P: 0 };
                          return (
                            <React.Fragment key={k}>
                              <TableCell className="border border-slate-300 text-center">{kelas.L}</TableCell>
                              <TableCell className="border border-slate-300 text-center">{kelas.P}</TableCell>
                            </React.Fragment>
                          );
                        })}
                        <TableCell className="border border-slate-300 text-center font-medium">{s.siswaL}</TableCell>
                        <TableCell className="border border-slate-300 text-center font-medium">{s.siswaP}</TableCell>
                        <TableCell className="border border-slate-300 text-center font-bold text-blue-600">{s.siswaTotal}</TableCell>
                      </TableRow>
                    ))
                  )}
                  {schoolData.sd.length > 0 && (
                    <TableRow className="bg-blue-50 dark:bg-blue-900/20 font-bold">
                      <TableCell className="border border-slate-300">JUMLAH</TableCell>
                      {[1, 2, 3, 4, 5, 6].map(k => {
                        const totalL = schoolData.sd.reduce((sum, s) => sum + (s.kelasBreakdown[`Kelas ${k}`]?.L || 0), 0);
                        const totalP = schoolData.sd.reduce((sum, s) => sum + (s.kelasBreakdown[`Kelas ${k}`]?.P || 0), 0);
                        return (
                          <React.Fragment key={k}>
                            <TableCell className="border border-slate-300 text-center">{totalL}</TableCell>
                            <TableCell className="border border-slate-300 text-center">{totalP}</TableCell>
                          </React.Fragment>
                        );
                      })}
                      <TableCell className="border border-slate-300 text-center">{schoolData.totals.sd.totalL}</TableCell>
                      <TableCell className="border border-slate-300 text-center">{schoolData.totals.sd.totalP}</TableCell>
                      <TableCell className="border border-slate-300 text-center text-blue-700">{schoolData.totals.sd.grandTotal}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* SMP Tab */}
      <TabsContent value="smp">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>REKAP SMP/MTs</CardTitle>
              <CardDescription>Data siswa per kelas (Kelas 7-9)</CardDescription>
            </div>
            <div className="flex gap-2 items-center">
              <Button variant="outline" size="sm" onClick={() => exportSekolahToCSV(schoolData.smp, ['Kelas 7', 'Kelas 8', 'Kelas 9'], 'rekapitulasi_smp')}>
                <Download className="w-4 h-4 mr-2" />Export
              </Button>
              <Badge variant="outline">Total: {schoolData.totals.smp.grandTotal.toLocaleString()} siswa</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="border-collapse border border-slate-300">
                <TableHeader>
                  {/* Main Header Row */}
                  <TableRow className="bg-slate-100 dark:bg-slate-800">
                    <TableHead rowSpan={2} className="border border-slate-300 text-center align-middle bg-slate-200 dark:bg-slate-700 min-w-[200px]">UNIT PENERIMA MANFAAT</TableHead>
                    {[7, 8, 9].map(k => (
                      <TableHead key={k} colSpan={2} className="border border-slate-300 text-center bg-pink-100 dark:bg-pink-900/30">KLS {k}</TableHead>
                    ))}
                    <TableHead colSpan={2} className="border border-slate-300 text-center bg-emerald-100 dark:bg-emerald-900/30">JUMLAH</TableHead>
                    <TableHead rowSpan={2} className="border border-slate-300 text-center align-middle bg-blue-100 dark:bg-blue-900/30 font-bold min-w-[60px]">TOTAL</TableHead>
                  </TableRow>
                  {/* Sub Header Row */}
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    {[7, 8, 9].map(k => (
                      <React.Fragment key={k}>
                        <TableHead className="border border-slate-300 text-center w-12 bg-pink-50 dark:bg-pink-900/20">L</TableHead>
                        <TableHead className="border border-slate-300 text-center w-12 bg-green-50 dark:bg-green-900/20">P</TableHead>
                      </React.Fragment>
                    ))}
                    <TableHead className="border border-slate-300 text-center w-12 bg-pink-50 dark:bg-pink-900/20">L</TableHead>
                    <TableHead className="border border-slate-300 text-center w-12 bg-green-50 dark:bg-green-900/20">P</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolData.smp.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="border border-slate-300 text-center py-8 text-slate-500">Tidak ada data SMP/MTs</TableCell>
                    </TableRow>
                  ) : (
                    schoolData.smp.map((s, i) => (
                      <TableRow key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableCell className="border border-slate-300 font-medium">{s.namaSekolah}</TableCell>
                        {[7, 8, 9].map(k => {
                          const kelas = s.kelasBreakdown[`Kelas ${k}`] || { L: 0, P: 0 };
                          return (
                            <React.Fragment key={k}>
                              <TableCell className="border border-slate-300 text-center">{kelas.L}</TableCell>
                              <TableCell className="border border-slate-300 text-center">{kelas.P}</TableCell>
                            </React.Fragment>
                          );
                        })}
                        <TableCell className="border border-slate-300 text-center font-medium">{s.siswaL}</TableCell>
                        <TableCell className="border border-slate-300 text-center font-medium">{s.siswaP}</TableCell>
                        <TableCell className="border border-slate-300 text-center font-bold text-blue-600">{s.siswaTotal}</TableCell>
                      </TableRow>
                    ))
                  )}
                  {schoolData.smp.length > 0 && (
                    <TableRow className="bg-blue-50 dark:bg-blue-900/20 font-bold">
                      <TableCell className="border border-slate-300">JUMLAH</TableCell>
                      {[7, 8, 9].map(k => {
                        const totalL = schoolData.smp.reduce((sum, s) => sum + (s.kelasBreakdown[`Kelas ${k}`]?.L || 0), 0);
                        const totalP = schoolData.smp.reduce((sum, s) => sum + (s.kelasBreakdown[`Kelas ${k}`]?.P || 0), 0);
                        return (
                          <React.Fragment key={k}>
                            <TableCell className="border border-slate-300 text-center">{totalL}</TableCell>
                            <TableCell className="border border-slate-300 text-center">{totalP}</TableCell>
                          </React.Fragment>
                        );
                      })}
                      <TableCell className="border border-slate-300 text-center">{schoolData.totals.smp.totalL}</TableCell>
                      <TableCell className="border border-slate-300 text-center">{schoolData.totals.smp.totalP}</TableCell>
                      <TableCell className="border border-slate-300 text-center text-blue-700">{schoolData.totals.smp.grandTotal}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* SMA Tab */}
      <TabsContent value="sma">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>REKAP SMA/SMK/MA</CardTitle>
              <CardDescription>Data siswa per kelas (Kelas 10-12)</CardDescription>
            </div>
            <div className="flex gap-2 items-center">
              <Button variant="outline" size="sm" onClick={() => exportSekolahToCSV(schoolData.sma, ['Kelas 10', 'Kelas 11', 'Kelas 12'], 'rekapitulasi_sma')}>
                <Download className="w-4 h-4 mr-2" />Export
              </Button>
              <Badge variant="outline">Total: {schoolData.totals.sma.grandTotal.toLocaleString()} siswa</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="border-collapse border border-slate-300">
                <TableHeader>
                  {/* Main Header Row */}
                  <TableRow className="bg-slate-100 dark:bg-slate-800">
                    <TableHead rowSpan={2} className="border border-slate-300 text-center align-middle bg-slate-200 dark:bg-slate-700 min-w-[200px]">UNIT PENERIMA MANFAAT</TableHead>
                    {[10, 11, 12].map(k => (
                      <TableHead key={k} colSpan={2} className="border border-slate-300 text-center bg-pink-100 dark:bg-pink-900/30">KLS {k}</TableHead>
                    ))}
                    <TableHead colSpan={2} className="border border-slate-300 text-center bg-emerald-100 dark:bg-emerald-900/30">JUMLAH</TableHead>
                    <TableHead rowSpan={2} className="border border-slate-300 text-center align-middle bg-blue-100 dark:bg-blue-900/30 font-bold min-w-[60px]">TOTAL</TableHead>
                  </TableRow>
                  {/* Sub Header Row */}
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    {[10, 11, 12].map(k => (
                      <React.Fragment key={k}>
                        <TableHead className="border border-slate-300 text-center w-12 bg-pink-50 dark:bg-pink-900/20">L</TableHead>
                        <TableHead className="border border-slate-300 text-center w-12 bg-green-50 dark:bg-green-900/20">P</TableHead>
                      </React.Fragment>
                    ))}
                    <TableHead className="border border-slate-300 text-center w-12 bg-pink-50 dark:bg-pink-900/20">L</TableHead>
                    <TableHead className="border border-slate-300 text-center w-12 bg-green-50 dark:bg-green-900/20">P</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolData.sma.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="border border-slate-300 text-center py-8 text-slate-500">Tidak ada data SMA/SMK/MA</TableCell>
                    </TableRow>
                  ) : (
                    schoolData.sma.map((s, i) => (
                      <TableRow key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableCell className="border border-slate-300 font-medium">{s.namaSekolah}</TableCell>
                        {[10, 11, 12].map(k => {
                          const kelas = s.kelasBreakdown[`Kelas ${k}`] || { L: 0, P: 0 };
                          return (
                            <React.Fragment key={k}>
                              <TableCell className="border border-slate-300 text-center">{kelas.L}</TableCell>
                              <TableCell className="border border-slate-300 text-center">{kelas.P}</TableCell>
                            </React.Fragment>
                          );
                        })}
                        <TableCell className="border border-slate-300 text-center font-medium">{s.siswaL}</TableCell>
                        <TableCell className="border border-slate-300 text-center font-medium">{s.siswaP}</TableCell>
                        <TableCell className="border border-slate-300 text-center font-bold text-blue-600">{s.siswaTotal}</TableCell>
                      </TableRow>
                    ))
                  )}
                  {schoolData.sma.length > 0 && (
                    <TableRow className="bg-blue-50 dark:bg-blue-900/20 font-bold">
                      <TableCell className="border border-slate-300">JUMLAH</TableCell>
                      {[10, 11, 12].map(k => {
                        const totalL = schoolData.sma.reduce((sum, s) => sum + (s.kelasBreakdown[`Kelas ${k}`]?.L || 0), 0);
                        const totalP = schoolData.sma.reduce((sum, s) => sum + (s.kelasBreakdown[`Kelas ${k}`]?.P || 0), 0);
                        return (
                          <React.Fragment key={k}>
                            <TableCell className="border border-slate-300 text-center">{totalL}</TableCell>
                            <TableCell className="border border-slate-300 text-center">{totalP}</TableCell>
                          </React.Fragment>
                        );
                      })}
                      <TableCell className="border border-slate-300 text-center">{schoolData.totals.sma.totalL}</TableCell>
                      <TableCell className="border border-slate-300 text-center">{schoolData.totals.sma.totalP}</TableCell>
                      <TableCell className="border border-slate-300 text-center text-blue-700">{schoolData.totals.sma.grandTotal}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Guru Tab */}
      <TabsContent value="guru">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>REKAP GURU</CardTitle>
              <CardDescription>Data guru per jenis tenaga pendidik</CardDescription>
            </div>
            <div className="flex gap-2 items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportGuruToCSV}>
                    <FileText className="w-4 h-4 mr-2" />Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportGuruToExcel}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />Export Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportGuruToPDF}>
                    <FileType className="w-4 h-4 mr-2" />Export PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Badge variant="outline">Total: {schoolData.totals.guru.grandTotal.toLocaleString()} guru</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="border-collapse border border-slate-300">
                <TableHeader>
                  {/* Main Header Row */}
                  <TableRow className="bg-slate-100 dark:bg-slate-800">
                    <TableHead rowSpan={2} className="border border-slate-300 text-center align-middle bg-slate-200 dark:bg-slate-700 min-w-[200px]">NAMA SEKOLAH</TableHead>
                    <TableHead colSpan={2} className="border border-slate-300 text-center bg-purple-100 dark:bg-purple-900/30 text-xs">KEPSEK</TableHead>
                    <TableHead colSpan={2} className="border border-slate-300 text-center bg-purple-100 dark:bg-purple-900/30 text-xs">GURU</TableHead>
                    <TableHead colSpan={2} className="border border-slate-300 text-center bg-purple-100 dark:bg-purple-900/30 text-xs">TENDIK</TableHead>
                    <TableHead colSpan={2} className="border border-slate-300 text-center bg-purple-100 dark:bg-purple-900/30 text-xs">NON TENDIK</TableHead>
                    <TableHead rowSpan={2} className="border border-slate-300 text-center align-middle bg-amber-100 dark:bg-amber-900/30 text-xs min-w-[60px]">UJI ORGANOLEPTIK</TableHead>
                    <TableHead colSpan={2} className="border border-slate-300 text-center bg-emerald-100 dark:bg-emerald-900/30">JUMLAH</TableHead>
                    <TableHead rowSpan={2} className="border border-slate-300 text-center align-middle bg-blue-100 dark:bg-blue-900/30 font-bold min-w-[60px]">TOTAL</TableHead>
                  </TableRow>
                  {/* Sub Header Row */}
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="border border-slate-300 text-center w-12 bg-pink-50 dark:bg-pink-900/20 text-xs">L</TableHead>
                    <TableHead className="border border-slate-300 text-center w-12 bg-green-50 dark:bg-green-900/20 text-xs">P</TableHead>
                    <TableHead className="border border-slate-300 text-center w-12 bg-pink-50 dark:bg-pink-900/20 text-xs">L</TableHead>
                    <TableHead className="border border-slate-300 text-center w-12 bg-green-50 dark:bg-green-900/20 text-xs">P</TableHead>
                    <TableHead className="border border-slate-300 text-center w-12 bg-pink-50 dark:bg-pink-900/20 text-xs">L</TableHead>
                    <TableHead className="border border-slate-300 text-center w-12 bg-green-50 dark:bg-green-900/20 text-xs">P</TableHead>
                    <TableHead className="border border-slate-300 text-center w-12 bg-pink-50 dark:bg-pink-900/20 text-xs">L</TableHead>
                    <TableHead className="border border-slate-300 text-center w-12 bg-green-50 dark:bg-green-900/20 text-xs">P</TableHead>
                    <TableHead className="border border-slate-300 text-center w-12 bg-pink-50 dark:bg-pink-900/20">L</TableHead>
                    <TableHead className="border border-slate-300 text-center w-12 bg-green-50 dark:bg-green-900/20">P</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolData.guru.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={14} className="border border-slate-300 text-center py-8 text-slate-500">Tidak ada data Guru</TableCell>
                    </TableRow>
                  ) : (
                    schoolData.guru.map((s, i) => {
                      const kepsek = s.tendikBreakdown['Kepala Sekolah'] || { L: 0, P: 0, Total: 0 };
                      const guru = s.tendikBreakdown['Guru'] || { L: 0, P: 0, Total: 0 };
                      const tendik = s.tendikBreakdown['Guru Tendik'] || s.tendikBreakdown['Tenaga Kependidikan'] || { L: 0, P: 0 };
                      const nonTendik = s.tendikBreakdown['Non Tendik'] || { L: 0, P: 0 };
                      // Uji Organoleptik = Kepala Sekolah + Guru (yang wajib uji organoleptik makanan)
                      const ujiOrganoleptik = kepsek.Total + guru.Total;
                      return (
                        <TableRow key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <TableCell className="border border-slate-300 font-medium">{s.namaSekolah}</TableCell>
                          <TableCell className="border border-slate-300 text-center">{kepsek.L}</TableCell>
                          <TableCell className="border border-slate-300 text-center">{kepsek.P}</TableCell>
                          <TableCell className="border border-slate-300 text-center">{guru.L}</TableCell>
                          <TableCell className="border border-slate-300 text-center">{guru.P}</TableCell>
                          <TableCell className="border border-slate-300 text-center">{tendik.L}</TableCell>
                          <TableCell className="border border-slate-300 text-center">{tendik.P}</TableCell>
                          <TableCell className="border border-slate-300 text-center">{nonTendik.L}</TableCell>
                          <TableCell className="border border-slate-300 text-center">{nonTendik.P}</TableCell>
                          <TableCell className="border border-slate-300 text-center font-medium bg-amber-50 dark:bg-amber-900/10">{ujiOrganoleptik}</TableCell>
                          <TableCell className="border border-slate-300 text-center font-medium">{s.guruL}</TableCell>
                          <TableCell className="border border-slate-300 text-center font-medium">{s.guruP}</TableCell>
                          <TableCell className="border border-slate-300 text-center font-bold text-blue-600">{s.guruTotal}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                  {schoolData.guru.length > 0 && (
                    <TableRow className="bg-blue-50 dark:bg-blue-900/20 font-bold">
                      <TableCell className="border border-slate-300">JUMLAH</TableCell>
                      <TableCell className="border border-slate-300 text-center">{schoolData.guru.reduce((sum, s) => sum + (s.tendikBreakdown['Kepala Sekolah']?.L || 0), 0)}</TableCell>
                      <TableCell className="border border-slate-300 text-center">{schoolData.guru.reduce((sum, s) => sum + (s.tendikBreakdown['Kepala Sekolah']?.P || 0), 0)}</TableCell>
                      <TableCell className="border border-slate-300 text-center">{schoolData.guru.reduce((sum, s) => sum + (s.tendikBreakdown['Guru']?.L || 0), 0)}</TableCell>
                      <TableCell className="border border-slate-300 text-center">{schoolData.guru.reduce((sum, s) => sum + (s.tendikBreakdown['Guru']?.P || 0), 0)}</TableCell>
                      <TableCell className="border border-slate-300 text-center">{schoolData.guru.reduce((sum, s) => sum + ((s.tendikBreakdown['Guru Tendik'] || s.tendikBreakdown['Tenaga Kependidikan'])?.L || 0), 0)}</TableCell>
                      <TableCell className="border border-slate-300 text-center">{schoolData.guru.reduce((sum, s) => sum + ((s.tendikBreakdown['Guru Tendik'] || s.tendikBreakdown['Tenaga Kependidikan'])?.P || 0), 0)}</TableCell>
                      <TableCell className="border border-slate-300 text-center">{schoolData.guru.reduce((sum, s) => sum + (s.tendikBreakdown['Non Tendik']?.L || 0), 0)}</TableCell>
                      <TableCell className="border border-slate-300 text-center">{schoolData.guru.reduce((sum, s) => sum + (s.tendikBreakdown['Non Tendik']?.P || 0), 0)}</TableCell>
                      <TableCell className="border border-slate-300 text-center bg-amber-50 dark:bg-amber-900/10">{schoolData.guru.reduce((sum, s) => sum + ((s.tendikBreakdown['Kepala Sekolah']?.Total || 0) + (s.tendikBreakdown['Guru']?.Total || 0)), 0)}</TableCell>
                      <TableCell className="border border-slate-300 text-center">{schoolData.totals.guru.totalL}</TableCell>
                      <TableCell className="border border-slate-300 text-center">{schoolData.totals.guru.totalP}</TableCell>
                      <TableCell className="border border-slate-300 text-center text-blue-700">{schoolData.totals.guru.grandTotal}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

// Rekapitulasi 3B Component
function Rekapitulasi3B({ rekap3BData, onExport }: { 
  rekap3BData: Rekap3BData[]; 
  onExport: () => void;
}) {
  const totals = rekap3BData.reduce((acc, item) => ({
    balitaL: acc.balitaL + item.balitaL,
    balitaP: acc.balitaP + item.balitaP,
    balitaTotal: acc.balitaTotal + item.balitaTotal,
    bumil: acc.bumil + item.bumil,
    menyusui: acc.menyusui + item.menyusui,
    lansia: acc.lansia + item.lansia,
    total: acc.total + item.total,
  }), { balitaL: 0, balitaP: 0, balitaTotal: 0, bumil: 0, menyusui: 0, lansia: 0, total: 0 });

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>REKAP 3B (BALITA, BUMIL, MENYUSUI)</CardTitle>
          <CardDescription>Data per Posyandu</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="w-4 h-4 mr-2" />Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="border-collapse border border-slate-300">
            <TableHeader>
              {/* Main Header Row */}
              <TableRow className="bg-slate-100 dark:bg-slate-800">
                <TableHead rowSpan={2} className="border border-slate-300 text-center align-middle bg-slate-200 dark:bg-slate-700 w-12">NO</TableHead>
                <TableHead rowSpan={2} className="border border-slate-300 text-center align-middle bg-slate-200 dark:bg-slate-700 min-w-[200px]">POSYANDU</TableHead>
                <TableHead colSpan={3} className="border border-slate-300 text-center bg-pink-100 dark:bg-pink-900/30">BALITA</TableHead>
                <TableHead rowSpan={2} className="border border-slate-300 text-center align-middle bg-purple-100 dark:bg-purple-900/30 min-w-[60px]">BUMIL</TableHead>
                <TableHead rowSpan={2} className="border border-slate-300 text-center align-middle bg-purple-100 dark:bg-purple-900/30 min-w-[60px]">MENYUSUI</TableHead>
                <TableHead rowSpan={2} className="border border-slate-300 text-center align-middle bg-purple-100 dark:bg-purple-900/30 min-w-[60px]">LANSIA</TableHead>
                <TableHead rowSpan={2} className="border border-slate-300 text-center align-middle bg-blue-100 dark:bg-blue-900/30 font-bold min-w-[60px]">TOTAL</TableHead>
              </TableRow>
              {/* Sub Header Row */}
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="border border-slate-300 text-center w-12 bg-pink-50 dark:bg-pink-900/20">L</TableHead>
                <TableHead className="border border-slate-300 text-center w-12 bg-green-50 dark:bg-green-900/20">P</TableHead>
                <TableHead className="border border-slate-300 text-center w-12 bg-amber-50 dark:bg-amber-900/20 font-bold">JML</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rekap3BData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="border border-slate-300 text-center py-8 text-slate-500">Tidak ada data 3B</TableCell>
                </TableRow>
              ) : (
                rekap3BData.map((item, i) => (
                  <TableRow key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableCell className="border border-slate-300 text-center">{i + 1}</TableCell>
                    <TableCell className="border border-slate-300 font-medium">{item.posyandu}</TableCell>
                    <TableCell className="border border-slate-300 text-center">{item.balitaL}</TableCell>
                    <TableCell className="border border-slate-300 text-center">{item.balitaP}</TableCell>
                    <TableCell className="border border-slate-300 text-center font-medium bg-amber-50 dark:bg-amber-900/10">{item.balitaTotal}</TableCell>
                    <TableCell className="border border-slate-300 text-center">{item.bumil}</TableCell>
                    <TableCell className="border border-slate-300 text-center">{item.menyusui}</TableCell>
                    <TableCell className="border border-slate-300 text-center">{item.lansia}</TableCell>
                    <TableCell className="border border-slate-300 text-center font-bold text-blue-600">{item.total}</TableCell>
                  </TableRow>
                ))
              )}
              {rekap3BData.length > 0 && (
                <TableRow className="bg-blue-50 dark:bg-blue-900/20 font-bold">
                  <TableCell colSpan={2} className="border border-slate-300 text-center">JUMLAH</TableCell>
                  <TableCell className="border border-slate-300 text-center">{totals.balitaL}</TableCell>
                  <TableCell className="border border-slate-300 text-center">{totals.balitaP}</TableCell>
                  <TableCell className="border border-slate-300 text-center bg-amber-50 dark:bg-amber-900/10">{totals.balitaTotal}</TableCell>
                  <TableCell className="border border-slate-300 text-center">{totals.bumil}</TableCell>
                  <TableCell className="border border-slate-300 text-center">{totals.menyusui}</TableCell>
                  <TableCell className="border border-slate-300 text-center">{totals.lansia}</TableCell>
                  <TableCell className="border border-slate-300 text-center text-blue-700">{totals.total}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
