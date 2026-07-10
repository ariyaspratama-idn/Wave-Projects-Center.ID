"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { useParams } from 'next/navigation';

const STAGES = [
    "New Lead", "Quotation", "Down Payment", "Development",
    "Testing", "Revision", "Final Payment", "Handover", "Maintenance"
];

export default function PublicTracker() {
    const params = useParams();
    const orderId = params?.id as string;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!orderId) return;
        fetch(`/api/v1/track/${orderId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setOrder(data.data);
                } else {
                    setError(data.error);
                }
                setLoading(false);
            });
    }, [orderId]);

    if (loading) return <div className="text-center py-20 text-gray-400">Menarik data pelacakan kurir sistem...</div>;
    if (error) return <div className="text-center py-20 text-red-500 font-bold">Error: {error}</div>;

    const currentStageIdx = STAGES.indexOf(order.status || 'New Lead');

    return (
        <div className="min-h-screen bg-[#0a0f1e] text-white p-8 font-sans flex items-center justify-center">
            <div className="w-full max-w-3xl">

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2">Live Access Tracker</h1>
                    <p className="text-gray-400">Kode Token: #{order.id.toString().padStart(6, '0')}</p>
                </div>

                <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl">
                    <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                        <div>
                            <h2 className="text-2xl font-bold">{order.package_name || 'Proyek Kustom Khusus'}</h2>
                            <p className="text-gray-400 text-sm mt-1">Klien: {order.client_name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-primary font-extrabold bg-primary/10 px-4 py-2 rounded-xl text-lg">
                                {order.status}
                            </p>
                        </div>
                    </div>

                    <div className="relative pl-6">
                        {STAGES.map((stage, idx) => {
                            const isDone = idx < currentStageIdx;
                            const isActive = idx === currentStageIdx;
                            const isFuture = idx > currentStageIdx;
                            const log = order.logs?.find((l: any) => l.status === stage);

                            return (
                                <div key={stage} className={`flex items-start mb-8 relative ${isFuture ? 'opacity-40' : 'opacity-100'}`}>
                                    {/* Timeline line */}
                                    {idx !== STAGES.length - 1 && (
                                        <div className={`absolute top-6 left-[11px] w-0.5 h-[calc(100%+8px)] ${isDone ? 'bg-primary' : 'bg-white/10'}`}></div>
                                    )}

                                    {/* Timeline Node */}
                                    <div className={`w-6 h-6 rounded-full flex-shrink-0 mt-1 relative z-10 flex items-center justify-center border-2 ${isDone ? 'bg-primary border-primary' : isActive ? 'bg-[#0f172a] border-primary animate-pulse' : 'bg-[#0f172a] border-gray-600'}`}>
                                        {isDone && <span className="text-[10px] text-white font-bold">✓</span>}
                                        {isActive && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                                    </div>

                                    {/* Content */}
                                    <div className="ml-6">
                                        <h3 className={`font-bold ${isActive ? 'text-primary text-lg' : 'text-gray-300'}`}>{stage}</h3>
                                        {log && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Diselesaikan pada: {new Date(log.created_at).toLocaleString('id-ID')}
                                                <br />
                                                <span className="italic text-gray-500">"{log.notes}"</span>
                                            </p>
                                        )}
                                        {isActive && !log && (
                                            <p className="text-xs text-blue-300 mt-1 animate-pulse">Sedang dalam pengerjaan oleh tim...</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="text-center mt-12 text-gray-500 text-xs">
                    Platform Tracking didukung oleh Wave Projects Center.ID
                </div>
            </div>
        </div>
    );
}
