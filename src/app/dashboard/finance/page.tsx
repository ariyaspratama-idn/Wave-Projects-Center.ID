"use client";

import { useEffect, useState } from "react";

export default function FinanceDashboard() {
    const [finance, setFinance] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({ type: 'INCOME', amount: '', category: 'DP Pesanan', description: '', orderId: '' });
    const [saving, setSaving] = useState(false);

    const fetchLedger = () => {
        const token = localStorage.getItem("wave_token");
        fetch("/api/v1/admin/finance", { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setFinance(data.data);
                }
                setLoading(false);
            });
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
            body: JSON.stringify({ ...form, amount: Number(form.amount) })
        });
        setSaving(false);
        setForm({ type: 'INCOME', amount: '', category: 'DP Pesanan', description: '', orderId: '' });
        fetchLedger();
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold gradient-text">Buku Kas & Laporan Keuangan</h1>
                <p className="text-gray-400 mt-2">Hitung otomatis profit bersih (Laba-Rugi) proyek setelah dipotong biaya operasional.</p>
            </div>

            {loading ? <p>Mapping Financial Ledgers...</p> : (
                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Financial Summary */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass p-6 rounded-2xl border-t-4 border-l border-r border-b border-white/5 border-t-green-500">
                            <p className="text-gray-400 text-sm mb-1">Total Pemasukan (Omzet)</p>
                            <h3 className="text-3xl font-extrabold text-green-400">Rp {finance?.summary?.totalIncome?.toLocaleString("id-ID")}</h3>
                        </div>
                        <div className="glass p-6 rounded-2xl border-t-4 border-l border-r border-b border-white/5 border-t-red-500">
                            <p className="text-gray-400 text-sm mb-1">Total Pengeluaran (Beban)</p>
                            <h3 className="text-3xl font-extrabold text-red-500">Rp {finance?.summary?.totalExpense?.toLocaleString("id-ID")}</h3>
                        </div>
                        <div className={`glass p-6 rounded-2xl border-t-4 border-l border-r border-b border-white/5 ${finance?.summary?.profit > 0 ? 'border-t-primary' : 'border-t-orange-500'}`}>
                            <p className="text-gray-400 text-sm mb-1">Laba / Rugi Bersih (Net Profit)</p>
                            <h3 className="text-3xl font-extrabold text-white">Rp {finance?.summary?.profit?.toLocaleString("id-ID")}</h3>
                        </div>
                    </div>

                    {/* Entry Form */}
                    <div className="lg:col-span-1 glass p-6 rounded-2xl border border-white/5 h-fit">
                        <h3 className="text-lg font-bold mb-4">Catat Arus Kas Baru</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="text-xs mb-1 block text-gray-400">Jenis Transaksi</label>
                                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-[#0a0f1e] px-3 py-2 rounded-lg text-sm outline-none border border-white/10 text-white">
                                    <option value="INCOME">Pemasukan (+)</option>
                                    <option value="EXPENSE">Pengeluaran (-)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs mb-1 block text-gray-400">Kategori</label>
                                <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Misal: Biaya Langganan Vercel" className="w-full bg-[#0a0f1e] px-3 py-2 rounded-lg text-sm outline-none border border-white/10" required />
                            </div>
                            <div>
                                <label className="text-xs mb-1 block text-gray-400">Nominal (Rp)</label>
                                <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full bg-[#0a0f1e] px-3 py-2 rounded-lg text-sm outline-none border border-white/10" required />
                            </div>
                            <div>
                                <label className="text-xs mb-1 block text-gray-400">Terkait Order ID (Opsional)</label>
                                <input type="number" value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })} placeholder="Biarkan kosong jika operasional lepas" className="w-full bg-[#0a0f1e] px-3 py-2 rounded-lg text-sm outline-none border border-white/10" />
                            </div>
                            <div>
                                <label className="text-xs mb-1 block text-gray-400">Keterangan / Memo</label>
                                <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-[#0a0f1e] px-3 py-2 rounded-lg text-sm outline-none border border-white/10" />
                            </div>
                            <button type="submit" disabled={saving} className="w-full py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-lg transition-all text-sm">
                                {saving ? 'Menyimpan...' : 'Simpan Transaksi Rekap'}
                            </button>
                        </form>
                    </div>

                    {/* Ledger Book */}
                    <div className="lg:col-span-2 glass p-6 rounded-2xl border border-white/5">
                        <h3 className="text-lg font-bold mb-4">Riwayat Buku Kas</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-white/5">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-lg">Waktu</th>
                                        <th className="px-4 py-3">ID Order</th>
                                        <th className="px-4 py-3">Kategori & Memo</th>
                                        <th className="px-4 py-3 text-right rounded-tr-lg">Nominal (Rp)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {finance?.ledger?.map((l: any, idx: number) => (
                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 text-xs text-gray-500 w-32">{new Date(l.created_at).toLocaleDateString()}<br />{new Date(l.created_at).toLocaleTimeString()}</td>
                                            <td className="px-4 py-3 text-gray-400 font-mono text-xs">{l.order_id ? `#${l.order_id.toString().padStart(4, '0')}` : '-'}</td>
                                            <td className="px-4 py-3">
                                                <p className="font-semibold">{l.category}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{l.description}</p>
                                            </td>
                                            <td className={`px-4 py-3 text-right font-bold ${l.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}`}>
                                                {l.type === 'INCOME' ? '+' : '-'} {Number(l.amount).toLocaleString("id-ID")}
                                            </td>
                                        </tr>
                                    ))}
                                    {!finance?.ledger || finance.ledger.length === 0 && (
                                        <tr><td colSpan={4} className="text-center py-8 text-gray-500">Belum ada catatan pembukuan masuk/keluar.</td></tr>
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
