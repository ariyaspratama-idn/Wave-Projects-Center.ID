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

                    <nav className="space-y-2">
                        <Link href="/dashboard" className="block text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all">
                            Beranda Dashboard
                        </Link>
                        {roleName !== 'Customer' && (
                            <>
                                <Link href="/dashboard/users" className="block text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all">
                                    Manajemen Tim
                                </Link>
                                <Link href="/dashboard/portfolios" className="block text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all">
                                    Manajemen Portfolio
                                </Link>
                                <Link href="/dashboard/chat" className="block text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all relative">
                                    Live Chat Panel <span className="absolute right-3 top-2.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                </Link>
                                <Link href="/dashboard/prd" className="block text-gray-300 hover:text-white bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 px-4 py-2 rounded-lg transition-all font-semibold">
                                    ✨ Generate PRD
                                </Link>
                            </>
                        )}
                        <Link href="/dashboard/orders" className="block text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all">
                            Pesanan Anda
                        </Link>
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
