"use client";

import Link from "next/link";

const MOCK_ORDERS = [
    { id: "WAVE-2026-1001", pkg: "Fullstack MVP", status: "in_progress", paid: "DP 30%", date: "2026-06-20" },
    { id: "WAVE-2026-1002", pkg: "Landing Page", status: "completed", paid: "Full", date: "2026-06-18" },
    { id: "WAVE-2026-1003", pkg: "Custom Portal", status: "pending_payment", paid: "—", date: "2026-06-23" },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending_payment: { label: "Menunggu Bayar", color: "text-yellow-400 bg-yellow-500/10" },
    in_progress: { label: "Dikerjakan", color: "text-blue-400 bg-blue-500/10" },
    completed: { label: "Selesai", color: "text-green-400 bg-green-500/10" },
    cancelled: { label: "Dibatalkan", color: "text-red-400 bg-red-500/10" },
};

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-[#0a0f1e]">
            {/* Sidebar + Content */}
            <div className="flex">
                {/* Sidebar */}
                <aside className="hidden md:flex flex-col w-56 min-h-screen glass border-r border-white/5 p-4">
                    <Link href="/" className="text-lg font-extrabold mb-8">
                        <span className="gradient-text">Wave</span>{" "}
                        <span className="text-white/60 text-sm">Dashboard</span>
                    </Link>
                    <nav className="space-y-1 flex-1">
                        {[
                            { label: "Overview", href: "/dashboard", active: true },
                            { label: "Pesanan Saya", href: "/dashboard" },
                            { label: "Notifikasi", href: "/dashboard" },
                            { label: "Profil", href: "/dashboard" },
                        ].map((item, i) => (
                            <Link
                                key={i}
                                href={item.href}
                                className={`block px-3 py-2 rounded-lg text-sm transition ${item.active
                                        ? "bg-primary/20 text-primary font-semibold"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="text-xs text-gray-600 mt-4">Wave Projects v1.0</div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 sm:p-8">
                    {/* Top bar */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold">Dashboard</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Selamat datang kembali, Ariyas 👋</p>
                        </div>
                        <Link
                            href="/checkout"
                            className="bg-primary hover:bg-primary-light text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all glow-blue"
                        >
                            + Pesanan Baru
                        </Link>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: "Total Pesanan", val: "3", icon: "📦" },
                            { label: "Dikerjakan", val: "1", icon: "🔧" },
                            { label: "Selesai", val: "1", icon: "✅" },
                            { label: "Total Bayar", val: "Rp 6.5jt", icon: "💰" },
                        ].map((s, i) => (
                            <div key={i} className="glass rounded-xl p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-500">{s.label}</span>
                                    <span className="text-lg">{s.icon}</span>
                                </div>
                                <p className="text-2xl font-bold">{s.val}</p>
                            </div>
                        ))}
                    </div>

                    {/* Orders Table */}
                    <div className="glass rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/5">
                            <h2 className="font-semibold text-sm">Riwayat Pesanan</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-gray-500 border-b border-white/5">
                                        <th className="px-5 py-3 font-medium">Order ID</th>
                                        <th className="px-5 py-3 font-medium">Paket</th>
                                        <th className="px-5 py-3 font-medium">Status</th>
                                        <th className="px-5 py-3 font-medium">Pembayaran</th>
                                        <th className="px-5 py-3 font-medium">Tanggal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MOCK_ORDERS.map((o) => {
                                        const st = STATUS_MAP[o.status] || STATUS_MAP.pending_payment;
                                        return (
                                            <tr key={o.id} className="border-b border-white/5 hover:bg-white/[.02] transition">
                                                <td className="px-5 py-4 font-mono text-primary">{o.id}</td>
                                                <td className="px-5 py-4 text-gray-300">{o.pkg}</td>
                                                <td className="px-5 py-4">
                                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.color}`}>
                                                        {st.label}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-gray-400">{o.paid}</td>
                                                <td className="px-5 py-4 text-gray-500">{o.date}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
