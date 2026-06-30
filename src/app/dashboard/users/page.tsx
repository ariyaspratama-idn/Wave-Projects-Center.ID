"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UsersManagementPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "Admin"
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

    useEffect(() => {
        const cached = localStorage.getItem("wave_user");
        if (cached) {
            const parsed = JSON.parse(cached);
            if (!parsed.roles?.some((r: any) => r.name === "Super Admin")) {
                router.push("/dashboard"); // Redirect if not super admin
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
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            const data = await res.json();
            if (data.success) {
                setMessage({ text: "Akun berhasil dibuat!", type: "success" });
                setForm({ name: "", email: "", phone: "", password: "", role: "Admin" });
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

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold mb-2">Manajemen Tim</h1>
            <p className="text-gray-400 text-sm mb-8">Hanya Super Admin yang dapat menambahkan akun tim baru.</p>

            <div className="glass rounded-2xl p-6">
                <h3 className="font-bold mb-4">Buat Akun Tim</h3>

                {message && (
                    <div className={`p-4 rounded-xl text-sm mb-4 border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">Nama Lengkap</label>
                            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" placeholder="Nama..." />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">Role (Jabatan)</label>
                            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full bg-[#161b2a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50">
                                <option value="Admin">Admin (Keuangan / CS / dsb)</option>
                                <option value="Developer">Developer (Full Stack)</option>
                                <option value="Marketing">Marketing</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Email Akses (@gmail.com wajib)</label>
                        <input required type="email" pattern="^[a-zA-Z0-9._%+-]+@gmail\.com$" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" placeholder="email@gmail.com" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5">No WhatsApp</label>
                        <input required pattern="^(?:\+62|62|0)8[1-9][0-9]{6,10}$" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" placeholder="0812..." />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Password Awal</label>
                        <input required minLength={6} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" placeholder="••••••••" />
                    </div>

                    <button type="submit" disabled={loading} className="mt-4 bg-primary hover:bg-primary-light text-white font-semibold py-2 px-6 rounded-lg text-sm transition-all disabled:opacity-50">
                        {loading ? "Menyimpan..." : "Daftarkan Akun"}
                    </button>
                </form>
            </div>
        </div>
    );
}
