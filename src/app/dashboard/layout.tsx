"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("wave_token");
        if (!token) {
            router.push("/login");
            return;
        }

        // Validate token
        fetch("/api/v1/me", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setUser(data.data);
                    // Sinkronkan cache
                    localStorage.setItem("wave_user", JSON.stringify(data.data));
                } else {
                    localStorage.clear();
                    router.push("/login");
                }
            })
            .catch(() => {
                // Error network, just try local cache
                const cached = localStorage.getItem("wave_user");
                if (cached) setUser(JSON.parse(cached));
            })
            .finally(() => {
                setLoading(false);
            });
    }, [router]);

    const handleLogout = () => {
        localStorage.clear();
        router.push("/login"); // Optimistically redirect
        fetch("/api/v1/logout", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("wave_token")}`
            }
        });
    }

    if (loading) return <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-gray-400">Loading Dashboard...</div>;
    if (!user) return null;

    const roleName = user.roles && user.roles.length > 0 ? user.roles[0].name : "Customer";
    const isSuperAdmin = roleName === "Super Admin";

    return (
        <div className="min-h-screen flex text-sm bg-[#0a0f1e]">
            {/* Sidebar */}
            <div className="w-64 border-r border-white/10 p-6 flex flex-col justify-between hidden md:flex glass">
                <div>
                    <h2 className="text-xl font-bold gradient-text mb-8">Wave Center</h2>

                    <nav className="space-y-1">
                        <Link href="/dashboard" className="block text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all text-sm font-medium">
                            <span className="opacity-70 mr-2">📊</span> Beranda Dashboard
                        </Link>

                        {(roleName === "Super Admin" || roleName === "Customer Service") && (
                            <Link href="/dashboard/chat" className="block text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all relative text-sm font-medium">
                                <span className="opacity-70 mr-2">💬</span> Live Chat Panel <span className="absolute right-3 top-3.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            </Link>
                        )}

                        <Link href="/dashboard/orders" className="block text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all text-sm font-medium">
                            <span className="opacity-70 mr-2">📦</span> {roleName === "Customer" ? "Pesanan Anda" : "Manajemen Pesanan"}
                        </Link>

                        {(roleName === "Super Admin" || roleName === "Admin Keuangan") && (
                            <Link href="/dashboard/finance" className="block text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all text-sm font-medium">
                                <span className="opacity-70 mr-2">💰</span> Manajemen Keuangan
                            </Link>
                        )}

                        {roleName === "Super Admin" && (
                            <>
                                <Link href="/dashboard/prd" className="block text-gray-300 hover:text-white bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 px-4 py-3 rounded-lg transition-all font-semibold my-2 text-sm">
                                    <span className="opacity-90 mr-2">✨</span> Generate PRD
                                </Link>

                                <Link href="/dashboard/team" className="block text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all text-sm font-medium border-t border-white/5 mt-2 pt-4">
                                    <span className="opacity-70 mr-2">👥</span> Manajemen Tim
                                </Link>

                                <div className="space-y-1">
                                    <div className="px-4 py-2 mt-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Manajemen Master</div>
                                    <Link href="/dashboard/packages" className="block text-gray-400 hover:text-white pl-8 pr-4 py-2 rounded-lg transition-all text-sm">
                                        Pengaturan Paket
                                    </Link>
                                    <Link href="/dashboard/portfolios" className="block text-gray-400 hover:text-white pl-8 pr-4 py-2 rounded-lg transition-all text-sm">
                                        Data Portfolio
                                    </Link>
                                    <Link href="/dashboard/ai" className="block text-blue-400 hover:text-blue-300 pl-8 pr-4 py-2 rounded-lg transition-all text-sm font-semibold">
                                        AI Training Center
                                    </Link>
                                </div>

                                <Link href="/dashboard/settings" className="block text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all text-sm font-medium mt-4 border-t border-white/5 pt-4">
                                    <span className="opacity-70 mr-2">⚙️</span> Pengaturan Agensi
                                </Link>
                            </>
                        )}
                    </nav>
                </div>

                <div>
                    <div className="px-4 py-3 bg-white/5 rounded-lg mb-4 text-xs text-gray-400">
                        <div className="font-semibold text-white">{user.name}</div>
                        <div>Role: {roleName}</div>
                    </div>
                    <button onClick={handleLogout} className="w-full text-left text-red-400 hover:text-red-300 px-4 py-2 hover:bg-red-500/10 rounded-lg transition-all">
                        Log Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-8 text-white relative h-screen overflow-y-auto">
                <header className="md:hidden flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                    <div className="font-bold">Wave Center</div>
                    <button onClick={handleLogout} className="text-red-400 text-xs">Logout</button>
                </header>
                {children}
            </main>
        </div >
    );
}
