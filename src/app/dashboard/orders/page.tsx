"use client";

import { useEffect, useState } from "react";

const STAGES = [
    "New Lead", "Quotation", "Down Payment", "Development",
    "Testing", "Revision", "Final Payment", "Handover", "Maintenance"
];

export default function OrderTracking() {
    const [orders, setOrders] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [noteInput, setNoteInput] = useState("");

    const fetchOrders = () => {
        const token = localStorage.getItem("wave_token");
        fetch("/api/v1/admin/orders", { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                if (data.success) setOrders(data.data);
                setLoading(false);
            });
    };

    useEffect(() => {
        const cached = localStorage.getItem("wave_user");
        if (cached) setUser(JSON.parse(cached));
        fetchOrders();
    }, []);

    const handleUpdateStatus = async (orderId: number, nextStatus: string) => {
        if (!confirm(`Apakah Anda yakin memajukan proyek ke tahap: ${nextStatus}?`)) return;

        const token = localStorage.getItem("wave_token");
        await fetch("/api/v1/admin/orders/status", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ orderId, status: nextStatus, notes: `Status manually bumped to ${nextStatus}` })
        });
        fetchOrders();
    };

    const handleAddNote = async (orderId: number) => {
        if (!noteInput.trim()) return;
        const token = localStorage.getItem("wave_token");
        await fetch("/api/v1/admin/orders/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ orderId, note: noteInput })
        });
        setNoteInput("");
        fetchOrders();
    };

    const handleAutoAssign = async (orderId: number) => {
        if (!confirm("Bagi tugas secara otomatis menggunakan AI Workload Balancer?")) return;
        const token = localStorage.getItem("wave_token");
        const res = await fetch("/api/v1/admin/projects/auto-assign", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ orderId })
        });
        const data = await res.json();
        if (data.success) {
            alert(`✅ Proyek otomatis dialihkan ke: ${data.data.developer_name} (Beban Aktif: ${data.data.active_load} proyek)`);
            fetchOrders();
        } else {
            alert(`Gagal: ${data.error}`);
        }
    };

    if (!user) return <p>Loading...</p>;
    const roleName = user.roles && user.roles.length > 0 ? user.roles[0].name : "Customer";
    const isInternal = roleName !== "Customer";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold gradient-text">{isInternal ? 'Manajemen Alur Pesanan (ERP)' : 'Pelacakan Pesanan Anda'}</h1>
                <p className="text-gray-400 mt-2">Lacak setiap tahapan progres, bottleneck, dan catatan internal proyek Anda.</p>
            </div>

            {loading ? <p className="text-gray-500">Memuat data proyek...</p> : orders.length === 0 ? <p className="text-gray-500">Belum ada proyek pesanan.</p> : (
                <div className="space-y-10">
                    {orders.map(o => {
                        const currentStageIdx = STAGES.indexOf(o.status || 'New Lead');

                        return (
                            <div key={o.id} className="glass border border-white/5 rounded-2xl overflow-hidden p-6">
                                {/* Header */}
                                <div className="flex flex-wrap justify-between items-start mb-8 gap-4">
                                    <div>
                                        <div className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full inline-block font-semibold mb-2">Order ID: #{o.id.toString().padStart(4, '0')}</div>
                                        <h3 className="text-xl font-bold">{o.package_name || 'Paket Kustom'}</h3>
                                        <p className="text-gray-400 text-sm">Klien: {o.user_name || <span className="text-red-400 italic">Belum diisi</span>}</p>
                                        <p className="text-gray-500 text-xs">{o.user_email || ''}{o.user_whatsapp ? ` · WA: ${o.user_whatsapp}` : ''}</p>

                                        {isInternal && (
                                            <div className="mt-3">
                                                <span className="text-xs bg-slate-800 text-gray-300 px-3 py-1.5 rounded-md border border-slate-700">
                                                    👨‍💻 Assignee: <strong className={o.developer_name ? "text-emerald-400" : "text-yellow-400"}>{o.developer_name || 'Menunggu Penugasan (Auto-Assign)'}</strong>
                                                </span>
                                            </div>
                                        )}

                                        {isInternal && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                <a href={`/dashboard/orders/${o.id}`} className="text-[10px] bg-primary hover:bg-primary-light border border-primary/50 px-3 py-1.5 rounded-md font-semibold text-white transition-all glow-blue">
                                                    🚀 Masuk Executive Panel (AI & Kanban)
                                                </a>
                                                <a href={`/dashboard/orders/${o.id}/invoice`} target="_blank" className="text-[10px] bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-md font-semibold text-white transition-all">
                                                    📄 Cetak Invoice (Faktur)
                                                </a>
                                                <button onClick={() => { navigator.clipboard.writeText(window.location.origin + '/track/' + o.id); alert('Link Tracker Publik (Aman) berhasil disalin. Kirim ke WhatsApp Klien!'); }} className="text-[10px] bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-md font-semibold text-blue-300 transition-all">
                                                    🔗 Copy Link Tracker Klien
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-300">Total Nilai Proyek</p>
                                        <h3 className="text-2xl font-extrabold text-green-400">Rp {Number(o.total_amount).toLocaleString("id-ID")}</h3>
                                    </div>
                                </div>

                                {/* 9-Stage Tracker UI */}
                                <div className="mb-8 overflow-x-auto pb-4">
                                    <div className="flex items-center min-w-[800px]">
                                        {STAGES.map((stage, idx) => {
                                            const isDone = idx < currentStageIdx;
                                            const isActive = idx === currentStageIdx;
                                            // See if there's a timestamp for this log stage
                                            const log = o.status_logs?.find((l: any) => l.status === stage);

                                            return (
                                                <div key={stage} className="flex-1 text-center relative group">
                                                    {/* Connector Line */}
                                                    {idx !== 0 && (
                                                        <div className={`absolute top-4 left-0 w-full h-1 -translate-x-1/2 -z-10 ${isDone || isActive ? 'bg-primary' : 'bg-white/10'}`} />
                                                    )}

                                                    {/* Circle Node */}
                                                    <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold border-2 transition-all ${isDone ? 'bg-primary border-primary text-white scale-90' : isActive ? 'bg-[#0f172a] border-primary text-primary scale-110 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-[#0a0f1e] border-white/20 text-gray-500'}`}>
                                                        {isDone ? '✓' : idx + 1}
                                                    </div>

                                                    {/* Labels */}
                                                    <p className={`mt-3 text-xs font-semibold ${isActive ? 'text-white' : 'text-gray-500'}`}>{stage}</p>
                                                    {log && (
                                                        <p className="text-[10px] text-gray-600 mt-1">{new Date(log.created_at).toLocaleDateString()} <br /> {new Date(log.created_at).toLocaleTimeString()}</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Actions & Internal Notes (Staff Only) */}
                                {isInternal && (
                                    <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                                        {/* Status Pusher Controller */}
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
                                            <h4 className="font-bold text-sm mb-4">Kendali Operasional Proyek</h4>
                                            {currentStageIdx < STAGES.length - 1 ? (
                                                <button onClick={() => handleUpdateStatus(o.id, STAGES[currentStageIdx + 1])} className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-xl transition-all">
                                                    Majukan Proyek ke: {STAGES[currentStageIdx + 1]} ➔
                                                </button>
                                            ) : (
                                                <div className="text-green-400 font-bold text-center bg-green-500/10 p-3 rounded-xl">Proyek telah selesai (Maintenance Active)</div>
                                            )}

                                            <button
                                                onClick={() => handleAutoAssign(o.id)}
                                                className="w-full bg-[#1e293b] hover:bg-[#334155] border border-blue-500/30 text-blue-300 font-bold py-2 rounded-xl transition-all shadow-[0_0_10px_rgba(59,130,246,0.1)] text-xs mt-2"
                                            >
                                                🤖 Auto-Assign Developer (Workload Balancer)
                                            </button>
                                        </div>

                                        {/* Internal Team Notes (Mini Chat) */}
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col h-[250px]">
                                            <h4 className="font-bold text-sm mb-3">Internal Project Notes</h4>
                                            <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-2 scrollbar-thin">
                                                {o.internal_notes && o.internal_notes.length > 0 ? o.internal_notes.map((n: any) => (
                                                    <div key={n.id} className="bg-[#0a0f1e] p-3 rounded-lg border border-white/5">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-xs font-bold text-blue-400">{n.author}</span>
                                                            <span className="text-[10px] text-gray-500">{new Date(n.created_at).toLocaleString()}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-300">{n.note}</p>
                                                    </div>
                                                )) : (
                                                    <p className="text-xs text-gray-500 italic text-center mt-10">Belum ada catatan internal tim. Cegah missed-communication di sini!</p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <input type="text" value={noteInput} onChange={e => setNoteInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddNote(o.id)} placeholder="Tinggalkan catatan..." className="flex-1 bg-[#0a0f1e] border border-white/10 px-3 py-2 rounded-lg text-xs outline-none focus:border-primary/50" />
                                                <button onClick={() => handleAddNote(o.id)} className="bg-white/10 hover:bg-white/20 px-3 rounded-lg text-xs font-bold transition-all">Kirim</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
