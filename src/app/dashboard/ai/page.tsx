"use client";

import { useEffect, useState } from "react";

const BUILTIN_RULES = [
    { emoji: "🎯", title: "Misi & Identitas", desc: "AI bernama 'Nova', konsultan digital Wave Projects Center.ID. Slogan: 'Bangun Software Impian Anda — Satu Ekosistem, Tanpa Ribet.'" },
    { emoji: "🔒", title: "Anti-Halusinasi", desc: "Dilarang keras mengarang, merekomendasikan, atau menjanjikan paket/fitur/harga di luar daftar paket yang ada di database." },
    { emoji: "💬", title: "Konsultan Aktif", desc: "Menggali kebutuhan klien, mencocokkan dengan paket terbaik, dan tidak mudah menyerah dalam menawarkan solusi." },
    { emoji: "📞", title: "Handoff ke CS Manual", desc: "Jika klien negosiasi, request di luar kemampuan AI, atau butuh penanganan khusus → wajib berikan kontak CS/Admin langsung." },
    { emoji: "🏗️", title: "Rahasia Infrastruktur", desc: "Sebutkan arsitektur cloud modern (Serverless, scalable). Dilarang menyebut 'gratis' atau 'free-tier'. Transfer manual = hemat biaya admin." },
    { emoji: "🛒", title: "Checkout Trigger", desc: "Saat klien setuju ambil paket → otomatis sisipkan kode [CHECKOUT_TRIGGER:<ID_PAKET>] untuk redirect ke halaman checkout." },
    { emoji: "📦", title: "Auto-Sync Paket", desc: "AI otomatis membaca semua paket dari database (nama, harga, fitur) setiap sesi chat baru — selalu up-to-date." },
    { emoji: "📚", title: "SOP & Knowledge Base", desc: "AI membaca semua instruksi custom dari AI Training Center (tabel ai_knowledge_base) setiap sesi — patuh 100%." },
    { emoji: "🔄", title: "Belajar dari Chat History", desc: "Setiap sesi chat, AI membaca 30 pesan terakhir dari riwayat percakapan klien untuk menjaga konteks." },
    { emoji: "⚠️", title: "Rate Limiter", desc: "Sesi chat dibatasi 20 pesan per sesi. Setelah itu, klien diarahkan ke WhatsApp admin untuk lanjut negosiasi." },
];

