"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { useParams } from "next/navigation";

export default function OrderExecutiveDetail() {
    const params = useParams();
    const orderId = params.id as string;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [aiGenerating, setAiGenerating] = useState(false);

    const fetchExecutiveData = () => {
        const token = localStorage.getItem("wave_token");
        fetch(`/api/v1/admin/orders/${orderId}`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => res.json())
            .then(res => {
                if (res.success) setData(res.data);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchExecutiveData();
    }, [orderId]);

    const handleGenerateAiKanban = async () => {
        if (!confirm("Kirim instruksi Brief ke Sistem AI untuk dibongkar jadi checklist teknikal? (Bisa memakan waktu 10-15 detik)")) return;

        setAiGenerating(true);
        const token = localStorage.getItem("wave_token");
        await fetch(`/api/v1/admin/orders/${orderId}/kanban-ai`, {
            method: 'POST',
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
        });
        setAiGenerating(false);
        fetchExecutiveData(); // reload
    };

    const updateTaskStatus = async (taskId: number, newStatus: string) => {
        const token = localStorage.getItem("wave_token");
        await fetch(`/api/v1/admin/orders/${orderId}/kanban-ai`, {
            method: 'PUT',
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ taskId, status: newStatus })
        });
        fetchExecutiveData(); // reload
    };

    if (loading) return <p className="text-gray-500 py-10">Mempersiapkan Executive Dashboard...</p>;
    if (!data) return <p className="text-red-500 py-10 font-bold">Akses ditolak atau Data ID tidak ditemukan.</p>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-extrabold gradient-text">Executive Dashboard: #{orderId.padStart(4, '0')}</h1>
                    <p className="text-sm text-gray-400 mt-2">Klien: {data.order.client_name} | Paket: {data.order.package_name}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => { navigator.clipboard.writeText(window.location.origin + '/brief/' + orderId); alert('Link Form Brief berhasil dicopy!'); }} className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg font-semibold text-white transition-all text-sm">
                        📋 Copy Form Brief Link
                    </button>
                    <Link href="/dashboard/orders" className="text-sm border border-white/10 hover:bg-white/5 px-4 py-2 rounded-lg transition-all text-gray-300">
                        &larr; Kembali
                    </Link>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* LEFT PANEL: KANBAN & BRIEF */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass p-6 rounded-2xl border border-white/10 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2"><span className="text-2xl">⚡</span> Technical Kanban Board (AI PRD)</h2>
                            <button
                                onClick={handleGenerateAiKanban}
                                disabled={aiGenerating || !data.brief}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!data.brief ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : aiGenerating ? 'bg-primary/50 text-white animate-pulse' : 'bg-primary hover:bg-primary-light text-white glow-blue'}`}
                            >
                                {aiGenerating ? 'AI Sedang Memproses...' : 'Tarik Brief ke AI ➔ Generate Tasks'}
                            </button>
                        </div>

                        {!data.brief && (
                            <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-4 rounded-xl text-sm mb-6">
                                ⚠️ Klien belum mengisi Form Brief. Kirimkan Link Copy Form Brief di atas kepada klien agar AI dapat merumuskan Kanban.
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {['TODO', 'DOING', 'DONE'].map(col => (
                                <div key={col} className="bg-[#0a0f1e] rounded-xl p-4 border border-white/5 min-h-[300px]">
                                    <h3 className={`font-bold pb-2 border-b border-white/10 mb-4 text-sm ${col === 'DONE' ? 'text-green-400' : col === 'DOING' ? 'text-blue-400' : 'text-gray-400'}`}>{col}</h3>

                                    <div className="space-y-3">
                                        {data.kanban?.filter((t: any) => t.status === col).map((task: any) => (
                                            <div key={task.id} className="bg-white/5 border border-white/10 rounded-lg p-3 group relative hover:border-primary/50 transition-all">
                                                <h4 className="text-sm font-semibold mb-1 leading-tight">{task.title}</h4>
                                                <p className="text-[10px] text-gray-400 leading-relaxed mb-3">{task.description}</p>

                                                <div className="flex gap-1">
                                                    {col !== 'TODO' && <button onClick={() => updateTaskStatus(task.id, col === 'DONE' ? 'DOING' : 'TODO')} className="flex-1 bg-white/10 text-[10px] py-1 rounded hover:bg-white/20">&larr;</button>}
                                                    {col !== 'DONE' && <button onClick={() => updateTaskStatus(task.id, col === 'TODO' ? 'DOING' : 'DONE')} className="flex-1 bg-primary/20 text-primary hover:bg-primary hover:text-white text-[10px] py-1 rounded transition-all">&rarr;</button>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: WEBHOOK TRACES */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass p-6 rounded-2xl border border-white/10 shadow-xl h-full">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><span className="text-xl">📡</span> CI/CD Webhook Stream</h2>

                        <div className="text-xs text-gray-500 mb-4 pb-4 border-b border-white/10">
                            Auto-mendeteksi commit dari Github dan status deployment dari Vercel untuk order ini.
                            <br /><br />
                            Webhook URL: <br /><span className="text-blue-300 font-mono">/api/v1/webhooks/vercel?order_id={orderId}</span>
                        </div>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                            {data.deployments?.map((hook: any) => (
                                <div key={hook.id} className="bg-[#0a0f1e] p-3 rounded-xl border border-white/5 relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${hook.platform === 'GITHUB' ? 'bg-gray-800 text-white' : 'bg-black text-white border border-gray-800'}`}>
                                            {hook.platform}
                                        </span>
                                        <span className="text-[10px] text-gray-500">{new Date(hook.created_at).toLocaleString('id-ID')}</span>
                                    </div>
                                    <p className="text-xs text-gray-300 mb-2">{hook.message}</p>

                                    <div className="flex justify-between items-center">
                                        <span className={`text-[10px] font-bold ${hook.status === 'SUCCESS' || hook.status === 'PUSHED' ? 'text-green-400' : hook.status === 'FAILED' ? 'text-red-400' : 'text-blue-400'}`}>
                                            {hook.status}
                                        </span>
                                        {hook.url && (
                                            <a href={hook.url} target="_blank" className="text-[10px] text-blue-500 hover:underline">Lihat Log &rarr;</a>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(!data.deployments || data.deployments.length === 0) && (
                                <p className="text-xs text-center text-gray-500 py-10 italic">Menunggu sinyal trigger webhooks dari repositori atau CI/CD Cloud.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
