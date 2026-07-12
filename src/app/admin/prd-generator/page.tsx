'use client';

import { useState } from 'react';

export default function OfflinePRDGenerator() {
    const [rawChatHistory, setRawChatHistory] = useState('');
    const [customPrice, setCustomPrice] = useState('');
    const [projectName, setProjectName] = useState('');
    const [clientName, setClientName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('admin_token') || 'dummy';
            const res = await fetch('/api/v1/admin/prd/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rawChatHistory, customPrice, projectName, clientName })
            });
            const data = await res.json();

            if (data.success && data.base64) {
                // Trigger download
                const link = document.createElement('a');
                link.href = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${data.base64}`;
                link.download = data.fileName || 'PRD_Offline.docx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                setError(data.error || 'Terjadi kesalahan saat memproses data AI.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Manual AI PRD Generator (Jalur Offline)</h1>
            <p className="text-gray-600 mb-8">
                Gunakan modul ini untuk klien yang memesan pesanan <em>custom</em> di luar website (via WhatsApp / Email / Telepon).
                Sistem akan menggunakan mesin kecerdasan <strong>Gemini 1.5</strong> yang sama ketatnya dengan bot otomatis.
            </p>

            <form onSubmit={handleGenerate} className="bg-white p-6 rounded-lg shadow-sm border space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nama Proyek / Pesanan</label>
                        <input
                            type="text"
                            required
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full border p-2 rounded"
                            placeholder="Contoh: Aplikasi Kasir Minimarket"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Nama Klien / Perusahaan</label>
                        <input
                            type="text"
                            required
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className="w-full border p-2 rounded"
                            placeholder="Contoh: PT Boga Maju"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Harga Kesepakatan Final (Rp)</label>
                    <input
                        type="text"
                        required
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        className="w-full border p-2 rounded"
                        placeholder="Contoh: 45.000.000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Ini akan otomatis dimasukkan ke dalam porsi laporan Admin (Bagian 6.3).</p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Raw Chat History (Copy-Paste dari WhatsApp/Email)</label>
                    <textarea
                        required
                        value={rawChatHistory}
                        onChange={(e) => setRawChatHistory(e.target.value)}
                        className="w-full border p-2 rounded h-64 font-mono text-sm"
                        placeholder="[08:00, 10/10/2026] Klien: Mas, saya butuh aplikasi kasir nih...\n[08:05, 10/10/2026] Anda: Baik pak, fiturnya apa saja ya?"
                    ></textarea>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 border border-red-200 rounded">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold px-4 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'AI Sedang Berpikir & Menganalisis... (Tunggu 5-15 dtk)' : 'Cetak Dokumen PRD (.docx)'}
                </button>
            </form>
        </div>
    );
}
