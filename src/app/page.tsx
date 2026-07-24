"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

/* ───── Navbar ───── */
function Navbar({ settings }: { settings: any }) {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 w-full z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          <span className="gradient-text">{settings?.agency_name?.split(' ')[0] || 'Wave'}</span>{" "}
          <span className="text-white/80">{settings?.agency_name?.split(' ').slice(1).join(' ') || 'Projects'}</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#packages" className="text-sm text-gray-300 hover:text-white transition">Paket</Link>
          <Link href="#features" className="text-sm text-gray-300 hover:text-white transition">Fitur</Link>
          <Link href="/chat" className="text-sm text-gray-300 hover:text-white transition">AI Chat</Link>
          <Link href="/checkout" className="bg-primary/90 hover:bg-primary text-white text-sm font-semibold px-5 py-2 rounded-full transition-all hover:-translate-y-0.5 glow-blue">
            Pesan Sekarang
          </Link>
        </div>
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3">
          <Link href="#packages" className="text-gray-300 hover:text-white text-sm py-1" onClick={() => setOpen(false)}>Paket</Link>
          <Link href="#features" className="text-gray-300 hover:text-white text-sm py-1" onClick={() => setOpen(false)}>Fitur</Link>
          <Link href="/chat" className="text-gray-300 hover:text-white text-sm py-1" onClick={() => setOpen(false)}>AI Chat</Link>
          <Link href="/checkout" className="bg-primary text-white text-sm font-semibold px-5 py-2 rounded-full text-center" onClick={() => setOpen(false)}>Pesan Sekarang</Link>
        </div>
      )}
    </nav>
  );
}

