"use client";

import { useEffect, useState } from "react";

export default function ClientBriefForm({ params }: { params: { id: string } }) {
    const [data, setData] = useState<any>(null);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        projectName: '',
        targetAudience: '',
        coreFeatures: '',
        designPreference: '',
        timeline: ''
    });

    useEffect(() => {
        fetch(`/api/v1/brief/${params.id}`)
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setData(res.data);
                    if (res.data.existingBrief) setSubmitted(true);
                }
                setLoading(false);
            });
    }, [params.id]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        await fetch(`/api/v1/brief/${params.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });
        setLoading(false);
        setSubmitted(true);
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Mempersiapkan Lembar Brief...</div>;
    if (!data) return <div className="text-center py-20 text-red-500 font-bold">Akses Order Invalid.</div>;

    if (submitted) return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-xl mx-auto glass p-10 rounded-3xl text-center border border-white/10 shadow-2xl">
                <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">✓</div>
                <h1 className="text-3xl font-extrabold mb-4">Brief Terkirim!</h1>
                <p className="text-gray-400 leading-relaxed mb-6">
                    Terima kasih telah mengisi struktur kebutuhan proyek. Sistem AI kami sedang merumuskan PRD (dokumen teknis) dan tim pusat akan segera memvalidasi Quotation Anda.
                </p>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 inline-block text-sm text-gray-300">
                    ID Referensi Anda: <span className="font-bold text-white">#{params.id.padStart(4, '0')}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen py-10 px-4 flex justify-center">
            <div className="max-w-2xl w-full">

                <div className="text-center mb-10">
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight gradient-text mb-2">Project Briefing Form</h1>
                    <p className="text-gray-400">Harap isi detail kebutuhan untuk proyek <span className="text-white font-bold">{data.order?.package_name}</span> milik {data.order?.client_name}.</p>
                </div>

                <div className="glass p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">1. Nama/Judul Proyek / App Name</label>
                            <input required type="text" value={form.projectName} onChange={e => setForm({ ...form, projectName: e.target.value })} placeholder="Misal: SiPintar (Sistem Informasi Sekolah)" className="w-full bg-[#0a0f1e] border border-white/10 p-4 rounded-xl outline-none focus:border-primary transition-all text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">2. Target Pengguna (Who will use this?)</label>
                            <input required type="text" value={form.targetAudience} onChange={e => setForm({ ...form, targetAudience: e.target.value })} placeholder="Misal: Guru SMP dan Wali Murid" className="w-full bg-[#0a0f1e] border border-white/10 p-4 rounded-xl outline-none focus:border-primary transition-all text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">3. Fitur Utama yang Wajib Ada (Core Features)</label>
                            <textarea required rows={4} value={form.coreFeatures} onChange={e => setForm({ ...form, coreFeatures: e.target.value })} placeholder="Mohon jelaskan se-detail mungkin...&#10;Contoh:&#10;1. Bisa login pakai Google&#10;2. Ada dashboard rekap absensi harian&#10;3. Ekspor laporan ke PDF otomatis" className="w-full bg-[#0a0f1e] border border-white/10 p-4 rounded-xl outline-none focus:border-primary transition-all text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">4. Preferensi Desain / UI UX</label>
                            <input type="text" value={form.designPreference} onChange={e => setForm({ ...form, designPreference: e.target.value })} placeholder="Misal: Warna dominan biru muda, gaya minimalis Apple" className="w-full bg-[#0a0f1e] border border-white/10 p-4 rounded-xl outline-none focus:border-primary transition-all text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">5. Target Waktu Pengerjaan (Timeline)</label>
                            <input type="text" value={form.timeline} onChange={e => setForm({ ...form, timeline: e.target.value })} placeholder="Misal: Secepatnya / Maksimal 1 Desember" className="w-full bg-[#0a0f1e] border border-white/10 p-4 rounded-xl outline-none focus:border-primary transition-all text-sm" />
                        </div>

                        <div className="pt-6 border-t border-white/5 mt-8">
                            <button type="submit" className="w-full bg-primary hover:bg-primary-light text-white font-extrabold py-4 rounded-xl transition-all glow-blue text-lg hover:-translate-y-1">
                                Kirim Project Brief
                            </button>
                            <p className="text-center text-xs text-gray-500 mt-4">Data akan dikirim ke mesin AI System Architect Wave Projects.</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