export default function AITrainingCenter() {
    const [rules, setRules] = useState<any[]>([]);
    const [packages, setPackages] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [formContent, setFormContent] = useState("");
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'builtin' | 'custom' | 'packages'>('builtin');

    const fetchData = async () => {
        const token = localStorage.getItem("wave_token");
        const res = await fetch("/api/v1/admin/ai", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            setRules(data.data);
            setPackages(data.packages || []);
            setStats(data.stats || null);
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async (e: any) => {
        e.preventDefault();
        if (!formContent.trim()) return;
        setSaving(true);
        const token = localStorage.getItem("wave_token");
        await fetch("/api/v1/admin/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ content: formContent })
        });
        setFormContent("");
        setSaving(false);
        fetchData();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus instruksi AI ini?')) return;
        const token = localStorage.getItem("wave_token");
        await fetch(`/api/v1/admin/ai?id=${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        fetchData();
    };

    const toggleStatus = async (rule: any) => {
        const token = localStorage.getItem("wave_token");
        await fetch("/api/v1/admin/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ id: rule.id, content: rule.content, is_active: !rule.is_active })
        });
        fetchData();
    };

    const parseFeatures = (f: any) => {
        if (!f) return [];
        if (Array.isArray(f)) return f;
        try { return JSON.parse(f); } catch { return []; }
    };

    return (
        <div className="max-w-6xl space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold gradient-text">🧠 AI Training Center — Nova</h1>
                <p className="text-gray-400 mt-2">Pusat pengetahuan, aturan, dan data yang dipelajari oleh AI Agent (Nova) secara real-time.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-4 border border-blue-500/20 text-center">
                    <p className="text-2xl font-extrabold text-blue-400">{BUILTIN_RULES.length}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Aturan Inti</p>
                </div>
                <div className="glass rounded-xl p-4 border border-green-500/20 text-center">
                    <p className="text-2xl font-extrabold text-green-400">{rules.filter(r => r.is_active).length}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">SOP Custom Aktif</p>
                </div>
                <div className="glass rounded-xl p-4 border border-purple-500/20 text-center">
                    <p className="text-2xl font-extrabold text-purple-400">{stats?.totalPackages || 0}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Paket Dipelajari</p>
                </div>
                <div className="glass rounded-xl p-4 border border-cyan-500/20 text-center">
                    <p className="text-2xl font-extrabold text-cyan-400">{stats?.totalMessages || 0}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Pesan Diproses</p>
                </div>
            </div>

            {/* Learning context summary */}
            <div className="glass rounded-xl p-4 border border-white/5 flex flex-wrap gap-4 text-xs">
                <span className="text-gray-400">📊 Nova telah melayani: </span>
                <span className="text-white font-bold">{stats?.totalChats || 0} sesi konsultasi</span>
                <span className="text-gray-600">•</span>
                <span className="text-white font-bold">{stats?.totalMessages || 0} pesan AI</span>
                <span className="text-gray-600">•</span>
                <span className="text-white font-bold">{stats?.totalOrders || 0} pesanan berhasil</span>
                <span className="text-gray-600">•</span>
                <span className="text-white font-bold">{stats?.totalPackages || 0} paket aktif</span>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-white/10 pb-0">
                {[
                    { key: 'builtin', label: '🔒 Aturan Inti (Built-in)', count: BUILTIN_RULES.length },
                    { key: 'custom', label: '📝 SOP Custom', count: rules.length },
                    { key: 'packages', label: '📦 Paket yang Dipelajari', count: packages.length },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                        className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all ${activeTab === tab.key ? 'bg-white/10 text-white border border-white/10 border-b-0' : 'text-gray-500 hover:text-gray-300'}`}>
                        {tab.label} <span className="ml-1 bg-white/10 px-1.5 py-0.5 rounded text-[10px]">{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'builtin' && (
                <div className="space-y-3">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-xs text-blue-300 mb-2">
                        💡 Aturan ini <strong>tertanam permanen di kode sistem</strong> (system prompt). Tidak bisa dihapus dari dashboard — hanya bisa diubah di source code. Ini menjamin Nova selalu patuh dan konsisten.
                    </div>
                    {BUILTIN_RULES.map((r, i) => (
                        <div key={i} className="glass rounded-xl p-4 border border-blue-500/10 flex items-start gap-4">
                            <span className="text-2xl">{r.emoji}</span>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-white">{r.title}</span>
                                    <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">HARDCODED</span>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">{r.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'custom' && (
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Rule Builder Form */}
                    <div className="lg:col-span-1 glass p-6 rounded-xl h-fit border border-white/5">
                        <h3 className="text-sm font-bold mb-3">➕ Tambah SOP / Aturan Baru</h3>
                        <form onSubmit={handleSave} className="space-y-3">
                            <textarea rows={5} required value={formContent} onChange={e => setFormContent(e.target.value)}
                                placeholder="Contoh: 'Wajib tawarkan garansi 3 bulan setelah project selesai' atau 'Jangan pernah memberikan harga di bawah 2 juta'."
                                className="w-full bg-[#0a0f1e] px-4 py-3 rounded-xl text-sm border border-white/10 text-white focus:outline-none focus:border-blue-500/50" />
                            <button type="submit" disabled={saving} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50">
                                {saving ? '⏳ Menyimpan...' : '🚀 Pelajari Instruksi Baru'}
                            </button>
                        </form>
                        <div className="mt-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px]">
                            <span className="font-bold block mb-1">💡 Tips Melatih AI:</span>
                            Gunakan kalimat perintah tegas: "Wajib...", "Jangan pernah...", "Selalu...", "Dilarang..."
                        </div>
                    </div>

                    {/* Rules List */}
                    <div className="lg:col-span-2 space-y-3">
                        {loading ? (
                            <p className="text-gray-400 text-sm">Loading...</p>
                        ) : rules.length === 0 ? (
                            <div className="glass p-8 text-center rounded-xl border border-white/5 text-gray-500 text-sm">
                                Belum ada SOP custom. AI hanya menggunakan aturan inti (built-in).
                            </div>
                        ) : (
                            rules.map((r, i) => (
                                <div key={r.id} className={`glass p-4 rounded-xl flex justify-between items-start border ${r.is_active ? 'border-green-500/20 bg-green-500/5' : 'border-white/5'}`}>
                                    <div className="flex-1 pr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold text-gray-400">SOP #{i + 1}</span>
                                            {r.is_active ?
                                                <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">✅ Active</span>
                                                :
                                                <span className="text-[9px] bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full border border-gray-500/20">Inactive</span>
                                            }
                                        </div>
                                        <p className={`text-xs leading-relaxed ${r.is_active ? 'text-white' : 'text-gray-600 line-through'}`}>{r.content}</p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <button onClick={() => toggleStatus(r)} className={`px-3 py-1 rounded-lg text-[10px] font-bold ${r.is_active ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                                            {r.is_active ? 'Pause' : 'Aktifkan'}
                                        </button>
                                        <button onClick={() => handleDelete(r.id)} className="px-3 py-1 rounded-lg text-[10px] font-bold bg-red-500/20 text-red-400">
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'packages' && (
                <div className="space-y-3">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-xs text-green-300">
                        📦 Nova <strong>otomatis membaca semua paket dari database</strong> setiap kali ada sesi chat baru. Perubahan di halaman "Manajemen Paket" akan langsung dipelajari tanpa restart.
                    </div>
                    {packages.length === 0 ? (
                        <div className="glass p-8 text-center rounded-xl border border-white/5 text-gray-500 text-sm">
                            Belum ada paket di database. Buat paket baru di Manajemen Paket.
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {packages.map((p: any) => {
                                const feats = parseFeatures(p.features);
                                return (
                                    <div key={p.id} className="glass rounded-xl p-5 border border-white/5">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{p.name}</h4>
                                                <p className="text-blue-400 font-extrabold text-lg">Rp {Number(p.price).toLocaleString('id-ID')}</p>
                                            </div>
                                            <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">ID: {p.id}</span>
                                        </div>
                                        {p.description && <p className="text-[11px] text-gray-500 mb-2">{p.description}</p>}
                                        {feats.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {feats.map((f: string, i: number) => (
                                                    <span key={i} className="text-[9px] bg-white/5 text-gray-400 border border-white/10 px-2 py-0.5 rounded">{f}</span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-gray-600">
                                            AI akan menyebut paket ini saat klien butuh: {feats.slice(0, 2).join(', ') || 'sesuai kebutuhan'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
