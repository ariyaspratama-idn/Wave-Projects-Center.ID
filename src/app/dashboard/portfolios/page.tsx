"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function PortfolioCMS() {
    const [portfolios, setPortfolios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({ title: '', description: '', live_link: '', image: null as File | null, screenshot_url: '' });
    const [uploading, setUploading] = useState(false);
    const [capturing, setCapturing] = useState(false);

    useEffect(() => {
        fetch("/api/v1/portfolios")
            .then(res => res.json())
            .then(data => {
                if (data.success) setPortfolios(data.data);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleAutoCapture = async () => {
        if (!form.live_link) return alert("Mohon masukkan Link Live / Demo terlebih dahulu!");
        setCapturing(true);
        try {
            const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(form.live_link)}&screenshot=true&meta=false`);
            const data = await res.json();
            if (data.status === 'success' && data.data?.screenshot?.url) {
                setForm(prev => ({ ...prev, screenshot_url: data.data.screenshot.url, image: null }));
            } else {
                alert("Gagal menangkap layar. Pastikan link valid dan bisa diakses publik (tanpa password).");
            }
        } catch (error) {
            alert("Terjadi kesalahan jaringan saat mencoba menangkap layar.");
        }
        setCapturing(false);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!form.image && !form.screenshot_url) {
            return alert("Gambar wajib ada! Harap unggah manual atau gunakan Auto Capture.");
        }

        setUploading(true);

        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("live_link", form.live_link);
        if (form.image) formData.append("image", form.image);
        if (form.screenshot_url) formData.append("screenshot_url", form.screenshot_url);

        const token = localStorage.getItem("wave_token");
        const res = await fetch("/api/v1/admin/portfolios", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        const data = await res.json();
        if (data.success) {
            fetch("/api/v1/portfolios").then(res => res.json()).then(d => { if (d.success) setPortfolios(d.data); });
            setForm({ title: '', description: '', live_link: '', image: null, screenshot_url: '' });
            alert("Portfolio berhasil ditambahkan dan gambar disinkronisasi ke Cloudinary!");
        } else {
            alert("Gagal: " + data.error);
        }
        setUploading(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold gradient-text">Manajemen Portfolio</h1>
                    <p className="text-gray-400 mt-2 text-sm">Gunakan Auto Capture untuk otomatis menjepret layar situs klien.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 glass p-6 rounded-2xl h-fit border border-white/5">
                    <h2 className="font-bold mb-4 text-primary">Tambah Proyek Baru</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Judul Proyek</label>
                            <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-primary/50 outline-none" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Deskripsi Singkat</label>
                            <textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-primary/50 outline-none" />
                        </div>
                        <div>
                            <label className="text-xs text-blue-400 font-bold block mb-1">Link Live / Demo</label>
                            <input type="url" value={form.live_link} onChange={e => setForm({ ...form, live_link: e.target.value })} placeholder="https://..." className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-blue-500/50 outline-none font-mono" />
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                            <label className="text-xs text-gray-400 block mb-1 font-bold">Pilih Metode Cover</label>

                            <button type="button" onClick={handleAutoCapture} disabled={capturing} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] flex items-center justify-center gap-2">
                                {capturing ? 'Menjepret Layar...' : '📸 Auto Capture dari Link Live'}
                            </button>

                            <div className="flex items-center gap-2"><hr className="flex-1 border-white/5" /><span className="text-[10px] text-gray-500 font-bold">ATAU</span><hr className="flex-1 border-white/5" /></div>

                            <div>
                                <input type="file" accept="image/*" onChange={e => setForm({ ...form, image: e.target.files?.[0] || null, screenshot_url: '' })} className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-gray-300 hover:file:bg-white/20" />
                            </div>

                            {/* Preview Area */}
                            {(form.image || form.screenshot_url) && (
                                <div className="mt-4 border border-emerald-500/30 bg-emerald-500/5 p-2 rounded-xl relative overflow-hidden">
                                    <div className="text-[10px] text-emerald-400 font-bold mb-2 absolute top-2 right-2 bg-[#0a0f1e] px-2 py-0.5 rounded border border-emerald-500/30">✓ COVER SIAP</div>
                                    <div className="h-32 relative rounded-lg overflow-hidden border border-white/10 mt-6">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={form.screenshot_url || (form.image ? URL.createObjectURL(form.image) : '')} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            )}

                        </div>

                        <button disabled={uploading || (!form.image && !form.screenshot_url)} className="w-full bg-gradient-to-r from-primary to-blue-600 hover:opacity-80 text-white font-extrabold py-3 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 mt-4">
                            {uploading ? 'Menyimpan ke Cloudinary...' : '🚀 Publish Proyek'}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2">
                    {loading ? (
                        <div className="grid sm:grid-cols-2 gap-4 animate-pulse">
                            <div className="h-48 bg-white/5 rounded-xl block"></div>
                            <div className="h-48 bg-white/5 rounded-xl block"></div>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {portfolios.map(p => (
                                <div key={p.id} className="glass rounded-xl overflow-hidden border border-white/5 group hover:border-white/20 transition-all hover:-translate-y-1">
                                    <div className="h-36 bg-white/5 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                                            {p.live_link && (
                                                <a href={p.live_link} target="_blank" rel="noopener noreferrer" className="bg-primary hover:bg-primary-light text-white text-xs font-bold px-4 py-2 rounded-full border border-blue-400">
                                                    Kunjungi Situs
                                                </a>
                                            )}
                                        </div>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="p-4 relative">
                                        <h3 className="font-bold text-sm mb-1 text-white">{p.title}</h3>
                                        <p className="text-xs text-gray-400 line-clamp-3 mb-2">{p.description}</p>
                                    </div>
                                </div>
                            ))}
                            {portfolios.length === 0 && (
                                <div className="col-span-2 border border-dashed border-white/10 rounded-2xl p-12 text-center text-gray-500">
                                    Belum ada karya portfolio agensi yang dipublikasikan.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
