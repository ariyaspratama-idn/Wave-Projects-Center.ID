"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UsersManagementPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [form, setForm] = useState({
        name: "", email: "", phone: "", password: "", role: "Admin",
        github_username: "", bank_name: "", bank_account_number: "", bank_account_name: "", notification_email: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

    useEffect(() => {
        const cached = localStorage.getItem("wave_user");
        if (cached) {
            const parsed = JSON.parse(cached);
            if (!parsed.roles?.some((r: any) => r.name === "Super Admin")) {
                router.push("/dashboard");
            } else {
                setUser(parsed);
            }
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const token = localStorage.getItem("wave_token");

        try {
            const res = await fetch("/api/v1/admin/users/create", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(form)
            });

            const data = await res.json();
            if (data.success) {
                setMessage({ text: data.message || "Akun berhasil dibuat!", type: "success" });
                setForm({ name: "", email: "", phone: "", password: "", role: "Admin", github_username: "", bank_name: "", bank_account_number: "", bank_account_name: "", notification_email: "" });
            } else {
                setMessage({ text: data.message || "Gagal membuat akun.", type: "error" });
            }
        } catch (err) {
            setMessage({ text: "Terjadi kesalahan pada server.", type: "error" });
        } finally {
            setLoading(false);
        }
    }

    if (!user) return null;

    const isDev = form.role === 'Developer';

    return (
        <div className="max-w-3xl">
            <h1 className="text-2xl font-bold mb-2">Manajemen Tim</h1>
            <p className="text-gray-400 text-sm mb-8">Daftarkan anggota tim baru. Setiap anggota akan mendapat akses sesuai role.</p>

            {message && (
                <div className={`p-4 rounded-xl text-sm mb-6 border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Section 1: Identitas & Role */}
                <div className="glass rounded-xl p-6 border border-white/5">
                    <h3 className="font-bold text-sm text-gray-200 mb-1">👤 Identitas & Jabatan</h3>
                    <p className="text-[10px] text-gray-500 mb-4">Informasi dasar login anggota tim</p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">Nama Lengkap <span className="text-red-400">*</span></label>
                            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50" placeholder="Nama lengkap..." />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">Role (Jabatan) <span className="text-red-400">*</span></label>
                            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full bg-[#161b2a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50">
                                <option value="Admin">Admin (Keuangan / CS / Marketing)</option>
                                <option value="Developer">Developer (Full Stack)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">Email Login (@gmail.com) <span className="text-red-400">*</span></label>
                            <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50" placeholder="email@gmail.com" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">Password Awal <span className="text-red-400">*</span></label>
                            <input required minLength={6} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50" placeholder="Min. 6 karakter" />
                        </div>
                    </div>
                </div>

                {/* Section 2: Kontak & Komunikasi */}
                <div className="glass rounded-xl p-6 border border-white/5">
                    <h3 className="font-bold text-sm text-gray-200 mb-1">📱 Kontak & Komunikasi Internal</h3>
                    <p className="text-[10px] text-gray-500 mb-4">Untuk koordinasi internal tim dan notifikasi pesanan</p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">No. WhatsApp <span className="text-red-400">*</span></label>
                            <input required pattern="^(?:\+62|62|0)8[1-9][0-9]{6,10}$" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50" placeholder="0812xxxxxxxx" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">Email Notifikasi (Terima pesanan masuk)</label>
                            <input type="email" value={form.notification_email} onChange={e => setForm({ ...form, notification_email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50" placeholder="email-notif@gmail.com (opsional, bisa sama dgn login)" />
                        </div>
                    </div>
                </div>

                {/* Section 3: Developer Only — GitHub */}
                {isDev && (
                    <div className="glass rounded-xl p-6 border border-blue-500/20 bg-blue-900/5">
                        <h3 className="font-bold text-sm text-blue-400 mb-1">🔗 Developer — GitHub & Webhook</h3>
                        <p className="text-[10px] text-gray-500 mb-4">Username GitHub akan digunakan untuk tracking deploy webhook dari customer</p>
                        <div>
                            <label className="block text-xs text-blue-400 font-bold mb-1.5">Username GitHub <span className="text-red-400">*</span></label>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-sm">github.com/</span>
                                <input required value={form.github_username} onChange={e => setForm({ ...form, github_username: e.target.value })} className="flex-1 bg-blue-900/20 border border-blue-500/40 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-400 outline-none" placeholder="username" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Section 4: Rekening Pembayaran */}
                <div className="glass rounded-xl p-6 border border-white/5">
                    <h3 className="font-bold text-sm text-gray-200 mb-1">🏦 Rekening Pembayaran</h3>
                    <p className="text-[10px] text-gray-500 mb-4">
                        {isDev ? 'Untuk pembayaran fee pengerjaan proyek' : 'Untuk pencairan gaji / reimbursement / komisi'}
                    </p>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">Nama Bank</label>
                            <select value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} className="w-full bg-[#161b2a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50">
                                <option value="">-- Pilih Bank --</option>
                                <option value="BNI">BNI</option>
                                <option value="BCA">BCA</option>
                                <option value="BRI">BRI</option>
                                <option value="Mandiri">Mandiri</option>
                                <option value="BSI">BSI</option>
                                <option value="CIMB Niaga">CIMB Niaga</option>
                                <option value="Permata">Permata</option>
                                <option value="Danamon">Danamon</option>
                                <option value="DANA">DANA</option>
                                <option value="OVO">OVO</option>
                                <option value="GoPay">GoPay</option>
                                <option value="ShopeePay">ShopeePay</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">No. Rekening</label>
                            <input value={form.bank_account_number} onChange={e => setForm({ ...form, bank_account_number: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50" placeholder="xxxxxxxxxxxx" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">Atas Nama</label>
                            <input value={form.bank_account_name} onChange={e => setForm({ ...form, bank_account_name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50" placeholder="Nama sesuai rekening" />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20">
                    {loading ? "⏳ Menyimpan..." : "🚀 Daftarkan Anggota Tim"}
                </button>
            </form>
        </div>
    );
}
