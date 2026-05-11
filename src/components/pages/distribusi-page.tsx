'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Treemap, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PieChart as PieChartIcon, BarChart3, MapPin, TrendingUp,
  Users, GraduationCap, Baby, School
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

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16'];

export function DistribusiPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('guru');

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

  if (loading) {
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
            <p className="text-sm text-slate-500">Analisis distribusi data berdasarkan lokasi dan kategori</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="guru" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Guru
          </TabsTrigger>
          <TabsTrigger value="siswa" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Siswa
          </TabsTrigger>
          <TabsTrigger value="posyandu" className="flex items-center gap-2">
            <Baby className="w-4 h-4" />
            Posyandu
          </TabsTrigger>
        </TabsList>

        {/* Guru Tab */}
        <TabsContent value="guru" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sekolah Distribution */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="w-5 h-5 text-emerald-500" />
                  Distribusi per Sekolah
                </CardTitle>
                <CardDescription>Lokasi penyebaran guru berdasarkan sekolah</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={stats?.guruSekolah?.slice(0, 10) || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar dataKey="value" name="Jumlah Guru" radius={[4, 4, 0, 0]}>
                      {(stats?.guruSekolah?.slice(0, 10) || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gender Distribution */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-teal-500" />
                  Distribusi Gender
                </CardTitle>
                <CardDescription>Perbandingan guru laki-laki dan perempuan</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={stats?.guruGender || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name === 'L' ? 'Laki-laki' : 'Perempuan'} (${(percent * 100).toFixed(1)}%)`}
                    >
                      {(stats?.guruGender || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f472b6'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Jenis Tendik */}
            <Card className="border-0 shadow-lg lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  Jenis Tenaga Pendidik
                </CardTitle>
                <CardDescription>Distribusi berdasarkan jenis tenaga pendidik</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats?.jenisTendik || []} layout="vertical">
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
                    <Bar dataKey="value" name="Jumlah" radius={[0, 4, 4, 0]}>
                      {(stats?.jenisTendik || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Siswa Tab */}
        <TabsContent value="siswa" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Jenjang Distribution */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="w-5 h-5 text-cyan-500" />
                  Distribusi per Jenjang
                </CardTitle>
                <CardDescription>Penyebaran siswa berdasarkan jenjang pendidikan</CardDescription>
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
                    <Bar dataKey="value" name="Jumlah Siswa" radius={[4, 4, 0, 0]}>
                      {(stats?.siswaJenjang || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gender Distribution */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-blue-500" />
                  Distribusi Gender
                </CardTitle>
                <CardDescription>Perbandingan siswa laki-laki dan perempuan</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={stats?.siswaGender || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name === 'L' ? 'Laki-laki' : 'Perempuan'} (${(percent * 100).toFixed(1)}%)`}
                    >
                      {(stats?.siswaGender || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#06b6d4' : '#f472b6'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* School Distribution */}
            <Card className="border-0 shadow-lg lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-500" />
                  Distribusi per Sekolah
                </CardTitle>
                <CardDescription>Top 10 sekolah dengan siswa terbanyak</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={stats?.siswaSekolah?.slice(0, 10) || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={200} tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar dataKey="value" name="Jumlah Siswa" radius={[0, 4, 4, 0]}>
                      {(stats?.siswaSekolah?.slice(0, 10) || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Posyandu Tab */}
        <TabsContent value="posyandu" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Kategori Distribution */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-pink-500" />
                  Distribusi Kategori
                </CardTitle>
                <CardDescription>Penyebaran berdasarkan kategori posyandu</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={stats?.posyanduKategori || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
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

            {/* Gender Distribution */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-rose-500" />
                  Distribusi Gender
                </CardTitle>
                <CardDescription>Perbandingan data laki-laki dan perempuan</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={stats?.posyanduGender || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name === 'L' ? 'Laki-laki' : 'Perempuan'} (${(percent * 100).toFixed(1)}%)`}
                    >
                      {(stats?.posyanduGender || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#ec4899' : '#f472b6'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Posyandu Location Distribution */}
            <Card className="border-0 shadow-lg lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  Distribusi per Lokasi Posyandu
                </CardTitle>
                <CardDescription>Top 10 lokasi posyandu dengan data terbanyak</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={stats?.posyanduList?.slice(0, 10) || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar dataKey="value" name="Jumlah Data" radius={[4, 4, 0, 0]}>
                      {(stats?.posyanduList?.slice(0, 10) || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Total Sekolah (Guru)</p>
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                  {stats?.guruSekolah?.length || 0}
                </p>
              </div>
              <School className="w-10 h-10 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-600 dark:text-cyan-400">Total Sekolah (Siswa)</p>
                <p className="text-3xl font-bold text-cyan-700 dark:text-cyan-300">
                  {stats?.siswaSekolah?.length || 0}
                </p>
              </div>
              <School className="w-10 h-10 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-pink-600 dark:text-pink-400">Total Lokasi Posyandu</p>
                <p className="text-3xl font-bold text-pink-700 dark:text-pink-300">
                  {stats?.posyanduList?.length || 0}
                </p>
              </div>
              <MapPin className="w-10 h-10 text-pink-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
