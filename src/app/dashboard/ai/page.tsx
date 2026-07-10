"use client";

import { useEffect, useState } from "react";

export default function AITrainingCenter() {
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formContent, setFormContent] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchRules = async () => {
        const token = localStorage.getItem("wave_token");
        const res = await fetch("/api/v1/admin/ai", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            setRules(data.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRules();
    }, []);

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
        fetchRules();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus instruksi AI ini?')) return;
        const token = localStorage.getItem("wave_token");
        await fetch(`/api/v1/admin/ai?id=${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        fetchRules();
    };

    const toggleStatus = async (rule: any) => {
        const token = localStorage.getItem("wave_token");
        await fetch("/api/v1/admin/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ id: rule.id, content: rule.content, is_active: !rule.is_active })
        });
        fetchRules();
    };

    return (
        <div className="max-w-5xl space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold gradient-text">AI Training Center</h1>
                <p className="text-gray-400 mt-2">Daftar Instruksi Khusus (SOP) dan pengetahuan perusahaan yang selalu dipelajari oleh Agen AI (Nova).</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* Rule Builder Form */}
                <div className="lg:col-span-1 glass p-6 rounded-2xl h-fit border border-white/5">
                    <h3 className="text-lg font-bold mb-4">Tambah Pengetahuan / Aturan Baru</h3>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold mb-2 block">Isi Instruksi (SOP / Info Produk)</label>
                            <textarea
                                rows={5}
                                required
                                value={formContent}
                                onChange={e => setFormContent(e.target.value)}
                                placeholder="Contoh: 'Tawarkan program garansi 3 bulan setelah project selesai' atau 'Dilarang memberikan harga di bawah 5 juta'."
                                className="w-full bg-[#0a0f1e] px-4 py-3 rounded-xl text-sm border border-white/10 text-white focus:outline-none focus:border-primary/50"
                            />
                        </div>
                        <button type="submit" disabled={saving} className="w-full py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-xl transition-all">
                            {saving ? 'Menyimpan...' : 'Pelajari Instruksi Baru'}
                        </button>
                    </form>
                    <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs">
                        <span className="font-bold block mb-1">Tips Melatih AI:</span>
                        Gunakan kalimat perintah yang tegas ("Wajib...", "Jangan pernah...") agar konsisten.
                    </div>
                </div>

                {/* Rules List */}
                <div className="lg:col-span-2">
                    {loading ? (
                        <p className="text-gray-400">Loading AI Knowledge Base...</p>
                    ) : (
                        <div className="space-y-4">
                            {rules.length === 0 ? (
                                <div className="glass p-8 text-center rounded-2xl border border-white/5 text-gray-500">
                                    Belum ada instruksi tambahan saat ini. AI menggunakan setting default.
                                </div>
                            ) : (
                                rules.map((r, i) => (
                                    <div key={r.id} className={`glass p-5 rounded-2xl flex justify-between items-start border ${r.is_active ? 'border-primary/30 bg-primary/5' : 'border-white/5'}`}>
                                        <div className="flex-1 pr-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Instruksi #{i + 1}</span>
                                                {r.is_active ?
                                                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">Active</span>
                                                    :
                                                    <span className="text-[10px] bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full border border-gray-500/20">Inactive</span>
                                                }
                                            </div>
                                            <p className={`text-sm ${r.is_active ? 'text-white' : 'text-gray-500 strikethrough'}`}>
                                                {r.content}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button onClick={() => toggleStatus(r)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${r.is_active ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400' : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'}`}>
                                                {r.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                            </button>
                                            <button onClick={() => handleDelete(r.id)} className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-500">
                                                Hapus Permanen
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
