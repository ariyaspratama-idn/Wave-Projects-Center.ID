"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function PortfolioCMS() {
    const [portfolios, setPortfolios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({ title: '', description: '', live_link: '', image: null as File | null });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetch("/api/v1/portfolios")
            .then(res => res.json())
            .then(data => {
                if (data.success) setPortfolios(data.data);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setUploading(true);

        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("live_link", form.live_link);
        if (form.image) formData.append("image", form.image);

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
            setForm({ title: '', description: '', live_link: '', image: null });
            alert("Portfolio berhasil ditambahkan dan gambar disinkronisasi ke Cloudinary!");
        } else {
            alert("Gagal: " + data.error);
        }
        setUploading(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manajemen Portfolio</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 glass p-6 rounded-2xl h-fit">
                    <h2 className="font-bold mb-4">Tambah Proyek Baru</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Judul Proyek</label>
                            <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Deskripsi Singkat</label>
                            <textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
                        </div>
                        <div>
                            <label className="text-xs text-blue-400 font-bold block mb-1">Unggah Cover / Banner</label>
                            <input required type="file" accept="image/*" onChange={e => setForm({ ...form, image: e.target.files?.[0] || null })} className="w-full bg-blue-900/10 border border-blue-500/30 rounded-xl px-3 py-2 text-sm text-gray-300" />
                            <p className="text-[10px] text-gray-500 mt-1">Otomatis Ter-Upload ke Server Cloudinary</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Link Live / Demo</label>
                            <input type="url" value={form.live_link} onChange={e => setForm({ ...form, live_link: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
                        </div>
                        <button disabled={uploading} className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-2 rounded-xl text-sm transition-all">
                            {uploading ? 'Menyimpan...' : 'Publish Proyek'}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2">
                    {loading ? <p className="text-gray-400">Loading portfolios...</p> : (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {portfolios.map(p => (
                                <div key={p.id} className="glass rounded-xl overflow-hidden border border-white/5">
                                    <div className="h-32 bg-white/5 relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-sm mb-1">{p.title}</h3>
                                        <p className="text-xs text-gray-400 line-clamp-2 mb-3">{p.description}</p>
                                        {p.live_link && (
                                            <a href={p.live_link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                                Lihat Demo &rarr;
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {portfolios.length === 0 && <p className="text-sm text-gray-400">Belum ada portfolio.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
