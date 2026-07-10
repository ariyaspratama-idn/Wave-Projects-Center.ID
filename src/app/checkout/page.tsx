"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function CheckoutPage() {
    const [PACKAGES, setPACKAGES] = useState<any[]>([]);
    const [loadingPkgs, setLoadingPkgs] = useState(true);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        fetch("/api/v1/packages")
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data && data.data.length > 0) {
                    setPACKAGES(data.data);

                    // Check if package_id was passed from AI Chat CTA
                    const query = new URLSearchParams(window.location.search);
                    const queryPkgId = parseInt(query.get("package_id") || "0");
                    const hasChatSession = query.has("chat_session");
                    const matchedPkg = data.data.find((p: any) => p.id === queryPkgId);

                    if (matchedPkg) {
                        if (hasChatSession) setIsLocked(true);
                        setForm(prev => ({ ...prev, package_id: matchedPkg.id }));
                    } else {
                        setForm(prev => ({ ...prev, package_id: data.data[0].id }));
                    }
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
        package_id: 0,
        github_url: "",
        payment_choice: "DP_30" as "DP_30" | "FULL",
    });
    const [result, setResult] = useState<{
        order_number: string;
        snap_token: string;
        order_id: number;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptUploading, setReceiptUploading] = useState(false);
    const [paymentSubmitted, setPaymentSubmitted] = useState(false);

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

    async function handleReceiptSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!receiptFile || !result) return;
        setReceiptUploading(true);
        setError("");

        try {
            const sigRes = await fetch("/api/v1/files/signature", { method: "POST" });
            const sigData = await sigRes.json();

            if (!sigData.success) throw new Error("Gagal mendapatkan signature Cloudinary");

            const formData = new FormData();
            formData.append("file", receiptFile);
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

            const res = await fetch("/api/v1/orders/payment-receipt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    order_id: result.order_id,
                    receipt_url: uploadData.secure_url,
                    receipt_public_id: uploadData.public_id
                }),
            });

            const data = await res.json();
            if (data.success) {
                setPaymentSubmitted(true);
            } else {
                setError(data.message || "Terjadi kesalahan saat mengkonfirmasi pembayaran");
            }
        } catch (err: any) {
            setError(err.message || "Gagal mengirim bukti pembayaran");
        } finally {
            setReceiptUploading(false);
        }
    }

    if (result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4">
                <div className="glass rounded-3xl p-10 max-w-md w-full text-center">
                    <div className="text-5xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold mb-2">
                        {paymentSubmitted ? "Bukti Terkirim!" : "Menunggu Pembayaran"}
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">
                        {paymentSubmitted
                            ? "Bukti pembayaran berhasil diunggah dan sedang diverifikasi oleh Admin."
                            : "Satu langkah lagi! Silakan transfer dan unggah bukti pembayaran Anda."}
                    </p>
                    <div className="bg-white/5 rounded-xl p-4 text-left space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Nomor Order</span>
                            <span className="font-mono font-bold text-primary">
                                {result.order_number}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Status Pembayaran</span>
                            <span className="font-mono text-xs text-yellow-400 font-bold ml-4">
                                MENUNGGU TRANSFER
                            </span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                            <span className="text-gray-500">Total Bayar</span>
                            <span className="font-bold text-green-400">
                                Rp {totalPayment.toLocaleString("id-ID")}
                            </span>
                        </div>
                    </div>

                    <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-left space-y-3 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <p className="text-sm text-white font-semibold">Instruksi Pembayaran Manual</p>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Payment gateway otomatis kami sedang dalam tahap verifikasi KYC. Silakan lakukan transfer antar bank ke rekening BNI berkut ini:
                        </p>
                        <div className="bg-black/30 p-3.5 rounded-lg flex flex-col gap-2 border border-white/5">
                            <div>
                                <span className="text-xs text-gray-500 block mb-0.5">Bank Tujuan:</span>
                                <span className="font-bold text-white text-sm">BNI (Taplus)</span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 block mb-0.5">Nomor Rekening:</span>
                                <div className="flex items-center justify-between">
                                    <span className="font-mono font-bold text-lg text-primary tracking-wide">
                                        2090596078
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 block mb-0.5">Atas Nama:</span>
                                <span className="font-bold text-white text-sm">ARIYAS PRATAMA RAMADHAN</span>
                            </div>
                        </div>
                    </div>

                    {!paymentSubmitted && (
                        <form onSubmit={handleReceiptSubmit} className="bg-white/5 border border-white/10 rounded-xl p-4 text-left space-y-4 mb-6">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5 focus:outline-none">Unggah Bukti Transfer / Pembayaran</label>
                                <input
                                    type="file"
                                    required
                                    accept="image/*"
                                    onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)}
                                    className="w-full bg-[#0a0f1e]/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={receiptUploading || !receiptFile}
                                className="w-full bg-primary hover:bg-primary-light disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all glow-blue text-sm"
                            >
                                {receiptUploading ? "Mengunggah..." : "Konfirmasi Pembayaran"}
                            </button>
                        </form>
                    )}

                    {paymentSubmitted && (
                        <Link
                            href="/"
                            className="inline-block bg-primary hover:bg-primary-light text-white font-semibold px-8 py-3 rounded-full transition-all glow-blue text-sm"
                        >
                            Kembali ke Beranda
                        </Link>
                    )}
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
                        <label className="block text-xs text-gray-400 mb-1.5">Email (Wajib Gmail aktif) *</label>
                        <input
                            required
                            type="email"
                            pattern="^[a-zA-Z0-9._%+-]+@gmail\.com$"
                            title="Hanya menerima alamat @gmail.com"
                            value={form.client_email}
                            onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"
                            placeholder="ariyas@gmail.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-gray-400 mb-1.5">WhatsApp (Nomor Indonesia Aktif) *</label>
                    <input
                        required
                        type="text"
                        pattern="^(?:\+62|62|0)8[1-9][0-9]{6,10}$"
                        title="Masukkan nomor WA Indonesia yang valid (contoh: 0812... atau 62812...)"
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
                                disabled={isLocked && form.package_id !== p.id}
                                onClick={() => setForm({ ...form, package_id: p.id })}
                                className={`rounded-xl p-4 text-left transition-all text-sm ${form.package_id === p.id
                                    ? "bg-primary/20 border border-primary/50"
                                    : isLocked
                                        ? "bg-[#0a0f1e]/50 border border-white/5 opacity-50 cursor-not-allowed hidden sm:block"
                                        : "bg-white/5 border border-white/10 hover:border-white/20"
                                    } ${isLocked && form.package_id !== p.id ? 'hidden sm:block' : ''}`}
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
