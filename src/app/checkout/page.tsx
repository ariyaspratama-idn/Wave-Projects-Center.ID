"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function CheckoutPage() {
    const [PACKAGES, setPACKAGES] = useState<any[]>([]);
    const [loadingPkgs, setLoadingPkgs] = useState(true);

    useEffect(() => {
        fetch("/api/v1/packages")
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setPACKAGES(data.data);
                }
                setLoadingPkgs(false);
            })
            .catch(() => setLoadingPkgs(false));
    }, []);

    const [form, setForm] = useState({
        client_name: "",
        client_email: "",
        client_whatsapp: "",
        project_purpose: "",
        package_id: "pkg_fullstack_mvp",
        github_url: "",
        payment_choice: "DP_30" as "DP_30" | "FULL",
    });
    const [result, setResult] = useState<{
        order_number: string;
        snap_token: string;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const selectedPkg = PACKAGES.find((p) => p.id === form.package_id) || PACKAGES[0];
    const totalPayment = selectedPkg ? (form.payment_choice === "DP_30" ? selectedPkg.price * 0.3 : selectedPkg.price) : 0;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            let uploadedAttachment = null;
            if (file) {
                setUploading(true);
                const sigRes = await fetch("/api/v1/files/signature", { method: "POST" });
                const sigData = await sigRes.json();

                if (!sigData.success) throw new Error("Gagal mendapatkan signature Cloudinary dari server");

                const formData = new FormData();
                formData.append("file", file);
                formData.append("api_key", sigData.data.api_key);
                formData.append("timestamp", sigData.data.timestamp);
                formData.append("signature", sigData.data.signature);
                formData.append("folder", sigData.data.folder);

                const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.data.cloud_name}/auto/upload`, {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error("Gagal mengunggah file ke Cloudinary");

                const uploadData = await uploadRes.json();
                uploadedAttachment = {
                    public_id: uploadData.public_id,
                    secure_url: uploadData.secure_url,
                    filename: file.name
                };
                setUploading(false);
            }

            const bodyPayload = {
                ...form,
                attachment: uploadedAttachment
            };

            const res = await fetch("/api/v1/orders/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Idempotency-Key": `checkout-${Date.now()}`,
                },
                body: JSON.stringify(bodyPayload),
            });

            const data = await res.json();
            if (data.success) {
                setResult(data.data);
            } else {
                setError(data.message || "Terjadi kesalahan");
            }
        } catch (err: any) {
            setError(err.message || "Gagal terhubung ke server");
        } finally {
            setUploading(false);
            setLoading(false);
        }
    }

    if (result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4">
                <div className="glass rounded-3xl p-10 max-w-md w-full text-center">
                    <div className="text-5xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold mb-2">Pesanan Berhasil!</h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Order Anda telah tercatat dalam sistem kami.
                    </p>
                    <div className="bg-white/5 rounded-xl p-4 text-left space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Nomor Order</span>
                            <span className="font-mono font-bold text-primary">
                                {result.order_number}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Snap Token</span>
                            <span className="font-mono text-xs text-gray-300 truncate ml-4">
                                {result.snap_token}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Total Bayar</span>
                            <span className="font-bold text-green-400">
                                Rp {totalPayment.toLocaleString("id-ID")}
                            </span>
                        </div>
                    </div>
                    <Link
                        href="/"
                        className="inline-block bg-primary hover:bg-primary-light text-white font-semibold px-8 py-3 rounded-full transition-all glow-blue text-sm"
                    >
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        );
    }

    if (loadingPkgs) return <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-gray-500">Memuat data checkout...</div>;

    return (
        <div className="min-h-screen bg-[#0a0f1e] py-10 px-4">
            {/* Header */}
            <div className="max-w-2xl mx-auto mb-8">
                <Link href="/" className="text-gray-400 hover:text-white text-sm transition">
                    ← Kembali
                </Link>
                <h1 className="text-3xl font-bold mt-4">
                    Checkout <span className="gradient-text">Pesanan</span>
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Lengkapi formulir di bawah untuk memulai proyek Anda.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="max-w-2xl mx-auto glass rounded-2xl p-8 space-y-6"
            >
                {/* Personal Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Nama Lengkap *</label>
                        <input
                            required
                            value={form.client_name}
                            onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"
                            placeholder="Ariyas Pratama"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Email *</label>
                        <input
                            required
                            type="email"
                            value={form.client_email}
                            onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"
                            placeholder="ariyas@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-gray-400 mb-1.5">WhatsApp *</label>
                    <input
                        required
                        value={form.client_whatsapp}
                        onChange={(e) => setForm({ ...form, client_whatsapp: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"
                        placeholder="081234567890"
                    />
                </div>

                {/* Package Selection */}
                <div>
                    <label className="block text-xs text-gray-400 mb-2">Pilih Paket *</label>
                    <div className="grid sm:grid-cols-3 gap-3">
                        {PACKAGES.map((p) => (
                            <button
                                type="button"
                                key={p.id}
                                onClick={() => setForm({ ...form, package_id: p.id })}
                                className={`rounded-xl p-4 text-left transition-all text-sm ${form.package_id === p.id
                                    ? "bg-primary/20 border border-primary/50"
                                    : "bg-white/5 border border-white/10 hover:border-white/20"
                                    }`}
                            >
                                <span className="font-semibold block">{p.name}</span>
                                <span className="text-xs text-gray-400 mt-1 block">
                                    Rp {p.price.toLocaleString("id-ID")}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Project Purpose */}
                <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Tujuan Proyek *</label>
                    <textarea
                        required
                        rows={3}
                        value={form.project_purpose}
                        onChange={(e) => setForm({ ...form, project_purpose: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 resize-none"
                        placeholder="Jelaskan secara singkat tujuan dan fitur utama proyek yang Anda inginkan..."
                    />
                </div>

                {/* GitHub URL */}
                <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Link Repo GitHub (opsional)</label>
                    <input
                        value={form.github_url}
                        onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"
                        placeholder="https://github.com/user/repo"
                    />
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Lampiran Dokumen / Referensi (opsional)</label>
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
                    />
                </div>

                {/* Payment Choice */}
                <div>
                    <label className="block text-xs text-gray-400 mb-2">Metode Pembayaran *</label>
                    <div className="flex gap-3">
                        {[
                            { val: "DP_30" as const, label: "DP 30%", sub: `Rp ${((selectedPkg?.price || 0) * 0.3).toLocaleString("id-ID")}` },
                            { val: "FULL" as const, label: "Bayar Penuh", sub: `Rp ${(selectedPkg?.price || 0).toLocaleString("id-ID")}` },
                        ].map((opt) => (
                            <button
                                type="button"
                                key={opt.val}
                                onClick={() => setForm({ ...form, payment_choice: opt.val })}
                                className={`flex-1 rounded-xl p-4 text-left transition-all text-sm ${form.payment_choice === opt.val
                                    ? "bg-primary/20 border border-primary/50"
                                    : "bg-white/5 border border-white/10 hover:border-white/20"
                                    }`}
                            >
                                <span className="font-semibold block">{opt.label}</span>
                                <span className="text-xs text-gray-400">{opt.sub}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                        {error}
                    </p>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary-light disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all glow-blue text-sm"
                >
                    {loading ? (uploading ? "Mengunggah File..." : "Memproses...") : `Bayar Rp ${totalPayment.toLocaleString("id-ID")}`}
                </button>

                <p className="text-xs text-gray-600 text-center">
                    Dengan menekan tombol di atas, Anda menyetujui syarat dan ketentuan Wave Projects Center.ID
                </p>
            </form>
        </div>
    );
}
