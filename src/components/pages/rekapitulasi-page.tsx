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
  Download, FileSpreadsheet, BarChart3, PieChart as PieChartIcon,
  Users, GraduationCap, Baby, School, FileText, HeartHandshake
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
  jenjang: string;
  guruL: number;
  guruP: number;
  guruTotal: number;
  siswaL: number;
  siswaP: number;
  siswaTotal: number;
  total: number;
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
  const [schoolData, setSchoolData] = useState<SchoolData[]>([]);
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

  const exportSchoolToCSV = () => {
    const headers = 'No,Sekolah,Jenjang,Guru L,Guru P,Total Guru,Siswa L,Siswa P,Total Siswa,Total\n';
    const rows = schoolData.map((s, i) => 
      `${i+1},"${s.namaSekolah}","${s.jenjang}",${s.guruL},${s.guruP},${s.guruTotal},${s.siswaL},${s.siswaP},${s.siswaTotal},${s.total}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rekapitulasi_sekolah.csv';
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

      {/* Tabs */}
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
          <RekapitulasiUmum 
            stats={stats} 
            exportToCSV={exportToCSV} 
          />
        </TabsContent>

        {/* Tab Sekolah */}
        <TabsContent value="sekolah" className="space-y-6 mt-6">
          <RekapitulasiSekolah 
            schoolData={schoolData} 
            onExport={exportSchoolToCSV} 
          />
        </TabsContent>

        {/* Tab 3B */}
        <TabsContent value="tigab" className="space-y-6 mt-6">
          <Rekapitulasi3B 
            rekap3BData={rekap3BData} 
            onExport={export3BToCSV} 
          />
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
        <SummaryCard
          title="Rekapitulasi Guru"
          total={stats?.totalGuru || 0}
          icon={GraduationCap}
          color="emerald"
          genderData={stats?.guruGender || []}
        />
        <SummaryCard
          title="Rekapitulasi Siswa"
          total={stats?.totalSiswa || 0}
          icon={Users}
          color="cyan"
          genderData={stats?.siswaGender || []}
        />
        <SummaryCard
          title="Rekapitulasi Posyandu"
          total={stats?.totalPosyandu || 0}
          icon={Baby}
          color="pink"
          genderData={stats?.posyanduGender || []}
        />
        <SummaryCard
          title="Rekapitulasi Relawan"
          total={stats?.totalRelawan || 0}
          icon={HeartHandshake}
          color="amber"
          genderData={stats?.relawanGender || []}
        />
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guru per Sekolah */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-500" />
                Distribusi Guru per Sekolah
              </CardTitle>
              <CardDescription>Top 10 sekolah dengan guru terbanyak</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(stats?.guruSekolah || [], 'guru-per-sekolah')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats?.guruSekolah || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {(stats?.guruSekolah || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Siswa per Jenjang */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-500" />
                Distribusi Siswa per Jenjang
              </CardTitle>
              <CardDescription>Jumlah siswa berdasarkan jenjang pendidikan</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(stats?.siswaJenjang || [], 'siswa-per-jenjang')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats?.siswaJenjang || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {(stats?.siswaJenjang || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Posyandu per Kategori */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Baby className="w-5 h-5 text-pink-500" />
                Kategori Posyandu
              </CardTitle>
              <CardDescription>Distribusi berdasarkan kategori</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(stats?.posyanduKategori || [], 'kategori-posyandu')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.posyanduKategori || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats?.posyanduKategori || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Jenis Tendik */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-purple-500" />
                Jenis Tendik Guru
              </CardTitle>
              <CardDescription>Distribusi berdasarkan jenis tenaga pendidik</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(stats?.jenisTendik || [], 'jenis-tendik')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.jenisTendik || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {(stats?.jenisTendik || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-orange-500" />
            Ringkasan Data
          </CardTitle>
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
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-500" />
                      Guru
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {stats?.guruGender?.find(g => g.name === 'L')?.value || 0}
                  </TableCell>
                  <TableCell className="text-center">
                    {stats?.guruGender?.find(g => g.name === 'P')?.value || 0}
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {stats?.totalGuru || 0}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-cyan-500" />
                      Siswa
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {stats?.siswaGender?.find(g => g.name === 'L')?.value || 0}
                  </TableCell>
                  <TableCell className="text-center">
                    {stats?.siswaGender?.find(g => g.name === 'P')?.value || 0}
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {stats?.totalSiswa || 0}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Baby className="w-4 h-4 text-pink-500" />
                      Posyandu
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {stats?.posyanduGender?.find(g => g.name === 'L')?.value || 0}
                  </TableCell>
                  <TableCell className="text-center">
                    {stats?.posyanduGender?.find(g => g.name === 'P')?.value || 0}
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {stats?.totalPosyandu || 0}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-amber-500" />
                      Relawan
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {stats?.relawanGender?.find(g => g.name === 'L')?.value || 0}
                  </TableCell>
                  <TableCell className="text-center">
                    {stats?.relawanGender?.find(g => g.name === 'P')?.value || 0}
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {stats?.totalRelawan || 0}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-emerald-50 dark:bg-emerald-900/20">
                  <TableCell className="font-bold">Total Keseluruhan</TableCell>
                  <TableCell className="text-center font-bold">
                    {(stats?.guruGender?.find(g => g.name === 'L')?.value || 0) +
                     (stats?.siswaGender?.find(g => g.name === 'L')?.value || 0) +
                     (stats?.posyanduGender?.find(g => g.name === 'L')?.value || 0) +
                     (stats?.relawanGender?.find(g => g.name === 'L')?.value || 0)}
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {(stats?.guruGender?.find(g => g.name === 'P')?.value || 0) +
                     (stats?.siswaGender?.find(g => g.name === 'P')?.value || 0) +
                     (stats?.posyanduGender?.find(g => g.name === 'P')?.value || 0) +
                     (stats?.relawanGender?.find(g => g.name === 'P')?.value || 0)}
                  </TableCell>
                  <TableCell className="text-center font-bold text-emerald-600">
                    {(stats?.totalGuru || 0) + (stats?.totalSiswa || 0) + (stats?.totalPosyandu || 0) + (stats?.totalRelawan || 0)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// Rekapitulasi Sekolah Component
function RekapitulasiSekolah({ schoolData, onExport }: { 
  schoolData: SchoolData[]; 
  onExport: () => void;
}) {
  const totalGuruL = schoolData.reduce((sum, s) => sum + s.guruL, 0);
  const totalGuruP = schoolData.reduce((sum, s) => sum + s.guruP, 0);
  const totalSiswaL = schoolData.reduce((sum, s) => sum + s.siswaL, 0);
  const totalSiswaP = schoolData.reduce((sum, s) => sum + s.siswaP, 0);
  const grandTotal = schoolData.reduce((sum, s) => sum + s.total, 0);

  // Prepare chart data
  const chartData = schoolData.slice(0, 10).map(s => ({
    name: s.namaSekolah.length > 20 ? s.namaSekolah.substring(0, 20) + '...' : s.namaSekolah,
    Guru: s.guruTotal,
    Siswa: s.siswaTotal,
  }));

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <School className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Sekolah</p>
                <p className="text-3xl font-bold">{schoolData.length.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Guru</p>
                <p className="text-3xl font-bold">{(totalGuruL + totalGuruP).toLocaleString()}</p>
                <p className="text-xs text-slate-400">L: {totalGuruL} | P: {totalGuruP}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Siswa</p>
                <p className="text-3xl font-bold">{(totalSiswaL + totalSiswaP).toLocaleString()}</p>
                <p className="text-xs text-slate-400">L: {totalSiswaL} | P: {totalSiswaP}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            Distribusi Guru & Siswa per Sekolah
          </CardTitle>
          <CardDescription>Top 10 sekolah dengan data terbanyak</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="Guru" fill="#10b981" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Siswa" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-orange-500" />
              Rekapitulasi per Sekolah
            </CardTitle>
            <CardDescription>Data guru dan siswa per sekolah</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white dark:bg-slate-900 z-10">
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Sekolah</TableHead>
                  <TableHead>Jenjang</TableHead>
                  <TableHead className="text-center">Guru L</TableHead>
                  <TableHead className="text-center">Guru P</TableHead>
                  <TableHead className="text-center">Total Guru</TableHead>
                  <TableHead className="text-center">Siswa L</TableHead>
                  <TableHead className="text-center">Siswa P</TableHead>
                  <TableHead className="text-center">Total Siswa</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schoolData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                      Tidak ada data sekolah
                    </TableCell>
                  </TableRow>
                ) : (
                  schoolData.map((school, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell className="font-medium">{school.namaSekolah}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{school.jenjang || '-'}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{school.guruL}</TableCell>
                      <TableCell className="text-center">{school.guruP}</TableCell>
                      <TableCell className="text-center font-medium">{school.guruTotal}</TableCell>
                      <TableCell className="text-center">{school.siswaL}</TableCell>
                      <TableCell className="text-center">{school.siswaP}</TableCell>
                      <TableCell className="text-center font-medium">{school.siswaTotal}</TableCell>
                      <TableCell className="text-center font-bold text-emerald-600">{school.total}</TableCell>
                    </TableRow>
                  ))
                )}
                {schoolData.length > 0 && (
                  <TableRow className="bg-emerald-50 dark:bg-emerald-900/20 font-bold">
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-center">{totalGuruL}</TableCell>
                    <TableCell className="text-center">{totalGuruP}</TableCell>
                    <TableCell className="text-center">{totalGuruL + totalGuruP}</TableCell>
                    <TableCell className="text-center">{totalSiswaL}</TableCell>
                    <TableCell className="text-center">{totalSiswaP}</TableCell>
                    <TableCell className="text-center">{totalSiswaL + totalSiswaP}</TableCell>
                    <TableCell className="text-center text-emerald-600">{grandTotal}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// Rekapitulasi 3B Component (Balita, Bumil, Bumil Menyusui)
function Rekapitulasi3B({ rekap3BData, onExport }: { 
  rekap3BData: Rekap3BData[]; 
  onExport: () => void;
}) {
  const totalBalitaL = rekap3BData.reduce((sum, s) => sum + s.balitaL, 0);
  const totalBalitaP = rekap3BData.reduce((sum, s) => sum + s.balitaP, 0);
  const totalBumil = rekap3BData.reduce((sum, s) => sum + s.bumil, 0);
  const totalMenyusui = rekap3BData.reduce((sum, s) => sum + s.menyusui, 0);
  const totalLansia = rekap3BData.reduce((sum, s) => sum + s.lansia, 0);
  const grandTotal = rekap3BData.reduce((sum, s) => sum + s.total, 0);

  // Chart data
  const chartData = rekap3BData.slice(0, 10).map(s => ({
    name: s.posyandu.length > 15 ? s.posyandu.substring(0, 15) + '...' : s.posyandu,
    Balita: s.balitaTotal,
    Bumil: s.bumil,
    Menyusui: s.menyusui,
    Lansia: s.lansia,
  }));

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-slate-500">Total Balita</p>
              <p className="text-2xl font-bold text-pink-500">{(totalBalitaL + totalBalitaP).toLocaleString()}</p>
              <p className="text-xs text-slate-400">L: {totalBalitaL} | P: {totalBalitaP}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-slate-500">Ibu Hamil</p>
              <p className="text-2xl font-bold text-purple-500">{totalBumil.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-slate-500">Ibu Menyusui</p>
              <p className="text-2xl font-bold text-cyan-500">{totalMenyusui.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-slate-500">Lansia</p>
              <p className="text-2xl font-bold text-amber-500">{totalLansia.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-slate-500">Total Keseluruhan</p>
              <p className="text-2xl font-bold text-emerald-500">{grandTotal.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-pink-500" />
            Distribusi Data 3B per Posyandu
          </CardTitle>
          <CardDescription>Top 10 Posyandu dengan data terbanyak</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="Balita" fill="#ec4899" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Bumil" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Menyusui" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Lansia" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-orange-500" />
              Rekapitulasi 3B per Posyandu
            </CardTitle>
            <CardDescription>Data Balita, Ibu Hamil, Ibu Menyusui, dan Lansia</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white dark:bg-slate-900 z-10">
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Posyandu</TableHead>
                  <TableHead className="text-center">Balita L</TableHead>
                  <TableHead className="text-center">Balita P</TableHead>
                  <TableHead className="text-center">Total Balita</TableHead>
                  <TableHead className="text-center">Ibu Hamil</TableHead>
                  <TableHead className="text-center">Ibu Menyusui</TableHead>
                  <TableHead className="text-center">Lansia</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rekap3BData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                      Tidak ada data posyandu
                    </TableCell>
                  </TableRow>
                ) : (
                  rekap3BData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell className="font-medium">{data.posyandu}</TableCell>
                      <TableCell className="text-center">{data.balitaL}</TableCell>
                      <TableCell className="text-center">{data.balitaP}</TableCell>
                      <TableCell className="text-center font-medium">{data.balitaTotal}</TableCell>
                      <TableCell className="text-center">{data.bumil}</TableCell>
                      <TableCell className="text-center">{data.menyusui}</TableCell>
                      <TableCell className="text-center">{data.lansia}</TableCell>
                      <TableCell className="text-center font-bold text-emerald-600">{data.total}</TableCell>
                    </TableRow>
                  ))
                )}
                {rekap3BData.length > 0 && (
                  <TableRow className="bg-emerald-50 dark:bg-emerald-900/20 font-bold">
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell className="text-center">{totalBalitaL}</TableCell>
                    <TableCell className="text-center">{totalBalitaP}</TableCell>
                    <TableCell className="text-center">{totalBalitaL + totalBalitaP}</TableCell>
                    <TableCell className="text-center">{totalBumil}</TableCell>
                    <TableCell className="text-center">{totalMenyusui}</TableCell>
                    <TableCell className="text-center">{totalLansia}</TableCell>
                    <TableCell className="text-center text-emerald-600">{grandTotal}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function SummaryCard({ title, total, icon: Icon, color, genderData }: {
  title: string;
  total: number;
  icon: React.ElementType;
  color: 'emerald' | 'cyan' | 'pink' | 'amber';
  genderData: Array<{ name: string; value: number }>;
}) {
  const colorClasses = {
    emerald: 'from-emerald-500 to-teal-600',
    cyan: 'from-cyan-500 to-blue-600',
    pink: 'from-pink-500 to-rose-600',
    amber: 'from-amber-500 to-orange-600',
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-3xl font-bold">{total.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          {genderData.map((g) => (
            <div key={g.name} className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {g.name === 'L' ? 'Laki-laki' : 'Perempuan'}
              </Badge>
              <span className="font-medium">{g.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
