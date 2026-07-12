"use client";
import { useEffect, useState } from "react";
import { useParams } from 'next/navigation';

export default function SimplePrintInvoice() {
    const params = useParams();
    const orderId = params?.id as string;
    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        if (!orderId) return;
        fetch(`/api/v1/track/${orderId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setOrder(data.data);
                    setTimeout(() => window.print(), 1500);
                }
            });
    }, [orderId]);

    if (!order) return <p className="p-10 font-sans">Menyiapkan dokumen faktur...</p>;

    const isDP = order.payment_choice === 'DP_30';
    const fullPrice = Number(order.package_price || order.total_amount);
    const dpAmount = isDP ? Math.round(fullPrice * 0.3) : 0;
    const remainingAmount = isDP ? fullPrice - dpAmount : 0;
    const paidAmount = Number(order.total_amount);
    const isPaid = order.payment_status === 'paid';
    const isDPPaid = order.payment_status === 'dp_paid';

    return (
        <div className="bg-white text-black min-h-screen font-sans print:m-0 print:p-0" style={{ background: 'white', color: 'black' }}>
            {/* Override dark mode globally for print */}
            <style>{`
                @media print { 
                    body, html { background: white !important; color: black !important; }
                    nav, header, .print\\:hidden { display: none !important; }
                }
                @page { margin: 20mm; }
            `}</style>

            <div className="max-w-4xl mx-auto p-12 print:p-0">
                <div className="border border-gray-200 p-12 print:border-none" style={{ background: 'white', color: 'black' }}>

                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-gray-800 pb-8 mb-8">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tighter" style={{ color: '#1e3a5f' }}>WAVE PROJECTS</h1>
                            <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Digital Product Development Agency</p>
                            <p className="text-xs mt-4" style={{ color: '#6b7280' }}>Jln. Inovasi Teknologi No. 45<br />Pusat Data Indonesia</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold uppercase tracking-widest" style={{ color: '#d1d5db' }}>INVOICE</h2>
                            <p className="font-bold mt-2" style={{ color: '#1f2937' }}>INV-{new Date().getFullYear()}-{order.id.toString().padStart(4, '0')}</p>
                            <p className="text-sm" style={{ color: '#6b7280' }}>Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
                        </div>
                    </div>

                    {/* Billing Info */}
                    <div className="grid grid-cols-2 gap-12 mb-12">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>Penagihan Kepada:</p>
                            <p className="text-lg font-bold" style={{ color: '#1f2937' }}>{order.client_name || '-'}</p>
                            {order.client_email && <p className="text-sm" style={{ color: '#6b7280' }}>{order.client_email}</p>}
                            {order.client_whatsapp && <p className="text-sm" style={{ color: '#6b7280' }}>WA: {order.client_whatsapp}</p>}
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>Status Pembayaran:</p>
                            <p className="text-lg font-bold" style={{ color: isPaid ? '#059669' : isDPPaid ? '#d97706' : '#dc2626' }}>
                                {isPaid ? '✅ LUNAS' : isDPPaid ? '🟠 DP 30% DITERIMA' : '⏳ MENUNGGU PEMBAYARAN'}
                            </p>
                            <p className="text-xs font-bold uppercase tracking-widest mt-4 mb-2" style={{ color: '#9ca3af' }}>Status Proyek:</p>
                            <p className="text-lg font-bold" style={{ color: '#2563eb' }}>{order.status}</p>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-full text-left mb-8">
                        <thead>
                            <tr className="border-b-2 border-gray-800 text-sm" style={{ color: '#1f2937' }}>
                                <th className="py-3 uppercase tracking-wide">Deskripsi Layanan</th>
                                <th className="py-3 uppercase tracking-wide text-center">Metode</th>
                                <th className="py-3 uppercase tracking-wide text-right">Total (IDR)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-4">
                                    <p className="font-bold" style={{ color: '#1f2937' }}>{order.package_name || 'Paket Kustom'}</p>
                                    <p className="text-sm" style={{ color: '#6b7280' }}>Pengerjaan aplikasi & konsultasi sistem</p>
                                </td>
                                <td className="py-4 text-center" style={{ color: '#4b5563' }}>
                                    {isDP ? 'DP 30%' : 'Full Payment'}
                                </td>
                                <td className="py-4 text-right font-bold" style={{ color: '#1f2937' }}>Rp {fullPrice.toLocaleString('id-ID')}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-72">
                            <div className="flex justify-between py-2 border-b border-gray-200" style={{ color: '#4b5563' }}>
                                <span>Harga Paket Penuh:</span>
                                <span>Rp {fullPrice.toLocaleString('id-ID')}</span>
                            </div>
                            {isDP && (
                                <>
                                    <div className="flex justify-between py-2 border-b border-gray-200" style={{ color: '#059669' }}>
                                        <span>DP Dibayar (30%):</span>
                                        <span>Rp {dpAmount.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-200" style={{ color: isDPPaid ? '#dc2626' : '#4b5563' }}>
                                        <span>Sisa Tagihan (70%):</span>
                                        <span className="font-bold">Rp {remainingAmount.toLocaleString('id-ID')}</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between py-2 border-b border-gray-200" style={{ color: '#4b5563' }}>
                                <span>Pajak (0%):</span>
                                <span>Rp 0</span>
                            </div>
                            <div className="flex justify-between py-4 text-xl font-extrabold border-b-2 border-gray-800" style={{ color: '#1e3a5f' }}>
                                <span>{isPaid ? 'Total Dibayar:' : isDP ? 'Total DP:' : 'Total Net:'}</span>
                                <span style={{ color: '#059669' }}>Rp {paidAmount.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Warning for DP */}
                    {isDP && !isPaid && (
                        <div className="border-2 border-dashed p-4 rounded mb-8" style={{ borderColor: '#fbbf24', background: '#fef9c3' }}>
                            <p className="font-bold text-sm" style={{ color: '#92400e' }}>⚠️ PERHATIAN — Sisa Pembayaran</p>
                            <p className="text-sm mt-1" style={{ color: '#a16207' }}>
                                Sisa tagihan sebesar <strong>Rp {remainingAmount.toLocaleString('id-ID')}</strong> wajib dilunasi sebelum proyek dapat diserahkan (Handover).
                                Silakan transfer sisa pembayaran dan unggah bukti transfer melalui panel pemesanan Anda.
                            </p>
                        </div>
                    )}

                    {/* Footer Notes */}
                    <div className="text-center text-sm mt-16 pt-8 border-t border-gray-300" style={{ color: '#6b7280' }}>
                        <p>Terima kasih atas kepercayaannya membangun arsitektur digital bersama Wave Projects Center.ID</p>
                        <p className="mt-1 text-xs">Dokumen ini digenerate secara otomatis oleh sistem, valid tanpa tanda tangan fisik.</p>
                        <p className="mt-3 text-xs">
                            Lacak proyek Anda: <span className="font-bold" style={{ color: '#2563eb' }}>https://wave-projects-center-id.vercel.app/track/{order.id}</span>
                        </p>
                    </div>
                </div>

                {/* Non-print action handler */}
                <div className="print:hidden text-center mt-10">
                    <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-3 rounded shadow hover:bg-blue-700">Cetak Ulang (Print to PDF)</button>
                    <br />
                    <a href="/dashboard/orders" className="text-blue-500 hover:underline mt-4 inline-block text-sm">← Kembali ke Dashboard</a>
                </div>
            </div>
        </div>
    );
}
