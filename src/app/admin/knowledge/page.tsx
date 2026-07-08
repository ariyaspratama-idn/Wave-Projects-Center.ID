'use client';

import { useState, useEffect } from 'react';

type Knowledge = {
    id: number;
    rule_category: string;
    content: string;
    is_active: number;
};

export default function KnowledgeBaseAdmin() {
    const [rules, setRules] = useState<Knowledge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [formContent, setFormContent] = useState('');
    const [formCategory, setFormCategory] = useState('sop');

    const fetchRules = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token') || 'dummy-if-middleware-disabled';
            const res = await fetch('/api/v1/admin/knowledge', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setRules(data.data);
            } else {
                setError(data.error || 'Failed to fetch rules');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token') || 'dummy';
            const res = await fetch('/api/v1/admin/knowledge', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: formContent, rule_category: formCategory, is_active: true })
            });
            const data = await res.json();
            if (data.success) {
                setFormContent('');
                fetchRules();
            } else {
                alert('Error: ' + data.error);
            }
        } catch (err: any) {
            alert('Request failed: ' + err.message);
        }
    };

    const toggleActive = async (rule: Knowledge) => {
        try {
            const token = localStorage.getItem('admin_token') || 'dummy';
            await fetch(`/api/v1/admin/knowledge/${rule.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...rule, is_active: !rule.is_active })
            });
            fetchRules();
        } catch (err) {
            alert('Failed to toggle');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus rule ini secara permanen?')) return;
        try {
            const token = localStorage.getItem('admin_token') || 'dummy';
            await fetch(`/api/v1/admin/knowledge/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchRules();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">AI Knowledge Base (RAG)</h1>
            <p className="text-gray-600 mb-8">Kelola "otak" tambahan untuk agen AI chatbot (Nova). Seluruh aturan yang berstatus <strong>Active</strong> akan dibaca dan dipatuhi oleh AI di setiap obrolan dengan pelanggan.</p>

            <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
                <h2 className="text-xl font-semibold mb-4">Tambah Aturan Baru</h2>
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Kategori (Label)</label>
                        <select
                            value={formCategory}
                            onChange={(e) => setFormCategory(e.target.value)}
                            className="w-full border p-2 rounded"
                        >
                            <option value="sop">SOP (Standar Operasional)</option>
                            <option value="fallback">Fallback (Larangan/Penolakan)</option>
                            <option value="best_practice">Best Practice (Tips Menjawab)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Isi Instruksi (Content)</label>
                        <textarea
                            value={formContent}
                            onChange={(e) => setFormContent(e.target.value)}
                            className="w-full border p-2 rounded h-24"
                            placeholder="Contoh: Jika klien menawar harga, berikan diskon rahasia maksimal 5% dengan menyebut kode 'WAVEDISCOUNT'."
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Simpan Aturan
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="p-4 w-24">Status</th>
                            <th className="p-4 w-32">Kategori</th>
                            <th className="p-4">Instruksi RAG</th>
                            <th className="p-4 w-32 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
                        ) : error ? (
                            <tr><td colSpan={4} className="p-4 text-center text-red-500">{error}</td></tr>
                        ) : rules.length === 0 ? (
                            <tr><td colSpan={4} className="p-4 text-center text-gray-500">Belum ada data knowledge base.</td></tr>
                        ) : (
                            rules.map(r => (
                                <tr key={r.id} className="border-b hover:bg-gray-50 max-h-32">
                                    <td className="p-4 align-top">
                                        <button
                                            onClick={() => toggleActive(r)}
                                            className={`px-2 py-1 text-xs rounded-full cursor-pointer ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
                                        >
                                            {r.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="p-4 align-top">
                                        <span className="bg-blue-100 text-blue-700 font-mono text-xs px-2 py-1 rounded">{r.rule_category}</span>
                                    </td>
                                    <td className="p-4 align-top text-gray-800 whitespace-pre-wrap">{r.content}</td>
                                    <td className="p-4 align-top text-right">
                                        <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700 text-sm">Hapus</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
