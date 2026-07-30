"use client";

import { useEffect, useState } from "react";

export default function AgencySettings() {
    const [settings, setSettings] = useState({
        agency_name: "",
        promo_banner_text: "",
        hero_subtitle: "",
        whatsapp_contact: "",
        company_email: "",
        instagram_url: "",
        linkedin_url: "",
        privacy_policy_url: "",
        terms_conditions_url: ""
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/v1/settings")
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setSettings({
                        agency_name: data.data.agency_name || "",
                        promo_banner_text: data.data.promo_banner_text || "",
                        hero_subtitle: data.data.hero_subtitle || "",
                        whatsapp_contact: data.data.whatsapp_contact || "",
                        company_email: data.data.company_email || "",
                        instagram_url: data.data.instagram_url || "",
                        linkedin_url: data.data.linkedin_url || "",
                        privacy_policy_url: data.data.privacy_policy_url || "",
                        terms_conditions_url: data.data.terms_conditions_url || ""
                    });
                }
            });
    }, []);

    const handleSave = async (e: any) => {
        e.preventDefault();
        setSaving(true);
        const token = localStorage.getItem("wave_token");
        const res = await fetch("/api/v1/admin/settings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ settings })
        });
        const data = await res.json();
        setSaving(false);
        if (data.success) {
            alert("Pengaturan berhasil disimpan! Halaman publik (Landing Page) telah diperbarui secara otomatis.");
        } else {
            alert("Gagal: " + data.error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold gradient-text">Pengaturan Agensi</h1>
                <p className="text-gray-400 mt-2">Ubah teks statis dan pengaturan promosi pada Landing Page utama.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6 glass p-8 rounded-2xl border border-white/5">
                <div>
                    <label className="text-sm font-semibold mb-2 block">Nama Brand / Agensi</label>
                    <input type="text" required value={settings.agency_name} onChange={e => setSettings({ ...settings, agency_name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-primary/50 outline-none" />
                </div>
                <div>
                    <label className="text-sm font-semibold mb-2 block">Banner Promosi (Hero Banner)</label>
                    <input type="text" placeholder="Kosongkan jika tidak ada promo" value={settings.promo_banner_text} onChange={e => setSettings({ ...settings, promo_banner_text: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-primary/50 outline-none" />
                </div>
                <div>
                    <label className="text-sm font-semibold mb-2 block">Nomor WhatsApp CS (Internasional)</label>
                    <input type="text" placeholder="+628..." value={settings.whatsapp_contact} onChange={e => setSettings({ ...settings, whatsapp_contact: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-primary/50 outline-none" />
                </div>
                <div>
                    <label className="text-sm font-semibold mb-2 block">Email Agensi</label>
                    <input type="email" placeholder="contoh@gmail.com" value={settings.company_email} onChange={e => setSettings({ ...settings, company_email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-primary/50 outline-none" />
                </div>
                <div>
                    <label className="text-sm font-semibold mb-2 block">Sub-Title Landing Page (Deskripsi Singkat)</label>
                    <textarea rows={3} value={settings.hero_subtitle} onChange={e => setSettings({ ...settings, hero_subtitle: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-primary/50 outline-none resize-y" />
                </div>

                <h2 className="text-xl font-bold mt-8 mb-4 border-b border-white/10 pb-2">Link Footer & Sosial Media</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-semibold mb-2 block">Link Instagram</label>
                        <input type="url" placeholder="https://instagram.com/..." value={settings.instagram_url} onChange={e => setSettings({ ...settings, instagram_url: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-primary/50 outline-none" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold mb-2 block">Link LinkedIn</label>
                        <input type="url" placeholder="https://linkedin.com/in/..." value={settings.linkedin_url} onChange={e => setSettings({ ...settings, linkedin_url: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-primary/50 outline-none" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold mb-2 block">Link Kebijakan Privasi</label>
                        <input type="url" placeholder="https://..." value={settings.privacy_policy_url} onChange={e => setSettings({ ...settings, privacy_policy_url: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-primary/50 outline-none" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold mb-2 block">Link Syarat Ketentuan</label>
                        <input type="url" placeholder="https://..." value={settings.terms_conditions_url} onChange={e => setSettings({ ...settings, terms_conditions_url: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-primary/50 outline-none" />
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                    <button type="submit" disabled={saving} className="bg-primary hover:bg-primary-light px-8 py-3 rounded-xl font-semibold text-white transition-all">
                        {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </button>
                </div>
            </form>
        </div>
    );
}
