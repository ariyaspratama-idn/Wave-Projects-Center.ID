"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

    const payBadge = (s: string) => {
        if (s === 'paid') return { label: 'Lunas', color: 'text-green-400 bg-green-500/20 border-green-500/30' };
        if (s === 'dp_paid') return { label: 'DP 30%', color: 'text-orange-400 bg-orange-500/20 border-orange-500/30' };
        if (s === 'waiting_verification') return { label: 'Menunggu', color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' };
        return { label: 'Unpaid', color: 'text-red-400 bg-red-500/20 border-red-500/30' };
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold gradient-text">Selamat Datang, {user.name} 👋</h1>
                <p className="text-gray-400 mt-2">
                    Ringkasan bisnis Wave Projects Center. Anda masuk sebagai <span className="text-white font-medium bg-white/10 px-2 py-0.5 rounded text-xs">{roleName}</span>
                </p>
            </div>

            {/* Stat Cards - 5 key metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="glass rounded-xl p-5 border border-white/5 hover:-translate-y-1 transition-transform">
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-2">💰 Total Revenue</p>
                    <h3 className="text-xl font-extrabold text-white">Rp {stats ? (stats.summary.totalRevenue / 1000000).toFixed(1) : '0'}Jt</h3>
                    <p className="text-[10px] text-gray-500 mt-1">Seluruh pesanan masuk</p>
                </div>
                <div className="glass rounded-xl p-5 border border-green-500/20 hover:-translate-y-1 transition-transform">
                    <p className="text-[11px] text-green-500 font-bold uppercase tracking-widest mb-2">✅ Dana Masuk</p>
                    <h3 className="text-xl font-extrabold text-green-400">Rp {stats ? (stats.summary.paidRevenue / 1000000).toFixed(1) : '0'}Jt</h3>
                    <p className="text-[10px] text-gray-500 mt-1">Sudah divalidasi</p>
                </div>
                <div className="glass rounded-xl p-5 border border-yellow-500/20 hover:-translate-y-1 transition-transform">
                    <p className="text-[11px] text-yellow-500 font-bold uppercase tracking-widest mb-2">⏳ Belum Cair</p>
                    <h3 className="text-xl font-extrabold text-yellow-400">Rp {stats ? (stats.summary.pendingRevenue / 1000000).toFixed(1) : '0'}Jt</h3>
                    <p className="text-[10px] text-gray-500 mt-1">Menunggu validasi</p>
                </div>
                <div className="glass rounded-xl p-5 border border-blue-500/20 hover:-translate-y-1 transition-transform">
                    <p className="text-[11px] text-blue-500 font-bold uppercase tracking-widest mb-2">📦 Total Pesanan</p>
                    <h3 className="text-xl font-extrabold text-blue-400">{stats ? stats.summary.totalOrders : '0'}</h3>
                    <p className="text-[10px] text-gray-500 mt-1">Sepanjang waktu</p>
                </div>
                <div className="glass rounded-xl p-5 border border-purple-500/20 hover:-translate-y-1 transition-transform">
                    <p className="text-[11px] text-purple-500 font-bold uppercase tracking-widest mb-2">💬 Konsultasi AI</p>
                    <h3 className="text-xl font-extrabold text-purple-400">{stats ? stats.summary.totalChats : '0'}</h3>
                    <p className="text-[10px] text-gray-500 mt-1">Sesi chat aktif</p>
                </div>
            </div>

            {/* Two columns: Chart + Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Revenue Trend Bar Chart */}
                <div className="lg:col-span-2 glass rounded-xl p-6 border border-white/5">
                    <h3 className="font-bold mb-1 text-gray-200 text-sm">📊 Revenue Harian (14 Hari Terakhir)</h3>
                    <p className="text-[10px] text-gray-500 mb-4">Pendapatan harian berdasarkan tanggal order masuk</p>
                    <div className="h-[280px] w-full">
                        {stats && stats.trend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.trend} barSize={24}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                                    <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} width={70}
                                        tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}Jt` : `${(val / 1000).toFixed(0)}Rb`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', fontSize: '12px' }}
                                        formatter={(val: number) => [`Rp ${val.toLocaleString('id-ID')}`, 'Revenue']}
                                    />
                                    <Bar dataKey="revenue" fill="url(#blueGrad)" radius={[6, 6, 0, 0]} />
                                    <defs>
                                        <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                                            <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.5} />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-600 text-sm">Belum cukup data transaksi.</div>
                        )}
                    </div>
                </div>

                {/* Payment & Package Summary */}
                <div className="space-y-6">
                    {/* Payment Status Breakdown */}
                    <div className="glass rounded-xl p-5 border border-white/5">
                        <h3 className="font-bold text-gray-200 text-sm mb-3">💳 Status Pembayaran</h3>
                        {stats && stats.paymentBreakdown.length > 0 ? (
                            <div className="space-y-2">
                                {stats.paymentBreakdown.map((p: any, i: number) => {
                                    const b = payBadge(p.status);
                                    return (
                                        <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2.5">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${b.color}`}>{b.label}</span>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-white">{p.count} order</span>
                                                <span className="text-[10px] text-gray-500 block">Rp {Number(p.amount).toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-600 text-xs">Belum ada data.</p>
                        )}
                    </div>

                    {/* Package Demand */}
                    <div className="glass rounded-xl p-5 border border-white/5">
                        <h3 className="font-bold text-gray-200 text-sm mb-3">📦 Paket Terlaris</h3>
                        {stats && stats.packagesDemand.length > 0 ? (
                            <div className="space-y-2">
                                {stats.packagesDemand.map((p: any, i: number) => {
                                    const maxCount = Math.max(...stats.packagesDemand.map((x: any) => x.count));
                                    const pct = maxCount > 0 ? (p.count / maxCount) * 100 : 0;
                                    return (
                                        <div key={i}>
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-gray-300 font-medium truncate max-w-[120px]">{p.name}</span>
                                                <span className="text-gray-500">{p.count} order · Rp {Number(p.revenue / 1000000).toFixed(1)}Jt</span>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-2">
                                                <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-600 text-xs">Belum ada pemesanan.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="glass rounded-xl p-6 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-gray-200 text-sm">📋 Pesanan Terbaru</h3>
                        <p className="text-[10px] text-gray-500">5 pesanan terakhir yang masuk</p>
                    </div>
                    <Link href="/dashboard/orders" className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-500/30 transition-all">
                        Lihat Semua →
                    </Link>
                </div>
                {stats && stats.recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-white/10 text-gray-500 uppercase tracking-widest text-[10px]">
                                    <th className="py-2 text-left">ID</th>
                                    <th className="py-2 text-left">Klien</th>
                                    <th className="py-2 text-left">Paket</th>
                                    <th className="py-2 text-center">Pembayaran</th>
                                    <th className="py-2 text-right">Nominal</th>
                                    <th className="py-2 text-right">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map((o: any) => {
                                    const b = payBadge(o.paymentStatus);
                                    return (
                                        <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-3 font-bold text-blue-400">
                                                <Link href={`/dashboard/orders/${o.id}`} className="hover:underline">#{o.id}</Link>
                                            </td>
                                            <td className="py-3 text-white font-medium">{o.client}</td>
                                            <td className="py-3 text-gray-400">{o.package}</td>
                                            <td className="py-3 text-center">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${b.color}`}>{b.label}</span>
                                                {o.paymentChoice === 'DP_30' && <span className="text-[9px] text-gray-600 block mt-0.5">DP 30%</span>}
                                            </td>
                                            <td className="py-3 text-right font-bold text-white">Rp {Number(o.amount).toLocaleString('id-ID')}</td>
                                            <td className="py-3 text-right text-gray-500">{o.date}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-600 text-sm text-center py-6">Belum ada pesanan.</p>
                )}
            </div>

            {roleName === 'Customer' && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mt-4">
                    PERINGATAN: Analisis statistik lanjutan dibatasi. Klien hanya dapat melihat pesanan pribadi di menu "Pesanan Anda".
                </div>
            )}
        </div>
    );
}
