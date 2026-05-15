'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users, GraduationCap, Baby, TrendingUp, Activity,
  ArrowUpRight, ArrowDownRight, Calendar, HeartHandshake
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
  recentActivities: Array<{ id: string; action: string; details: string | null; createdAt: string }>;
}

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function DashboardPage() {
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

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-4 p-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatsCard
          title="Total Guru"
          value={stats?.totalGuru || 0}
          icon={GraduationCap}
          gradient="from-emerald-500 to-teal-600"
          trend="+12%"
          trendUp={true}
        />
        <StatsCard
          title="Total Siswa"
          value={stats?.totalSiswa || 0}
          icon={Users}
          gradient="from-cyan-500 to-blue-600"
          trend="+8%"
          trendUp={true}
        />
        <StatsCard
          title="Data Posyandu"
          value={stats?.totalPosyandu || 0}
          icon={Baby}
          gradient="from-pink-500 to-rose-600"
          trend="+5%"
          trendUp={true}
        />
        <StatsCard
          title="Data Relawan"
          value={stats?.totalRelawan || 0}
          icon={HeartHandshake}
          gradient="from-amber-500 to-orange-600"
          trend="+3%"
          trendUp={true}
        />
        <StatsCard
          title="Total Data"
          value={(stats?.totalGuru || 0) + (stats?.totalSiswa || 0) + (stats?.totalPosyandu || 0) + (stats?.totalRelawan || 0)}
          icon={Activity}
          gradient="from-purple-500 to-indigo-600"
          trend="+10%"
          trendUp={true}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gender Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              Distribusi Jenis Kelamin
            </CardTitle>
            <CardDescription>Perbandingan gender di setiap kategori</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <GenderPieChart data={stats?.guruGender || []} title="Guru" color="#10b981" />
              <GenderPieChart data={stats?.siswaGender || []} title="Siswa" color="#06b6d4" />
              <GenderPieChart data={stats?.posyanduGender || []} title="Posyandu" color="#ec4899" />
              <GenderPieChart data={stats?.relawanGender || []} title="Relawan" color="#f59e0b" />
            </div>
          </CardContent>
        </Card>

        {/* School Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-cyan-500" />
              Distribusi Guru per Sekolah
            </CardTitle>
            <CardDescription>Top 10 sekolah dengan guru terbanyak</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.guruSekolah?.slice(0, 8) || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]}>
                  {stats?.guruSekolah?.slice(0, 8).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Siswa Jenjang */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Distribusi Siswa per Jenjang
            </CardTitle>
            <CardDescription>Jumlah siswa berdasarkan jenjang pendidikan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                  {stats?.siswaJenjang?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Posyandu Kategori */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Baby className="w-5 h-5 text-pink-500" />
              Kategori Posyandu
            </CardTitle>
            <CardDescription>Distribusi data berdasarkan kategori</CardDescription>
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
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {stats?.posyanduKategori?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            Aktivitas Terbaru
          </CardTitle>
          <CardDescription>Log aktivitas sistem terkini</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivities?.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.action === 'LOGIN' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-xs text-slate-500">{activity.details}</p>
                </div>
                <div className="text-xs text-slate-400">
                  {new Date(activity.createdAt).toLocaleString('id-ID')}
                </div>
              </motion.div>
            ))}
            {(!stats?.recentActivities || stats.recentActivities.length === 0) && (
              <p className="text-center text-slate-500 py-4">Tidak ada aktivitas terbaru</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, gradient, trend, trendUp }: {
  title: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="relative overflow-hidden"
    >
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</p>
              <p className="text-xl font-bold mt-0.5">{value.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                {trendUp ? (
                  <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-500" />
                )}
                <span className={`text-xs font-medium ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                  {trend}
                </span>
                <span className="text-[10px] text-slate-400">dari bulan lalu</span>
              </div>
            </div>
            <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function GenderPieChart({ data, title, color }: { data: Array<{ name: string; value: number }>; title: string; color: string }) {
  return (
    <div className="text-center">
      <p className="text-xs font-medium mb-1">{title}</p>
      <ResponsiveContainer width="100%" height={100}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={20}
            outerRadius={38}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? color : '#94a3b8'} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-1.5 text-xs">
        {data.map((item, index) => (
          <Badge key={item.name} variant="outline" className="text-[9px] px-1.5 py-0">
            {item.name}: {item.value}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="border-0 shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
