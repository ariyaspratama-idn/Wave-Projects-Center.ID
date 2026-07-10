"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Turnstile } from '@marsidev/react-turnstile';

interface Message {
    role: "user" | "ai";
    content: string;
}

const SUGGESTIONS = [
    "Saya ingin membuat aplikasi e-commerce",
    "Buatkan website company profile modern",
    "Saya butuh sistem manajemen internal",
    "Berapa biaya untuk membuat aplikasi kasir?",
];

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "ai",
            content:
                "Halo! 👋 Saya adalah AI Consultant dari Wave Projects Center.ID. Ceritakan kebutuhan proyek Anda, dan saya akan merekomendasikan paket yang paling cocok serta menganalisis arsitektur teknisnya.",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string>("");
    const bottomRef = useRef<HTMLDivElement>(null);
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Ensure session starts fresh when they refresh the browser, since the UI visual state also starts fresh
    useEffect(() => {
        localStorage.removeItem("wave_chat_session");
    }, []);

    async function handleSend(text?: string) {
        const msg = text || input;
        if (!msg.trim()) return;
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: msg }]);
        setLoading(true);

        try {
            const token = localStorage.getItem("wave_chat_session");
            const res = await fetch("/api/v1/chat/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: msg,
                    session_token: token,
                    customer_name: "Public Guest (Web)",
                    turnstile_token: turnstileToken
                })
            });
            const data = await res.json();
            if (data.success && data.data) {
                localStorage.setItem("wave_chat_session", data.data.session_token);
                setMessages((prev) => [...prev, { role: "ai", content: data.data.reply }]);
            } else {
                setMessages((prev) => [...prev, { role: "ai", content: "Maaf, sistem layanan sedang sibuk." }]);
            }
        } catch (e) {
            setMessages((prev) => [...prev, { role: "ai", content: "Koneksi ke server gagal. Coba lagi nanti." }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#0a0f1e]">
            {siteKey && (
                <div className="hidden">
                    <Turnstile
                        siteKey={siteKey}
                        options={{ size: "invisible" }}
                        onSuccess={(token) => setTurnstileToken(token)}
                    />
                </div>
            )}
            {/* Header */}
            <header className="glass border-b border-white/5 px-4 py-3 flex items-center gap-3">
                <Link href="/" className="text-gray-400 hover:text-white transition">
                    ← Kembali
                </Link>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm font-semibold">AI Consultant</span>
                    <span className="text-xs text-gray-500">• Gemini 1.5 Flash</span>
                </div>
            </header>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl w-full mx-auto">
                {messages.map((m, i) => {
                    const hasTrigger = m.content.match(/\[CHECKOUT_TRIGGER:(\d+)\]/);
                    let displayContent = m.content;
                    if (hasTrigger) {
                        displayContent = m.content.replace(hasTrigger[0], "");
                    }

                    return (
                        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed flex flex-col gap-3 ${m.role === "user"
                                    ? "bg-primary text-white rounded-br-md"
                                    : "glass text-gray-200 rounded-bl-md"
                                    }`}
                            >
                                <div className="whitespace-pre-wrap">{displayContent}</div>
                                {hasTrigger && (
                                    <Link
                                        href={`/checkout?package_id=${hasTrigger[1]}`}
                                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl text-center transition-all glow-blue mt-2 border border-blue-400/50"
                                    >
                                        💳 Buat Pesanan & Bayar Sekarang
                                    </Link>
                                )}
                            </div>
                        </div>
                    );
                })}

                {loading && (
                    <div className="flex justify-start">
                        <div className="glass rounded-2xl rounded-bl-md px-5 py-3 text-sm text-gray-400">
                            <span className="animate-pulse">AI sedang berpikir...</span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Suggestions (only when few messages) */}
            {messages.length <= 2 && (
                <div className="max-w-3xl w-full mx-auto px-4 pb-2 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => handleSend(s)}
                            className="text-xs bg-white/5 border border-white/10 rounded-full px-4 py-2 text-gray-400 hover:text-white hover:border-primary/40 transition"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/5">
                <div className="max-w-3xl mx-auto flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Ceritakan proyek impian Anda..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition"
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={loading || !input.trim()}
                        className="bg-primary hover:bg-primary-light disabled:opacity-40 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all glow-blue"
                    >
                        Kirim
                    </button>
                </div>
            </div>
        </div>
    );
}

function generateMockReply(msg: string): string {
    const lower = msg.toLowerCase();
    if (lower.includes("e-commerce") || lower.includes("toko"))
        return "Untuk proyek e-commerce, saya merekomendasikan **Paket Fullstack MVP** (Rp 5.000.000). Paket ini mencakup:\n\n✅ Katalog Produk & Keranjang Belanja\n✅ Integrasi Payment Gateway Midtrans\n✅ Admin Panel untuk manajemen pesanan\n✅ Database TiDB Cloud\n✅ Deploy ke Vercel\n\nEstimasi pengerjaan: 30 hari kerja. Apakah Anda ingin melanjutkan ke proses checkout?";
    if (lower.includes("company profile") || lower.includes("landing"))
        return "Untuk website company profile, **Paket Landing Page** (Rp 1.500.000) sangat cocok! Termasuk:\n\n✅ Desain custom modern & responsif\n✅ Form kontak terintegrasi\n✅ SEO optimized\n✅ Deploy gratis di Vercel\n\nEstimasi pengerjaan: 7 hari. Mau saya buatkan draft spesifikasinya?";
    if (lower.includes("biaya") || lower.includes("harga"))
        return "Berikut daftar harga paket kami:\n\n💰 Landing Page: Rp 1.500.000 (7 hari)\n💰 Fullstack MVP: Rp 5.000.000 (30 hari)\n💰 Custom Portal: Rp 15.000.000+ (60 hari)\n\nSemua paket mendukung pembayaran DP 30% melalui Midtrans. Paket mana yang menarik perhatian Anda?";
    return "Terima kasih atas informasinya! Berdasarkan kebutuhan Anda, saya menyarankan untuk memulai dengan **Paket Fullstack MVP** yang mencakup backend Laravel, frontend Next.js, database TiDB, dan integrasi payment Midtrans.\n\nApakah ada fitur spesifik yang ingin Anda sertakan? Saya bisa menganalisis lebih lanjut dan menyiapkan draft PRD teknis untuk tim developer kami.";
}
