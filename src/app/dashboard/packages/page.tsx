"use client";

import { useEffect, useState } from "react";

export default function PackageManagement() {
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ id: null, name: '', tag: '', desc: '', price: 0, estimated_days: 0, code: [] as string[], popular: false, active: true });
    const [newFeature, setNewFeature] = useState("");

    const fetchPackages = () => {
        const token = localStorage.getItem("wave_token");
        fetch("/api/v1/admin/packages", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPackages(data.data);
                } else {
                    alert("Gagal memuat paket: " + data.error);
                }
                setLoading(false);
            });
    };

    useEffect(() => fetchPackages(), []);

    const openEdit = (pkg: any) => {
        setForm({ ...pkg, estimated_days: pkg.estimated_days || 0, active: Boolean(pkg.is_active) });
        setShowModal(true);
    };

    const openAdd = () => {
        setForm({ id: null, name: '', tag: '', desc: '', price: 0, estimated_days: 0, code: [], popular: false, active: true });
        setShowModal(true);
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setForm({ ...form, code: [...form.code, newFeature.trim()] });
            setNewFeature("");
        }
    };
    const removeFeature = (idx: number) => {
        setForm({ ...form, code: form.code.filter((_, i) => i !== idx) });
    };

    const handleSave = async () => {
        const token = localStorage.getItem("wave_token");
        const res = await fetch("/api/v1/admin/packages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(form)
        });
        const data = await res.json();
        if (data.success) {
            setShowModal(false);
            fetchPackages(); // Reload
        } else {
            alert("Gagal menyimpan: " + data.error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold gradient-text">Manajemen Paket</h1>
                    <p className="text-gray-400 mt-2">Atur harga, deskripsi, dan fitur layanan produk Anda (Sinkron Real-time).</p>
                </div>
                <button onClick={openAdd} className="bg-primary hover:bg-primary-light px-6 py-2 rounded-full font-semibold glow-blue transition-all">
                    + Tambah Paket
                </button>
            </div>

            {loading ? <p>Loading packages...</p> : (
                <div className="grid md:grid-cols-3 gap-6">
                    {packages.map(p => (
                        <div key={p.id} className={`glass rounded-2xl p-6 border relative ${p.popular ? 'border-primary/50' : 'border-white/5'}`}>
                            {Boolean(p.popular) && <div className="absolute top-0 right-0 bg-primary text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">POPULAR</div>}
                            <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">{p.tag}</div>
                            <h3 className="text-xl font-bold">{p.name}</h3>
                            <h2 className="text-2xl font-extrabold text-blue-400 mt-2 mb-2">Rp {p.price.toLocaleString("id-ID")}</h2>
                            <div className="text-xs text-yellow-500 font-bold mb-2">⏱️ Waktu Pengerjaan: {p.estimated_days || 0} Hari</div>
                            <p className="text-sm text-gray-400 min-h-[40px] mb-4">{p.desc}</p>

                            <ul className="space-y-2 mb-6">
                                {p.features?.map((f: string, i: number) => (
                                    <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                        <span className="text-green-400">✓</span> {f}
                                    </li>
                                ))}
                            </ul>

                            <button onClick={() => openEdit(p)} className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-all border border-white/10 hover:border-white/20">
                                Edit Konfigurasi
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Editor Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold">{form.id ? 'Edit Paket (ID: ' + form.id + ')' : 'Buat Paket Baru'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs mb-1 block">Nama Paket</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-white/5 px-3 py-2 rounded-lg text-sm outline-none" /></div>
                                <div><label className="text-xs mb-1 block">Label (UMKM/Startup)</label><input type="text" value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} className="w-full bg-white/5 px-3 py-2 rounded-lg text-sm outline-none" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs mb-1 block">Harga (Rp)</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="w-full bg-white/5 px-3 py-2 rounded-lg text-sm outline-none" /></div>
                                <div><label className="text-xs mb-1 block">Estimasi (Hari)</label><input type="number" value={form.estimated_days} onChange={e => setForm({ ...form, estimated_days: Number(e.target.value) })} className="w-full bg-white/5 px-3 py-2 rounded-lg text-sm outline-none" min={0} /></div>
                            </div>
                            <div className="flex gap-6 pb-2">
                                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.popular} onChange={e => setForm({ ...form, popular: e.target.checked })} /> Tandai "Most Popular"</label>
                                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Status Aktif</label>
                            </div>
                            <div>
                                <label className="text-xs mb-1 block">Deskripsi Pendek</label>
                                <textarea rows={2} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} className="w-full bg-white/5 px-3 py-2 rounded-lg text-sm outline-none" />
                            </div>

                            {/* Feature List Builder */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <label className="text-sm font-semibold mb-2 block">Centang List Fitur</label>
                                <ul className="mb-4 space-y-1">
                                    {form.code.map((f, i) => (
                                        <li key={i} className="flex justify-between items-center text-xs bg-white/5 px-3 py-1.5 rounded">
                                            {f} <button onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-300">Hapus</button>
                                        </li>
                                    ))}
                                    {form.code.length === 0 && <span className="text-xs text-gray-500">Belum ada fitur ditambahkan.</span>}
                                </ul>
                                <div className="flex gap-2">
                                    <input type="text" value={newFeature} onChange={e => setNewFeature(e.target.value)} onKeyDown={e => e.key === 'Enter' && addFeature()} placeholder="Ketik fitur dan tekan +, contoh: Gratis Domain 1 Tahun" className="flex-1 bg-[#0a0f1e] px-3 py-2 rounded-lg text-xs outline-none" />
                                    <button onClick={addFeature} className="bg-primary px-3 rounded-lg text-white font-bold">+</button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/10 flex justify-end">
                            <button onClick={handleSave} className="bg-green-500 hover:bg-green-400 text-white px-6 py-2 rounded-lg font-semibold text-sm">Simpan Paket</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
