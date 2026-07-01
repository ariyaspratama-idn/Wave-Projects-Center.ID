"use client";
import { useEffect, useState } from "react";

export default function SimplePrintInvoice({ params }: { params: { id: string } }) {
    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        fetch(`/api/v1/track/${params.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setOrder(data.data);
                    // Langsung otomatis trigger print prompt saat komponen siap
                    setTimeout(() => window.print(), 1000);
                }
            });
    }, [params.id]);

    if (!order) return <p className="p-10 font-sans">Menyiapkan dokumen faktur...</p>;

    return (
        <div className="bg-white text-black min-h-screen p-10 font-sans print:m-0 print:p-0">
            <div className="max-w-4xl mx-auto border border-gray-200 p-12 print:border-none">

                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-gray-800 pb-8 mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-blue-900 tracking-tighter">WAVE PROJECTS</h1>
                        <p className="text-gray-500 text-sm mt-1">Digital Product Development Agency</p>
                        <p className="text-gray-500 text-xs mt-4">Jln. Inovasi Teknologi No. 45<br />Pusat Data Indonesia</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold uppercase text-gray-300 tracking-widest">INVOICE/TAGIHAN</h2>
                        <p className="font-bold text-gray-800 mt-2">INV-{new Date().getFullYear()}-{order.id.toString().padStart(4, '0')}</p>
                        <p className="text-gray-500 text-sm">Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
                    </div>
                </div>

                {/* Billing Info */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Penagihan Kepada:</p>
                        <p className="text-lg font-bold text-gray-800">{order.client_name}</p>
                        <p className="text-sm text-gray-600">Pelanggan Kontrak Layanan Wave ERP</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Status Saat Ini:</p>
                        <p className="text-lg font-bold text-blue-600">{order.status}</p>
                    </div>
                </div>

                {/* Table */}
                <table className="w-full text-left mb-12">
                    <thead>
                        <tr className="border-b-2 border-gray-800 text-sm text-gray-800">
                            <th className="py-3 uppercase tracking-wide">Deskripsi Layanan</th>
                            <th className="py-3 uppercase tracking-wide text-center">Durasi</th>
                            <th className="py-3 uppercase tracking-wide text-right">Total (IDR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-200">
                            <td className="py-4">
                                <p className="font-bold text-gray-800">{order.package_name || 'Pembayaran Jasa Khusus (Custom)'}</p>
                                <p className="text-sm text-gray-500">Pengerjaan aplikasi & konsultasi sistem</p>
                            </td>
                            <td className="py-4 text-center text-gray-700">1 Paket</td>
                            <td className="py-4 text-right font-bold text-gray-800">Rp {Number(order.total_amount).toLocaleString('id-ID')}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-16">
                    <div className="w-64">
                        <div className="flex justify-between py-2 border-b border-gray-200 text-gray-600">
                            <span>Subtotal:</span>
                            <span>Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200 text-gray-600">
                            <span>Pajak (0%):</span>
                            <span>Rp 0</span>
                        </div>
                        <div className="flex justify-between py-4 text-xl font-extrabold text-blue-900 border-b-2 border-gray-800">
                            <span>Total Net:</span>
                            <span>Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="text-center text-sm text-gray-500 mt-16 pt-8 border-t border-gray-300">
                    <p>Terima kasih atas kepercayaannya membangun arsitektur digital bersama Wave Projects Center.ID</p>
                    <p className="mt-1 text-xs">Dokumen ini digenerate secara otomatis oleh sistem, valid tanpa tanda tangan fisik.</p>
                </div>
            </div>

            {/* Non-print action handler */}
            <div className="print:hidden text-center mt-10">
                <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-3 rounded shadow hover:bg-blue-700">Cetak Ulang (Print to PDF)</button>
                <br />
                <a href="/dashboard/orders" className="text-blue-500 hover:underline mt-4 inline-block text-sm">← Kembali ke Dashboard</a>
            </div>
        </div>
    );
}
