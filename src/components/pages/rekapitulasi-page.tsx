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
  Users, GraduationCap, Baby
} from 'lucide-react';

interface Stats {
  totalGuru: number;
  totalSiswa: number;
  totalPosyandu: number;
  guruGender: Array<{ name: string; value: number }>;
  siswaGender: Array<{ name: string; value: number }>;
  posyanduGender: Array<{ name: string; value: number }>;
  guruSekolah: Array<{ name: string; value: number }>;
  siswaSekolah: Array<{ name: string; value: number }>;
  siswaJenjang: Array<{ name: string; value: number }>;
  posyanduList: Array<{ name: string; value: number }>;
  posyanduKategori: Array<{ name: string; value: number }>;
  jenisTendik: Array<{ name: string; value: number }>;
}

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

export function RekapitulasiPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <TableRow className="bg-emerald-50 dark:bg-emerald-900/20">
                  <TableCell className="font-bold">Total Keseluruhan</TableCell>
                  <TableCell className="text-center font-bold">
                    {(stats?.guruGender?.find(g => g.name === 'L')?.value || 0) +
                     (stats?.siswaGender?.find(g => g.name === 'L')?.value || 0) +
                     (stats?.posyanduGender?.find(g => g.name === 'L')?.value || 0)}
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {(stats?.guruGender?.find(g => g.name === 'P')?.value || 0) +
                     (stats?.siswaGender?.find(g => g.name === 'P')?.value || 0) +
                     (stats?.posyanduGender?.find(g => g.name === 'P')?.value || 0)}
                  </TableCell>
                  <TableCell className="text-center font-bold text-emerald-600">
                    {(stats?.totalGuru || 0) + (stats?.totalSiswa || 0) + (stats?.totalPosyandu || 0)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ title, total, icon: Icon, color, genderData }: {
  title: string;
  total: number;
  icon: React.ElementType;
  color: 'emerald' | 'cyan' | 'pink';
  genderData: Array<{ name: string; value: number }>;
}) {
  const colorClasses = {
    emerald: 'from-emerald-500 to-teal-600 text-emerald-500',
    cyan: 'from-cyan-500 to-blue-600 text-cyan-500',
    pink: 'from-pink-500 to-rose-600 text-pink-500',
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[color].split(' ').slice(0, 2).join(' ')} flex items-center justify-center shadow-lg`}>
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
