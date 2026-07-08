"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [form, setForm] = useState({
        contact_info: {
            whatsapp: '',
            email: '',
            address: ''
        },
        social_media: {
            instagram: '',
            facebook: '',
            linkedin: ''
        }
    });

    useEffect(() => {
        fetch('/api/v1/admin/settings')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setForm(data.data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleChange = (section: 'contact_info' | 'social_media', field: string, value: string) => {
        setForm(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/v1/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                setMessage('✅ Pengaturan berhasil disimpan!');
            } else {
                setMessage('❌ Gagal menyimpam pengaturan.');
            }
        } catch (error) {
            setMessage('❌ Terjadi kesalahan koneksi.');
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-gray-500">Memuat pengaturan...</div>;

    return (
        <div className="min-h-screen bg-[#0a0f1e] p-8 text-white">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Super Admin: <span className="gradient-text">Pengaturan</span></h1>
                        <p className="text-gray-400 mt-2">Atur kontak dan sosial media perusahaan Anda di sini.</p>
                    </div>
                    <Link href="/" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition">
                        Ke Beranda
                    </Link>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Contact Info */}
                    <div className="glass rounded-2xl p-6">
                        <h2 className="text-xl font-semibold mb-4 text-primary">Informasi Kontak</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">WhatsApp CS / Admin (untuk order manual / handoff AI)</label>
                                <input
                                    type="text"
                                    value={form.contact_info.whatsapp}
                                    onChange={e => handleChange('contact_info', 'whatsapp', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-primary/50"
                                    placeholder="Contoh: 085156618435"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Email Utama</label>
                                <input
                                    type="email"
                                    value={form.contact_info.email}
                                    onChange={e => handleChange('contact_info', 'email', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-primary/50"
                                    placeholder="Contoh: info@waveprojects.id"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Alamat Kantor / Perusahaan</label>
                                <textarea
                                    value={form.contact_info.address}
                                    onChange={e => handleChange('contact_info', 'address', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-primary/50"
                                    placeholder="Contoh: Jl. Sudirman No 1..."
                                    rows={3}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="glass rounded-2xl p-6">
                        <h2 className="text-xl font-semibold mb-4 text-blue-400">Media Sosial</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Instagram URL</label>
                                <input
                                    type="text"
                                    value={form.social_media.instagram}
                                    onChange={e => handleChange('social_media', 'instagram', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400/50"
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Facebook URL</label>
                                <input
                                    type="text"
                                    value={form.social_media.facebook}
                                    onChange={e => handleChange('social_media', 'facebook', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">LinkedIn URL</label>
                                <input
                                    type="text"
                                    value={form.social_media.linkedin}
                                    onChange={e => handleChange('social_media', 'linkedin', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400/50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit actions */}
                    <div className="flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-primary hover:bg-primary-light disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-xl transition glow-blue"
                        >
                            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </button>
                        {message && <span className="text-sm font-medium">{message}</span>}
                    </div>
                </form>
            </div>
        </div>
    );
}
