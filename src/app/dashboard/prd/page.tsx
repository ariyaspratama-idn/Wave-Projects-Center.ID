"use client";

import { useState } from "react";

export default function PRDGenerator() {
    const [rawRequest, setRawRequest] = useState("");
    const [projectName, setProjectName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!rawRequest.trim()) return;
        setLoading(true);

        try {
            const token = localStorage.getItem("wave_token");
            const res = await fetch("/api/v1/admin/prd", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ rawCustomerRequest: rawRequest, projectName })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Terjadi kesalahan sistem.');
            }

            // Unduh file biner (.docx) dari blob response
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `PRD_${projectName || 'Draft'}.docx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            alert("✨ PRD Berhasil Di-generate & Diunduh!");
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold gradient-text">Auto PRD Generator 🤖</h1>
                <p className="text-gray-400 mt-2">
                    Ubah percakapan abstrak pelanggan menjadi Dokumen Persyaratan Produk (PRD) yang rapi, profesional, dan langsung bisa diserahkan ke tim Developer dalam format Word (.docx).
                </p>
            </div>

            <div className="glass rounded-2xl p-8 border border-white/5 space-y-6">
                <div>
                    <label className="text-sm font-semibold mb-2 block">Nama Proyek (Opsional)</label>
                    <input
                        type="text"
                        value={projectName}
                        onChange={e => setProjectName(e.target.value)}
                        placeholder="Misal: Aplikasi Kasir UMKM"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="text-sm font-semibold mb-2 block">Kebutuhan Mentah Pelanggan (Raw Customer Logs) <span className="text-red-400">*</span></label>
                    <textarea
                        rows={10}
                        value={rawRequest}
                        onChange={e => setRawRequest(e.target.value)}
                        placeholder="Paste percakapan dari Live Chat atau WhatsApp di sini... (Misal: 'Mas, saya mau bikin aplikasi toko kelontong, ada fitur scan barcode, stok otomatis...')"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-y"
                    />
                    <p className="text-xs text-gray-500 mt-2">Semakin detail raw input-nya, semakin akurat Anthropic Claude merefleksikan PRD-nya.</p>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !rawRequest.trim()}
                        className="w-full bg-primary hover:bg-primary-light disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all glow-blue flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                AI Sedang Menganalisis & Menyusun PRD... (Tunggu ~15 Detik)
                            </>
                        ) : '✨ Generate V1.0 PRD (.docx)'}
                    </button>
                </div>
            </div>

            <div className="bg-blue-500/10 text-blue-300 border border-blue-500/20 p-4 rounded-xl text-xs">
                💡 <b>Perhatian:</b> Fitur ini mengeksekusi engine `prdDocxRenderer` secara serverless Edge. Pastikan <code>ANTHROPIC_API_KEY</code> di Vercel Dashboard Anda tidak kosong.
            </div>
        </div>
    );
}
