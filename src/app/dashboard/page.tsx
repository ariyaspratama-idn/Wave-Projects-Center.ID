"use client";

import { useEffect, useState } from "react";

export default function DashboardIndex() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const cached = localStorage.getItem("wave_user");
        if (cached) setUser(JSON.parse(cached));
    }, []);

    if (!user) return null;

    const roleName = user.roles && user.roles.length > 0 ? user.roles[0].name : "Customer";

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Selamat Datang, {user.name} 👋</h1>
            <p className="text-gray-400">
                Anda masuk sebagai <span className="font-semibold text-primary">{roleName}</span>.
            </p>

            {roleName === "Super Admin" && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
                    <h3 className="font-bold text-lg mb-2">Panel Super Admin</h3>
                    <p className="text-sm text-gray-300">
                        Dari sini Anda dapat mendaftarkan akun baru untuk Admin Keuangan, Tele-marketing, Customer Service, dan Developer Full Stack.
                        Silakan buka menu <strong>Manajemen Tim</strong> di sidebar.
                    </p>
                </div>
            )}

            {(roleName === "Developer" || roleName === "Admin") && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="font-bold text-lg mb-2">Panel Operasional Tim</h3>
                    <p className="text-sm text-gray-300">
                        Pantau daftar proyek dan pesanan yang masuk untuk Anda kelola.
                    </p>
                </div>
            )}

            {roleName === "Customer" && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="font-bold text-lg mb-2">Dashboard Klien</h3>
                    <p className="text-sm text-gray-300">
                        Lacak riwayat pesanan Anda, status pengerjaan aplikasi, dan unduh dokumen proyek langsung dari sini.
                    </p>
                </div>
            )}
        </div>
    );
}
