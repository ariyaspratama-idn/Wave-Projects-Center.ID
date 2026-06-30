"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("wave_token");
        if (!token) {
            router.push("/login");
            return;
        }

        fetch("/api/v1/orders", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setOrders(data.data);
                } else {
                    setError(data.message || "Gagal mengambil data pesanan.");
                }
            })
            .catch(() => setError("Terjadi kesalahan jaringan."))
            .finally(() => setLoading(false));
    }, [router]);

    if (loading) return <div className="text-gray-400">Loading pesanan...</div>;
    if (error) return <div className="text-red-400">{error}</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Daftar Pesanan</h1>

            {orders.length === 0 ? (
                <div className="glass rounded-2xl p-8 text-center">
                    <p className="text-gray-400">Belum ada pesanan ditemukan.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {orders.map((order) => (
                        <div key={order.id} className="glass rounded-2xl p-6 border border-white/5 hover:border-primary/30 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{order.title || order.project_name}</h3>
                                    <p className="text-xs text-gray-500 font-mono mt-1">ID: {order.order_number}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold 
                                    ${order.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                        order.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                            'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`
                                }>
                                    {order.status.toUpperCase().replace('_', ' ')}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm bg-white/5 p-4 rounded-xl">
                                <div>
                                    <span className="text-gray-500 block text-xs">Pilihan Paket</span>
                                    <span className="font-semibold">Paket ID: {order.package_id}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block text-xs">Pembayaran</span>
                                    <span className="font-semibold">{order.payment_type === 'dp' ? 'DP 30%' : 'Lunas (Full)'}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-500 block text-xs">Klien / Detail Kontak</span>
                                    <span className="font-semibold">{order.client_name} - {order.whatsapp}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
