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
    const [pdfGenerating, setPdfGenerating] = useState(false);
    const [prdProgress, setPrdProgress] = useState("");
    const [editingContact, setEditingContact] = useState(false);
    const [contactForm, setContactForm] = useState({ client_name: '', client_email: '', client_whatsapp: '', payment_status: '' });
    const [savingContact, setSavingContact] = useState(false);
    const [validatingPayment, setValidatingPayment] = useState(false);

    const fetchExecutiveData = () => {
        const token = localStorage.getItem("wave_token");
        fetch(`/api/v1/admin/orders/${orderId}`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setData(res.data);
                    setContactForm({
                        client_name: res.data.order.client_name || '',
                        client_email: res.data.order.client_email || '',
                        client_whatsapp: res.data.order.client_whatsapp || '',
                        payment_status: res.data.order.payment_status || ''
                    });
                }
                setLoading(false);
            });
    };

    const handleSaveContact = async () => {
        setSavingContact(true);
        try {
            const token = localStorage.getItem("wave_token");
            const res = await fetch(`/api/v1/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify(contactForm)
            });
            const result = await res.json();
            if (result.success) {
                alert('✅ Detail kontak klien berhasil diperbarui!');
                setEditingContact(false);
                fetchExecutiveData();
            } else {
                alert('Gagal: ' + result.error);
            }
        } catch (e: any) {
            alert('Error: ' + e.message);
        } finally {
            setSavingContact(false);
        }
    };

    useEffect(() => {
        if (!orderId) return;
        fetchExecutiveData();
    }, [orderId]);

    const handleGenerateAiKanban = async () => {
        if (!confirm("Kirim instruksi Brief ke Sistem AI untuk dibongkar jadi checklist teknikal? (Bisa memakan waktu 10-15 detik)")) return;

        setAiGenerating(true);
        const token = localStorage.getItem("wave_token");
        const res = await fetch(`/api/v1/admin/orders/${orderId}/kanban-ai`, {
            method: 'POST',
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
        });
        const data = await res.json();
        setAiGenerating(false);

        if (!data.success) {
            alert("Gagal memanggil AI: " + (data.error || "Unknown Error"));
        }

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

    const handleAutoAssign = async () => {
        const token = localStorage.getItem("wave_token");
        const res = await fetch(`/api/v1/admin/orders/${orderId}/auto-assign`, {
            method: 'POST',
            headers: { "Authorization": `Bearer ${token}` }
        });
        const ans = await res.json();
        if (ans.success) alert('🤖 AI Load Balancer: ' + ans.message);
        else alert('Error: ' + ans.error);
        fetchExecutiveData(); // reload
    };

    const handleDownloadPRD = async () => {
        if (!data.brief || !data.brief.core_attributes) {
            alert("Brief klien masih kosong, tidak bisa membuat dokumen.");
            return;
        }

        setPdfGenerating(true);
        setPrdProgress("Membuat Tahap 1/3 (Pendahuluan)...");
        try {
            const token = localStorage.getItem("wave_token");

            // Chunk 1
            const res1 = await fetch("/api/v1/admin/prd/generate-chunk", {
                method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ rawCustomerRequest: data.brief.core_attributes, part: 1, projectName: data.order.project_name || data.order.package_name, packagePrice: data.order.total_amount || data.order.master_package_price, packageTimeline: data.order.package_name?.toLowerCase().includes('starter') ? '2 Minggu' : data.order.package_name?.toLowerCase().includes('standard') ? '4 Minggu' : 'Sesuai Kesepakatan' })
            });
            if (!res1.ok) {
                const err = await res1.json().catch(() => ({}));
                throw new Error("Part 1: " + (err.error || "Gagal"));
            }
            const data1 = await res1.json();

            setPrdProgress("Membuat Tahap 2/3 (Analisis Data & QA)...");
            // Chunk 2
            const res2 = await fetch("/api/v1/admin/prd/generate-chunk", {
                method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ rawCustomerRequest: data.brief.core_attributes, part: 2, projectName: data.order.project_name || data.order.package_name, prevContext: data1.data, packagePrice: data.order.total_amount || data.order.master_package_price, packageTimeline: data.order.package_name?.toLowerCase().includes('starter') ? '2 Minggu' : data.order.package_name?.toLowerCase().includes('standard') ? '4 Minggu' : 'Sesuai Kesepakatan' })
            });
            if (!res2.ok) {
                const err = await res2.json().catch(() => ({}));
                throw new Error("Part 2: " + (err.error || "Gagal"));
            }
            const data2 = await res2.json();

            setPrdProgress("Membuat Tahap 3/3 (Sistem Database)...");
            // Chunk 3
            const res3 = await fetch("/api/v1/admin/prd/generate-chunk", {
                method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ rawCustomerRequest: data.brief.core_attributes, part: 3, projectName: data.order.project_name || data.order.package_name, prevContext: data2.data, packagePrice: data.order.total_amount || data.order.master_package_price, packageTimeline: data.order.package_name?.toLowerCase().includes('starter') ? '2 Minggu' : data.order.package_name?.toLowerCase().includes('standard') ? '4 Minggu' : 'Sesuai Kesepakatan' })
            });
            if (!res3.ok) {
                const err = await res3.json().catch(() => ({}));
                throw new Error("Part 3: " + (err.error || "Gagal"));
            }
            const data3 = await res3.json();

            setPrdProgress("Merender Dokumen Word...");

            const fullPrdData = {
                ...data1.data,
                ...data2.data,
                ...data3.data,
                rawCustomerRequest: data.brief.core_attributes
            };

            const res = await fetch("/api/v1/admin/prd", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    fullPrdData,
                    projectName: data.order.project_name || data.order.package_name,
                    orderId: Number(orderId)
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Terjadi kesalahan sistem API PRD saat render.');
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `PRD_${(data.order.client_name || 'Klien').replace(/\s+/g, '_')}_ORDER${orderId}.docx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            alert("✨ Dokumen PRD Word Berhasil Diunduh!");
        } catch (e: any) {
            alert("Gagal Unduh PRD: " + e.message);
        } finally {
            setPdfGenerating(false);
            setPrdProgress("");
        }
    };

    const handleValidatePayment = async () => {
        const isDPPelunasan = data?.order?.payment_status === 'dp_paid';
        const confirmMsg = isDPPelunasan
            ? 'Apakah Anda yakin ingin MEMVALIDASI PELUNASAN 70% ini?\n\nTindakan ini akan:\n• Menandai pembayaran sebagai LUNAS PENUH\n• Mengirim Invoice Lunas ke email klien via Brevo\n• Proyek siap untuk diserahkan (Handover)'
            : 'Apakah Anda yakin ingin MEMVALIDASI pembayaran ini?\n\nTindakan ini akan:\n• Menandai pembayaran (DP/Full) sebagai diterima\n• Mengirim Invoice ke email klien via Brevo\n• Menaikkan status order';
        if (!confirm(confirmMsg)) return;

        setValidatingPayment(true);
        try {
            const token = localStorage.getItem('wave_token');
            const res = await fetch(`/api/v1/admin/orders/${orderId}/validate-payment`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            const result = await res.json();
            if (result.success) {
                alert('✅ ' + result.message);
                fetchExecutiveData();
            } else {
                alert('Gagal: ' + result.error);
            }
        } catch (e: any) {
            alert('Error: ' + e.message);
        } finally {
            setValidatingPayment(false);
        }
    };

    const safeDate = (d: any) => { try { const dt = new Date(d); return isNaN(dt.getTime()) ? '-' : dt.toLocaleDateString('id-ID'); } catch { return '-'; } };

    if (loading) return <p className="text-gray-500 py-10">Mempersiapkan Executive Dashboard...</p>;
    if (!data) return <p className="text-red-500 py-10 font-bold">Akses ditolak atau Data ID tidak ditemukan.</p>;

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-extrabold gradient-text">Executive Dashboard: #{orderId.padStart(4, '0')}</h1>
                        <p className="text-sm text-gray-400 mt-1">Paket: <span className="text-white font-semibold">{data.order.package_name}</span></p>
                    </div>
                    <div className="flex border border-white/10 p-2 rounded-xl bg-white/5 items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">👷‍♂️ PIC (Developer)</span>
                            <span className="text-sm text-white font-bold">{data.developers?.find((d: any) => d.id === data.order.assigned_to)?.name || <span className="text-red-400">Belum Ditugaskan</span>}</span>
                        </div>
                        <button onClick={handleAutoAssign} className="bg-primary/20 text-primary hover:bg-primary hover:text-white border border-primary/30 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ml-2">
                            ⚡ Auto-Assign (Load Balancer)
                        </button>
                    </div>
                </div>

                {/* Client Contact Card */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">📋 Informasi Klien</h3>
                        <button
                            onClick={() => setEditingContact(!editingContact)}
                            className="text-[10px] text-primary hover:text-primary-light transition-all font-semibold"
                        >
                            {editingContact ? '✕ Batal' : '✏️ Edit'}
                        </button>
                    </div>

                    {!editingContact ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <span className="text-[10px] text-gray-500 block">Nama Klien</span>
                                <span className="text-sm font-semibold">{data.order.client_name || <span className="text-red-400 italic">Belum diisi</span>}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500 block">Email</span>
                                <span className="text-sm font-semibold">{data.order.client_email || <span className="text-red-400 italic">Belum diisi</span>}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500 block">WhatsApp</span>
                                <span className="text-sm font-semibold">{data.order.client_whatsapp || <span className="text-red-400 italic">Belum diisi</span>}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                <input value={contactForm.client_name} onChange={e => setContactForm({ ...contactForm, client_name: e.target.value })} placeholder="Nama Klien" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50" />
                                <input value={contactForm.client_email} onChange={e => setContactForm({ ...contactForm, client_email: e.target.value })} placeholder="Email Klien" type="email" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50" />
                                <input value={contactForm.client_whatsapp} onChange={e => setContactForm({ ...contactForm, client_whatsapp: e.target.value })} placeholder="08xxxxxxxxxx" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50" />
                                <select value={contactForm.payment_status} onChange={e => setContactForm({ ...contactForm, payment_status: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50">
                                    <option value="pending" className="text-black">❌ Belum Bayar</option>
                                    <option value="waiting_verification" className="text-black">⏳ Menunggu Validasi</option>
                                    <option value="dp_paid" className="text-black">🟠 DP 30% Diterima</option>
                                    <option value="paid" className="text-black">✅ Lunas</option>
                                </select>
                            </div>
                            <button onClick={handleSaveContact} disabled={savingContact} className="bg-green-500/20 text-green-300 border border-green-500/40 hover:bg-green-500/30 text-xs font-bold px-4 py-2 rounded-lg transition-all">
                                {savingContact ? '⏳ Menyimpan...' : '💾 Simpan Data Klien & Status Bayar'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Payment Status Badge + DP Info */}
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-gray-500">Status Bayar:</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${data.order.payment_status === 'paid' ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : data.order.payment_status === 'dp_paid' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : data.order.payment_status === 'waiting_verification' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                        {data.order.payment_status === 'paid' ? '✅ LUNAS'
                            : data.order.payment_status === 'dp_paid' ? '🟠 DP 30% DITERIMA — Menunggu Pelunasan 70%'
                                : data.order.payment_status === 'waiting_verification' ? '⏳ MENUNGGU VALIDASI'
                                    : '❌ BELUM BAYAR'}
                    </span>
                    {data.order.payment_choice === 'DP_30' && (
                        <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/10">
                            Metode: DP 30% | Total Paket: Rp {Number(data.order.total_amount / (data.order.payment_status === 'dp_paid' || data.order.payment_status === 'paid' ? 0.3 : 1)).toLocaleString('id-ID') || '-'}
                        </span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    {data.attachments && data.attachments.map((att: any) => (
                        <a key={att.id} href={att.secure_url} target="_blank" className="text-xs bg-blue-500/20 text-blue-300 px-3 py-2 rounded-lg border border-blue-500/40 hover:bg-blue-500/30 flex items-center gap-1 transition-all">
                            📎 Lihat Bukti Pembayaran ({safeDate(att.created_at)})
                        </a>
                    ))}
                    {data.attachments && data.attachments.length > 0 && data.order.payment_status !== 'paid' && (
                        <button onClick={handleValidatePayment} disabled={validatingPayment} className="text-xs bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-lg border border-emerald-500/40 hover:bg-emerald-500/30 flex items-center gap-1 font-bold transition-all glow-blue">
                            {validatingPayment ? '⏳ Memproses Validasi...'
                                : data.order.payment_status === 'dp_paid' ? '💰 Validasi Pelunasan 70% & Kirim Invoice LUNAS'
                                    : '✅ Validasi Pembayaran & Kirim Invoice'}
                        </button>
                    )}
                    {data.order.client_email && (
                        <button onClick={async () => {
                            const token = localStorage.getItem('wave_token');
                            const res = await fetch(`/api/v1/admin/orders/${orderId}/resend-invoice`, {
                                method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
                            });
                            const r = await res.json();
                            alert(r.success ? '📧 ' + r.message : '❌ Gagal: ' + r.error);
                        }} className="text-xs bg-purple-500/20 text-purple-300 px-3 py-2 rounded-lg border border-purple-500/40 hover:bg-purple-500/30 flex items-center gap-1 font-bold transition-all">
                            📧 Kirim Ulang Invoice via Email
                        </button>
                    )}
                    {data.brief && (
                        <button onClick={handleDownloadPRD} disabled={pdfGenerating} className="text-xs bg-green-500/20 text-green-300 px-3 py-2 rounded-lg border border-green-500/40 hover:bg-green-500/30 flex items-center gap-1 font-bold transition-all">
                            {pdfGenerating ? (prdProgress ? `🔄 ${prdProgress}` : '🔄 Menyusun Word...') : '📄 Unduh Dokumen PRD (.docx)'}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* LEFT PANEL: KANBAN & BRIEF */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass p-6 rounded-2xl border border-white/10 shadow-xl">
                        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
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
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-sm font-semibold leading-tight">{task.title}</h4>
                                                    {task.id && (
                                                        <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono border border-blue-500/30 whitespace-nowrap ml-2">
                                                            TASK-{orderId}-{task.id}
                                                        </span>
                                                    )}
                                                </div>
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