/* ───── Hero ───── */
function Hero({ settings }: { settings: any }) {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-accent/15 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 text-center">
        {settings?.promo_banner_text ? (
          <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary/20 to-purple-500/20 border border-purple-500/30 rounded-full px-5 py-2 mb-8 text-xs font-semibold text-white cursor-pointer hover:border-purple-500/50 transition-all glow-blue">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {settings.promo_banner_text}
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Powered by AI — Gemini 1.5 Flash
          </div>
        )}

        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6">
          Jasa Pembuatan Website, Custom Software & Sistem Enterprise Profesional di Indonesia - <br />
          <span className="gradient-text">Wave Projects</span>
        </h1>

        <p className="lead text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          {settings?.hero_subtitle || 'Platform all-in-one untuk konsultasi AI, pemesanan, pembayaran, hingga serah terima proyek web & aplikasi. Satu ekosistem. Tanpa ribet.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/chat"
            className="group relative bg-primary hover:bg-primary-light text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-300 hover:-translate-y-0.5 glow-blue text-sm"
          >
            💬 Konsultasikan Proyek Anda
          </Link>
          <Link
            href="#packages"
            className="bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-white/20 font-medium px-8 py-3.5 rounded-full transition-all duration-300 hover:-translate-y-0.5 text-sm"
          >
            Lihat Paket Layanan →
          </Link>
        </div>

        {/* Floating stats */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { val: "50+", label: "Proyek Selesai" },
            { val: "99.9%", label: "Uptime" },
            { val: "<2.5s", label: "Response Time" },
            { val: "24/7", label: "AI Available" },
          ].map((s, i) => (
            <div key={i} className="glass rounded-xl p-4 hover:scale-105 transition-transform">
              <p className="text-2xl font-bold gradient-text">{s.val}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Features ───── */
function Features() {
  const features = [
    { icon: "🤖", title: "AI Consultation", desc: "Konsultasi proyek Anda dengan AI yang memahami arsitektur fullstack. Jawaban instan, rekomendasi paket tepat." },
    { icon: "🔒", title: "Pembayaran Aman", desc: "Integrasi Midtrans untuk DP 30% atau bayar penuh. Dilengkapi signature validation webhook." },
    { icon: "☁️", title: "Cloud Upload", desc: "Upload file langsung ke Cloudinary tanpa membebani server. Zero timeout, zero hassle." },
    { icon: "🔔", title: "Real-time Notifikasi", desc: "Push notification via OneSignal ke tim marketing & developer saat ada pesanan atau pembayaran baru." },
    { icon: "📄", title: "Auto PRD Generation", desc: "AI menganalisis kebutuhan Anda dan menghasilkan dokumen PRD teknis otomatis untuk developer." },
    { icon: "⚡", title: "Serverless Performance", desc: "Dibangun di atas Vercel Edge Network. Response time < 2.5 detik, kapasitas skalabel tanpa batas." },
  ];
  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          Konsultasi AI & <span className="gradient-text">Alur Kerja Pengembang</span>
        </h2>
        <p className="text-gray-500 text-center max-w-xl mx-auto mb-16">
          Ekosistem terintegrasi yang dirancang khusus untuk mengakali batasan infrastruktur free-tier.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="glass rounded-2xl p-6 hover:border-primary/30 transition-colors group">
              <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform">{f.icon}</span>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Packages ───── */
function Packages() {
  const [pkgs, setPkgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/packages")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setPkgs(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-24 text-gray-500">Memuat Paket dari Cloud...</div>;

  return (
    <section id="packages" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          Paket Harga <span className="gradient-text">Pembuat Website Efisien</span>
        </h2>
        <p className="text-gray-500 text-center max-w-xl mx-auto mb-16">
          Setiap paket dioptimalkan untuk infrastruktur cloud gratis. Bayar DP 30% untuk memulai.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {pkgs.map((p, i) => (
            <div
              key={i}
              className={`relative glass rounded-2xl p-8 flex flex-col transition-all hover:-translate-y-1 duration-300 ${p.popular ? "border-primary/50 glow-blue" : ""
                }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{p.tag}</span>
              <h3 className="text-2xl font-bold mt-2">{p.name}</h3>
              <p className="text-3xl font-extrabold gradient-text mt-3 mb-2">Rp {p.price.toLocaleString("id-ID")}</p>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed flex-1">{p.desc}</p>
              <ul className="space-y-2 mb-8">
                {p.features?.map((f: string, j: number) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-green-400 text-xs">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/checkout"
                className={`text-center py-3 rounded-xl font-semibold text-sm transition-all ${p.popular
                  ? "bg-primary hover:bg-primary-light text-white glow-blue"
                  : "bg-white/5 border border-white/10 hover:border-primary/40 text-gray-300 hover:text-white"
                  }`}
              >
                Pesan Sekarang
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── CTA ───── */
function CTA() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto glass rounded-3xl p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-secondary/20 rounded-full blur-[80px]" />
        </div>
        <div className="relative">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Siap Memulai <span className="gradient-text">Proyek Anda?</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8">
            Konsultasikan kebutuhan Anda dengan AI kami secara gratis. Dapatkan analisis dan rekomendasi paket dalam hitungan detik.
          </p>
          <Link
            href="/chat"
            className="inline-block bg-primary hover:bg-primary-light text-white font-semibold px-10 py-4 rounded-full transition-all duration-300 hover:-translate-y-0.5 glow-blue"
          >
            💬 Mulai Konsultasi Gratis
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ───── Footer ───── */
function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          © 2026 <span className="gradient-text font-semibold">Wave Projects Center.ID</span> — All Rights Reserved
        </p>
        <div className="flex gap-6 text-xs text-gray-600">
          <span>Vercel</span>
          <span>TiDB</span>
          <span>Cloudinary</span>
          <span>OneSignal</span>
          <span>Midtrans</span>
        </div>
      </div>
    </footer>
  );
}

/* ───── Portfolio ───── */
function Portfolio() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/v1/portfolios")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) setItems(data.data);
      });
  }, []);

  if (items.length === 0) return null;

  return (
    <section id="portfolio" className="py-24 px-4 bg-white/5">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          Solusi Jasa Pembuatan <span className="gradient-text">Sistem &amp; Web Custom</span>
        </h2>
        <p className="text-gray-500 text-center max-w-xl mx-auto mb-16">
          Beberapa proyek software dan sistem yang telah kami selesaikan dengan sukses menggunakan tech stack modern terbaru.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden group hover:border-primary/50 transition-all">
              <div className="h-48 bg-white/10 relative overflow-hidden">
                <Image src={p.image_url || "/assets/img/og-preview.png"} alt={`Jasa pembuatan sistem ${p.title} oleh Wave Projects`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2">{p.title}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-3 leading-relaxed">{p.description}</p>
                {p.live_link && (
                  <a href={p.live_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-light transition-colors">
                    Lihat Live Demo <span>&rarr;</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── SEO Content ───── */
function SEOContent() {
  return (
    <section className="py-24 px-4 bg-[#0a0f1e]/80 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16">
          <p className="text-gray-300 leading-relaxed mb-6 text-lg">
            Wave Projects adalah penyedia jasa pembuatan web, jasa pembuatan sistem custom, dan software house profesional yang berfokus menghadirkan solusi digital modern untuk skala bisnis maupun enterprise. Kami ahli dalam membangun website profile, landing page, aplikasi custom, hingga sistem manajemen kompleks dengan performa tinggi dan aman.
          </p>
          <p className="text-gray-300 leading-relaxed mb-6 text-lg">
            Platform all-in-one untuk konsultasi AI, pemesanan, pembayaran, hingga serah terima proyek web & aplikasi. Satu ekosistem. Tanpa ribet.
          </p>
          <p className="text-gray-300 leading-relaxed text-lg">
            Ditangani langsung oleh tim developer berpengalaman, setiap sistem dirancang responsif dan dioptimasi penuh untuk mesin pencari. Percayakan kebutuhan pembuat website dan sistem kustom masa depan bisnis Anda bersama Wave Projects.
          </p>
        </div>

        <div className="space-y-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 gradient-text">Solusi Ekosistem Digital Terintegrasi untuk Skala Bisnis & Startup</h2>

            <h3 className="text-xl font-semibold text-white mt-6 mb-2">Jasa Pembuatan Website Company Profile & Landing Page Berperforma Tinggi</h3>
            <p className="text-gray-500 mb-6 leading-relaxed">Deskripsi mendalam tentang optimasi kecepatan, desain stealth/modern, dan mobile-first.</p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-2">Jasa Pembuatan Sistem Custom: ERP, WMS, OMS, & POS Terintegrasi</h3>
            <p className="text-gray-500 mb-6 leading-relaxed">Penjelasan teknis mengenai pengembangan sistem manajemen gudang, *Order Management System*, hingga Point of Sales berbasis web.</p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-2">Konsultasi Arsitektur Perangkat Lunak & Integrasi Kecerdasan Buatan (AI)</h3>
            <p className="text-gray-500 leading-relaxed">Layanan konsultasi teknologi modern bagi perusahaan yang ingin mengintegrasikan *workflow* AI ke dalam sistem bisnis mereka.</p>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 gradient-text">Mengapa Wave Projects Adalah Pilihan Utama Partner Teknologi Bisnis Anda?</h2>

            <h3 className="text-xl font-semibold text-white mt-6 mb-2">Teknologi Modern & Stack Teruji (Laravel, Vercel, & Cloud Database)</h3>
            <p className="text-gray-500 mb-6 leading-relaxed">Menggunakan framework Laravel terbaru, manajemen database yang handal, serta deployment otomatis berperforma tinggi.</p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-2">Keamanan Tingkat Tinggi & Skalabilitas Tanpa Batas</h3>
            <p className="text-gray-500 mb-6 leading-relaxed">Sistem dirancang dengan arsitektur bersih (*clean architecture*) yang aman dari celah kerentanan serta siap menampung lonjakan transaksi.</p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-2">Dukungan Penuh & Perawatan Berkala (Maintenance & Support)</h3>
            <p className="text-gray-500 leading-relaxed">Komitmen jangka panjang untuk memastikan sistem klien tetap berjalan mulus tanpa *downtime* berarti.</p>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 gradient-text">Jangkauan Layanan Jasa Pembuatan Website & Software House Terdekat</h2>

            <h3 className="text-xl font-semibold text-white mt-6 mb-2">Jasa Pembuatan Website & Sistem Custom di Tangerang & Tangerang Selatan</h3>
            <p className="text-gray-500 mb-6 leading-relaxed">Meliputi wilayah Ciputat, BSD, Serpong, Bintaro, Karawaci, dan seluruh kawasan industri/bisnis di Tangerang Raya.</p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-2">Jasa Pembuatan Website Profesional untuk Wilayah DKI Jakarta & Sekitarnya</h3>
            <p className="text-gray-500 mb-6 leading-relaxed">Melayani kebutuhan digitalisasi korporat dan UMKM di Jakarta Selatan, Jakarta Barat, Jakarta Pusat, dan kota penyangga lainnya.</p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-2">Layanan Remote & Kolaborasi Proyek Skala Nasional</h3>
            <p className="text-gray-500 leading-relaxed">Menerima pengerjaan proyek sistem dan web custom dari berbagai kota di seluruh Indonesia secara profesional.</p>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 gradient-text">Portofolio & Studi Kasus Pengembangan Sistem Berhasil</h2>

            <h3 className="text-xl font-semibold text-white mt-6 mb-2">Implementasi Sistem Warehouse Management System (WMS) Skala Menengah</h3>
            <p className="text-gray-500 mb-6 leading-relaxed">Studi kasus bagaimana sistem kustom berhasil memangkas waktu inventaris gudang hingga 50%.</p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-2">Pengembangan Aplikasi Point of Sales (POS) & Manajemen Stok Terintegrasi</h3>
            <p className="text-gray-500 leading-relaxed">Solusi pencatatan kasir instan berbasis cloud yang terhubung langsung dengan laporan keuangan real-time.</p>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 gradient-text">Pertanyaan yang Sering Diajukan Seputar Jasa Pembuatan Website & Sistem</h2>

            <h3 className="text-xl font-semibold text-white mt-6 mb-2">Berapa lama waktu yang dibutuhkan untuk membuat sebuah website atau sistem custom?</h3>
            <p className="text-gray-500 mb-6 leading-relaxed">Penjelasan estimasi waktu pengerjaan berdasarkan tingkat kompleksitas proyek.</p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-2">Bagaimana alur kerja (workflow) pemesanan proyek di Wave Projects?</h3>
            <p className="text-gray-500 mb-6 leading-relaxed">Mulai dari konsultasi awal, *wireframing*, *development*, *stress testing*, hingga *deployment* ke server produksi.</p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-2">Apakah sistem yang dibuat dapat dikembangkan lagi di masa depan?</h3>
            <p className="text-gray-500 leading-relaxed">Penjelasan mengenai arsitektur kode modular yang fleksibel untuk *future-proofing* bisnis klien.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───── Main Page ───── */
export default function Home() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/v1/settings")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) setSettings(data.data);
      })
  }, []);

  return (
    <>
      <Navbar settings={settings} />
      <main className="flex-1">
        <Hero settings={settings} />
        <Features />
        <Portfolio />
        <Packages />
        <CTA />
        <SEOContent />
      </main>
      <Footer />
    </>
  );
}
