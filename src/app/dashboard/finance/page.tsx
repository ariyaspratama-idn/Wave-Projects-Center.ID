"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function FinanceDashboard() {
    const [finance, setFinance] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({ type: 'EXPENSE', amount: '', category: 'Biaya Server / Operasional', description: '', orderId: '' });
    const [saving, setSaving] = useState(false);
    const [chartData, setChartData] = useState<any[]>([]);

    const fetchLedger = () => {
        const token = localStorage.getItem("wave_token");
        fetch("/api/v1/admin/finance", { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setFinance(data.data);
                    processChartData(data.data.ledger);
                }
                setLoading(false);
            });
    };

    const processChartData = (ledger: any[]) => {
        if (!ledger || ledger.length === 0) return;

        // Group by Date
        const grouped: Record<string, { date: string, income: number, expense: number }> = {};

        // Sort ledger from oldest to newest for the chart
        const sortedLedger = [...ledger].reverse();

        sortedLedger.forEach(l => {
            const dateStr = new Date(l.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
            if (!grouped[dateStr]) grouped[dateStr] = { date: dateStr, income: 0, expense: 0 };

            const amt = Number(l.amount);
            if (l.type === 'INCOME') grouped[dateStr].income += amt;
            else if (l.type === 'EXPENSE') grouped[dateStr].expense += amt;
        });

        // Convert object to array
        const finalData = Object.values(grouped);
        setChartData(finalData);
    };

    useEffect(() => {
        fetchLedger();
    }, []);

    const handleSave = async (e: any) => {
        e.preventDefault();
        setSaving(true);
        const token = localStorage.getItem("wave_token");
        await fetch("/api/v1/admin/finance", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ ...form, amount: Number(form.amount), type: 'EXPENSE' }) // Force EXPENSE
        });
        setSaving(false);
        setForm({ type: 'EXPENSE', amount: '', category: 'Biaya Server / Operasional', description: '', orderId: '' });
        fetchLedger();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold gradient-text">Manajemen Keuangan & Analisis</h1>
                    <p className="text-gray-400 mt-2">Buku kas komprehensif. Pemasukan (Omzet) kini direkam <strong className="text-primary">secara otomatis</strong> ketika ada validasi pembayaran DP atau Pelunasan.</p>
                </div>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-6">
                    <div className="h-24 bg-white/5 rounded-2xl w-full"></div>
                    <div className="h-64 bg-white/5 rounded-2xl w-full"></div>
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Financial Summary */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass p-6 rounded-2xl border-t-4 border-l border-r border-b border-white/5 border-t-emerald-500 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                            <div className="absolute -right-6 -top-6 text-emerald-500/10 text-9xl group-hover:scale-110 transition-transform">💰</div>
                            <p className="text-gray-400 text-sm mb-1 font-semibold uppercase tracking-wider">Total Pemasukan (Omzet)</p>
                            <h3 className="text-3xl font-extrabold text-emerald-400 relative z-10">Rp {finance?.summary?.totalIncome?.toLocaleString("id-ID")}</h3>
                        </div>
                        <div className="glass p-6 rounded-2xl border-t-4 border-l border-r border-b border-white/5 border-t-rose-500 relative overflow-hidden group hover:border-rose-500/50 transition-all">
                            <div className="absolute -right-6 -top-6 text-rose-500/10 text-9xl group-hover:scale-110 transition-transform">📉</div>
                            <p className="text-gray-400 text-sm mb-1 font-semibold uppercase tracking-wider">Total Pengeluaran (Beban)</p>
                            <h3 className="text-3xl font-extrabold text-rose-500 relative z-10">Rp {finance?.summary?.totalExpense?.toLocaleString("id-ID")}</h3>
                        </div>
                        <div className={`glass p-6 rounded-2xl border-t-4 border-l border-r border-b border-white/5 relative overflow-hidden group transition-all ${finance?.summary?.profit > 0 ? 'border-t-primary hover:border-primary/50' : 'border-t-orange-500 hover:border-orange-500/50'}`}>
                            <div className={`absolute -right-6 -top-6 text-9xl group-hover:scale-110 transition-transform ${finance?.summary?.profit > 0 ? 'text-primary/10' : 'text-orange-500/10'}`}>🏛️</div>
                            <p className="text-gray-400 text-sm mb-1 font-semibold uppercase tracking-wider">Laba Bersih (Net Profit)</p>
                            <h3 className="text-3xl font-extrabold text-white relative z-10">Rp {finance?.summary?.profit?.toLocaleString("id-ID")}</h3>
                        </div>
                    </div>

                    {/* CHART AREA */}
                    <div className="lg:col-span-3 glass p-6 rounded-2xl border border-white/5">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">📊 Arus Kas (Berdasarkan Waktu)</h3>
                        <div className="h-[300px] w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(1)}M`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0a0f1e', borderColor: '#ffffff20', borderRadius: '8px' }}
                                            itemStyle={{ fontWeight: 'bold' }}
                                            formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, undefined]}
                                        />
                                        <Area type="monotone" dataKey="income" name="Pemasukan" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                        <Area type="monotone" dataKey="expense" name="Pengeluaran" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-500 italic">Data arus kas belum cukup untuk digambarkan pada grafik.</div>
                            )}
                        </div>
                    </div>

                    {/* Entry Form */}
                    <div className="lg:col-span-1 glass p-6 rounded-2xl border border-white/5 h-fit relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 blur-sm pointer-events-none text-9xl">💸</div>
                        <h3 className="text-lg font-bold mb-4 relative z-10 text-rose-300">Catat Beban Pengeluaran Eksternal</h3>
                        <p className="text-[10px] text-gray-400 mb-6 bg-white/5 p-2 rounded border border-white/10">Buku kas penerimaan (omzet) telah diautomasi. Formulir ini hanya digunakan untuk pencatatan uang keluar seperti Gaji Karyawan atau Biaya Server.</p>

                        <form onSubmit={handleSave} className="space-y-4 relative z-10">
                            <div>
                                <label className="text-xs mb-1 block text-rose-300 font-bold uppercase tracking-wide">Jenis Transaksi</label>
                                <div className="w-full bg-rose-500/10 px-3 py-2.5 rounded-lg text-sm border border-rose-500/30 text-rose-400 font-bold flex items-center justify-between">
                                    <span>Pengeluaran (Beban / Expense)</span>
                                    <span>➖</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs mb-1 block text-gray-400">Kategori Subjek Pengeluaran</label>
                                <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Misal: Biaya Langganan Vercel, Gaji CS" className="w-full bg-[#0a0f1e] px-3 py-2.5 rounded-lg text-sm outline-none border border-white/10 focus:border-rose-500/50 transition-colors text-white" required />
                            </div>
                            <div>
                                <label className="text-xs mb-1 block text-gray-400">Nominal (Rp)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-500 text-sm">Rp</span>
                                    <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full bg-[#0a0f1e] pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none border border-white/10 focus:border-rose-500/50 transition-colors text-white font-mono" required />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs mb-1 block text-gray-400">Terkait Order ID (Opsional)</label>
                                <input type="number" value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })} placeholder="Biarkan kosong jika ini pengeluaran operasional lepas" className="w-full bg-[#0a0f1e] px-3 py-2.5 rounded-lg text-sm outline-none border border-white/10 focus:border-white/30 transition-colors text-white font-mono" />
                            </div>
                            <div>
                                <label className="text-xs mb-1 block text-gray-400">Keterangan / Memo</label>
                                <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-[#0a0f1e] px-3 py-2.5 rounded-lg text-sm outline-none border border-white/10 focus:border-white/30 transition-colors text-white" />
                            </div>
                            <button type="submit" disabled={saving} className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold rounded-lg transition-all text-sm shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                                {saving ? '🔄 MEREKAM TRANSAKSI...' : '➖ SIMPAN PENGELUARAN BARU'}
                            </button>
                        </form>
                    </div>

                    {/* Ledger Book */}
                    <div className="lg:col-span-2 glass p-6 rounded-2xl border border-white/5 flex flex-col h-full">
                        <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                            <span>Buku Besar (Ledger)</span>
                            <span className="text-xs font-normal text-gray-400 px-3 py-1 bg-white/5 rounded-full border border-white/10">Riwayat {finance?.ledger?.length || 0} Data</span>
                        </h3>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-gray-400 uppercase bg-white/5 tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-lg">Waktu</th>
                                        <th className="px-4 py-3">ID Order / Proyek</th>
                                        <th className="px-4 py-3">Kategori & Memo</th>
                                        <th className="px-4 py-3 text-right rounded-tr-lg">Nominal Transaksi (Rp)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {finance?.ledger?.map((l: any, idx: number) => (
                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="px-4 py-3 w-36">
                                                <span className="text-xs text-gray-300 font-bold block">{new Date(l.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                <span className="text-[10px] text-gray-500">{new Date(l.created_at).toLocaleTimeString('id-ID')}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {l.order_id ? (
                                                    <a href={`/dashboard/orders/${l.order_id}`} className="text-gray-300 font-mono text-xs font-bold hover:text-primary transition-colors">#{l.order_id.toString().padStart(4, '0')} 🔗</a>
                                                ) : (
                                                    <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded border border-white/5">- (Operasional)</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className={`text-xs font-extrabold uppercase tracking-wide inline-block mb-1 ${l.type === 'INCOME' ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>{l.category}</p>
                                                <p className="text-xs text-gray-300">{l.description}</p>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`px-3 py-1.5 rounded-lg border text-sm font-extrabold ${l.type === 'INCOME' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.1)]'}`}>
                                                    {l.type === 'INCOME' ? '+' : '-'} Rp {Number(l.amount).toLocaleString("id-ID")}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {!finance?.ledger || finance.ledger.length === 0 && (
                                        <tr><td colSpan={4} className="text-center py-12 text-gray-500 italic bg-white/5 rounded-b-xl border-t border-white/5">Belum ada catatan pembukuan masuk maupun keluar.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
