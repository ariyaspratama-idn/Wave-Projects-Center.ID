"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardIndex() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const cached = localStorage.getItem("wave_user");
        if (cached) setUser(JSON.parse(cached));

        const token = localStorage.getItem("wave_token");
        if (token) {
            fetch("/api/v1/admin/analytics", {
                headers: { "Authorization": `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) setStats(data.data);
                });
        }
    }, []);

    if (!user) return null;
    const roleName = user.roles && user.roles.length > 0 ? user.roles[0].name : "Customer";

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold gradient-text">Selamat Datang, {user.name} 👋</h1>
                <p className="text-gray-400 mt-2">
                    Laporan aktivitas harian Wave Projects Center. Anda masuk sebagai <span className="text-white font-medium bg-white/10 px-2 py-0.5 rounded text-xs">{roleName}</span>
                </p>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass rounded-2xl p-6 border border-white/5 border-l-4 border-l-blue-500 hover:-translate-y-1 transition-transform">
                    <p className="text-gray-400 text-sm mb-1">Total Pendapatan (Estimasi)</p>
                    <h3 className="text-3xl font-bold">Rp {stats ? stats.summary.totalRevenue.toLocaleString("id-ID") : "..."}</h3>
                </div>
                <div className="glass rounded-2xl p-6 border border-white/5 border-l-4 border-l-green-500 hover:-translate-y-1 transition-transform">
                    <p className="text-gray-400 text-sm mb-1">Pesanan Proyek</p>
                    <h3 className="text-3xl font-bold">{stats ? stats.summary.totalOrders : "..."}</h3>
                </div>
                <div className="glass rounded-2xl p-6 border border-white/5 border-l-4 border-l-purple-500 hover:-translate-y-1 transition-transform">
                    <p className="text-gray-400 text-sm mb-1">Total Konsultasi Aktif</p>
                    <h3 className="text-3xl font-bold">{stats ? stats.summary.totalChats : "..."}</h3>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">

                {/* Revenue Trend Line Chart */}
                <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/5 flex flex-col h-full">
                    <h3 className="font-bold mb-6 text-gray-200">Tren Pertumbuhan Harian</h3>
                    <div className="flex-1 min-h-0 w-full">
                        {stats && stats.trend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.trend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} width={80} tickFormatter={(val) => `Rp${(val / 1000000).toFixed(1)}M`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0a0f1e', borderColor: '#ffffff20', borderRadius: '12px' }}
                                        formatter={(val: number) => [`Rp ${val.toLocaleString('id-ID')}`, 'Pendapatan']}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 text-sm">Belum cukup data transaksi.</div>
                        )}
                    </div>
                </div>

                {/* Packages Popularity Pie Chart */}
                <div className="lg:col-span-1 glass rounded-2xl p-6 border border-white/5 flex flex-col h-full">
                    <h3 className="font-bold mb-6 text-gray-200">Dimensi Layanan</h3>
                    <div className="flex-1 min-h-0 w-full">
                        {stats && stats.packagesDemand.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={stats.packagesDemand} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {stats.packagesDemand.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#0a0f1e', borderColor: '#ffffff20', borderRadius: '12px' }} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 text-sm">Belum ada pemesanan layanan.</div>
                        )}
                    </div>
                </div>
            </div>

            {roleName === 'Customer' && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mt-8">
                    PERINGATAN: Analisis statistik lanjutan dibatasi. Klien hanya dapat melihat pesanan pribadi di menu "Pesanan Anda".
                </div>
            )}
        </div>
    );
}
