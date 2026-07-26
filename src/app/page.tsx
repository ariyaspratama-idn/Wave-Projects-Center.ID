"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

/* ───── Navigation ───── */
function Navbar({ settings }: { settings: any }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-surface-dim/70 backdrop-blur-xl border-b border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.1)]' : 'bg-transparent'}`}>
        <div className="flex justify-between items-center px-6 lg:px-10 py-4 max-w-[1440px] mx-auto">
          <Link href="/" className="font-display text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">waves</span>
            <span className="text-on-surface">Wave Projects</span>
          </Link>
          <div className="hidden md:flex gap-8 items-center">
            <Link href="#portfolio" className="font-label text-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors duration-300">Work</Link>
            <Link href="#features" className="font-label text-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors duration-300">Services</Link>
            <Link href="#packages" className="font-label text-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors duration-300">Packages</Link>
            <Link href="/chat" className="font-label text-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors duration-300">Lab & AI</Link>
            <Link href="/checkout" className="glow-btn-primary text-white font-label text-sm px-6 py-2 rounded-full active:scale-95 transition-transform uppercase tracking-widest">
              Start Project
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] rounded-full border border-white/10 z-50 bg-surface-container-lowest/50 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex justify-between px-2 py-2">
        <Link href="/" className="flex flex-col items-center justify-center bg-primary/20 text-primary rounded-full px-4 py-2 ring-1 ring-primary/50">
          <span className="material-symbols-outlined text-xl mb-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="text-[10px] font-label">Home</span>
        </Link>
        <Link href="#features" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:bg-white/5 rounded-full">
          <span className="material-symbols-outlined text-xl mb-0.5">auto_awesome</span>
          <span className="text-[10px] font-label">Services</span>
        </Link>
        <Link href="/chat" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:bg-white/5 rounded-full">
          <span className="material-symbols-outlined text-xl mb-0.5">psychology</span>
          <span className="text-[10px] font-label">AI Chat</span>
        </Link>
        <Link href="/checkout" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:bg-white/5 rounded-full">
          <span className="material-symbols-outlined text-xl mb-0.5">shopping_cart</span>
          <span className="text-[10px] font-label">Order</span>
        </Link>
      </nav>
    </>
  );
}

/* ───── Hero ───── */
function Hero({ settings }: { settings: any }) {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-24 px-6 mesh-gradient overflow-hidden -mt-20">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGc+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L2c+PC9zdmc+')] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>

      <div className="w-full aspect-square max-w-[280px] mx-auto mb-8 relative flex items-center justify-center z-10 pt-20">
        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAp5qegUCDMwA0jSGBf67Jj6LpDIfpIHX2QSSz6qKELo_cpnGE_BXFGU7PXKPWEWnDOfOkcdl7hVGCw8A8YY78z66Nuf-33Q_CwiLBMBOIID3trftth9qpsvnE-JtxjBpNckOBmGOA_DFZkdA-ppD2hdn83N2C1szX0oRlTvY8VId7Xp-7k9wyQc0xHXZ6D9-S2SyBUI7Wr-EMh0unRM7JHTAY_Pawrc9d5Ye9fTpEGaESa73fYHL7-EQ" alt="Indo Futurism Crystal" className="w-full h-full object-contain animate-float drop-shadow-[0_0_40px_rgba(184,195,255,0.3)]" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto text-center flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-glass-stroke bg-surface/30 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-neon-violet animate-pulse"></span>
          <span className="font-label text-xs text-soft-peach">Powered by AI — Gemini 1.5 Flash</span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-br from-white to-on-surface-variant max-w-5xl mx-auto leading-[1.1] font-extrabold tracking-tighter">
          Technical Elegance <br />
          <span className="gradient-text-alt">Masa Depan.</span>
        </h1>

        <p className="font-body text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto">
          {settings?.hero_subtitle || 'Platform all-in-one untuk konsultasi AI, pemesanan, pembayaran, hingga serah terima proyek web & aplikasi. Satu ekosistem. Tanpa ribet.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Link href="/chat" className="glow-btn-primary flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white font-label uppercase tracking-widest text-sm hover:scale-105 transition-all duration-500">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
            Konsultasi Gratis
          </Link>
          <Link href="#packages" className="flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-glass-stroke bg-surface/30 backdrop-blur-md text-white font-label uppercase tracking-widest text-sm hover:bg-white/5 transition-all duration-300">
            <span className="material-symbols-outlined">explore</span>
            Lihat Layanan
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 mt-16 pt-16 border-t border-glass-stroke/50 w-full max-w-4xl">
          <div className="flex flex-col items-center">
            <span className="font-display text-4xl text-primary font-bold">50+</span>
            <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest mt-2">Proyek Selesai</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-display text-4xl text-neon-violet font-bold">98%</span>
            <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest mt-2">Client Retention</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-display text-4xl text-soft-peach font-bold">&lt;2.5s</span>
            <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest mt-2">Response Time</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-display text-4xl text-primary font-bold">24/7</span>
            <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest mt-2">Premium Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───── Core Protocols (Features) ───── */
function Features() {
  const features = [
    { icon: "psychology", title: "AI Consultation", desc: "Konsultasi sistem dengan AI arsitektur. Jawaban instan.", color: "text-primary" },
    { icon: "integration_instructions", title: "API Integrations", desc: "Penghubung ekosistem (Payment, Cloudinary, dll).", color: "text-secondary" },
    { icon: "security", title: "Keamanan Solid", desc: "Infrastruktur tahan banting & signature validation webhook.", color: "text-tertiary" },
    { icon: "auto_awesome", title: "Auto PRD Generation", desc: "Hasilkan dokumen teknis secara instan dari obrolan AI.", color: "text-primary" },
  ];
  return (
    <section id="features" className="py-24 px-6 max-w-[1440px] mx-auto z-10 relative">
      <h2 className="font-headline text-3xl md:text-5xl text-on-surface mb-12 flex items-center gap-4 font-bold">
        <span className="material-symbols-outlined text-primary text-5xl">dashboard</span> Core Protocols
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Large Dimensional Design feature */}
        <div className="glass-panel rounded-2xl p-8 flex flex-col group relative overflow-hidden md:col-span-2">
          <div className="absolute inset-0 -z-10 opacity-20">
            <div className="bg-cover bg-center w-full h-full" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuASxA-TUqJVJN_D2v0yepJAMrfk9LxFh8O0w7HYi0D7dEbpxwtsQRSLFjy2LkT0fma1QllYf50fsnbRI9KYSIOJAWy6MMSwhfOp_BpGMv6GZ5rICxCLfX0IS7KWFI4SZOhwQ9y18C1I3SSQ_fVqUbdkESSstaILVN3-nLXF-oXADW8-f8qqFD-7cFBkSD-GnYLO8qUnbnBWDUxq7LikvcE6sSr1_xzNalAb9_DFfGEF7AhTugcmcr_5rQ')" }}></div>
          </div>
          <div className="flex justify-between items-start mb-6">
            <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychiatry</span>
            <span className="bg-tertiary-container text-white font-label text-xs px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-2 shadow-[0_0_10px_rgba(215,25,36,0.3)]">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> Live AI
            </span>
          </div>
          <h3 className="font-headline text-3xl text-white mb-2 font-bold">Cognitive Systems</h3>
          <p className="font-body text-on-surface-variant flex-grow max-w-md">
            Mengintegrasikan sistem prediksi AI langsung ke dalam pengalaman UI untuk memangkas proses konsultasi hingga 80%.
          </p>
          <div className="mt-8">
            <Link href="/chat" className="glow-btn-primary inline-flex text-white font-label text-sm px-8 py-3 rounded-full uppercase tracking-widest hover:scale-105 transition-transform duration-300">
              Mulai AI Konsultasi
            </Link>
          </div>
        </div>

        {/* Dynamic Small cards */}
        <div className="flex flex-col gap-6">
          {features.slice(2).map((f, i) => (
            <div key={i} className="glass-panel rounded-2xl p-6 flex flex-col group hover:-translate-y-1 transition-transform">
              <span className={`material-symbols-outlined text-4xl mb-4 ${f.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
              <h3 className="font-headline text-xl text-white mb-2 font-bold">{f.title}</h3>
              <p className="font-body text-sm text-on-surface-variant">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
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
    <section id="portfolio" className="py-24 px-6 bg-surface-container-high relative overflow-hidden text-center z-10 w-full circuit-pattern">
      <div className="max-w-[1440px] mx-auto relative z-10">
        <h2 className="font-headline text-3xl md:text-5xl text-white mb-4 font-bold">
          Technical <span className="gradient-text">Elegance</span>
        </h2>
        <p className="font-body text-lg text-on-surface-variant max-w-2xl mx-auto mb-16">
          Karya sistem digital yang dirancang teliti dan aman untuk jangka panjang.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((p, i) => (
            <div key={i} className="group rounded-2xl overflow-hidden glass-panel flex flex-col hover:border-white/20 transition-all duration-500 text-left">
              <div className="h-56 overflow-hidden relative border-b border-glass-stroke">
                <Image src={p.image_url || "/assets/img/og-preview.png"} alt={p.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-transparent to-transparent opacity-80"></div>
              </div>
              <div className="p-8 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-headline text-2xl text-white mb-2 font-bold">{p.title}</h3>
                  <p className="font-body text-sm text-on-surface-variant mb-6 line-clamp-3">{p.description}</p>
                </div>
                {p.live_link && (
                  <a href={p.live_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-label text-sm text-electric-blue hover:text-primary transition-colors uppercase tracking-widest">
                    Lihat Live Demo <span className="material-symbols-outlined text-sm">arrow_outward</span>
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

/* ───── Packages ───── */
function Packages() {
  const [pkgs, setPkgs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/v1/packages")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) setPkgs(data.data);
      });
  }, []);

  if (pkgs.length === 0) return null;

  return (
    <section id="packages" className="py-24 px-6 relative z-10 mesh-gradient">
      <div className="max-w-[1440px] mx-auto">
        <h2 className="font-headline text-3xl md:text-5xl text-white font-bold text-center mb-4">
          Paket <span className="gradient-text">Efisien</span>
        </h2>
        <p className="font-body text-lg text-on-surface-variant max-w-2xl mx-auto mb-16 text-center">
          Ekosistem teroptimasi cloud hemat biaya. Bayar DP 30% untuk memulai perjalanan.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {pkgs.map((p, i) => (
            <div key={i} className={`rounded-2xl glass-panel p-8 flex flex-col relative group hover:-translate-y-2 transition-all duration-500 ${p.popular ? 'border-primary/40 shadow-[0_0_40px_rgba(59,130,246,0.1)]' : ''}`}>
              {p.popular && <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>}

              <div className="mb-8">
                <span className="inline-block px-3 py-1 rounded-full bg-surface-container border border-glass-stroke text-on-surface-variant font-label text-[10px] tracking-widest uppercase mb-4">
                  {p.tag}
                </span>
                <h3 className="font-headline text-2xl text-white mb-2 font-bold">{p.name}</h3>
                <div className="font-display text-4xl text-white font-black tracking-tight my-4">Rp {p.price.toLocaleString("id-ID")}</div>
                <p className="font-body text-sm text-on-surface-variant line-clamp-4">{p.desc}</p>
              </div>

              <ul className="flex-col space-y-3 mb-10 flex-grow">
                {p.features?.map((f: string, j: number) => (
                  <li key={j} className="flex items-center gap-3 text-on-surface-variant font-body text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span> {f}
                  </li>
                ))}
              </ul>

              <Link href="/checkout" className={`w-full inline-flex items-center justify-center px-6 py-4 rounded-full font-label text-sm uppercase tracking-widest transition-all duration-300 ${p.popular ? 'glow-btn-primary text-white' : 'glass-button-secondary text-white hover:bg-white/5'}`}>
                Pesan Sekarang
              </Link>
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
    <section className="py-24 px-6 bg-surface-container-lowest/80 border-t border-glass-stroke">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16">
          <p className="font-body text-on-surface-variant opacity-80 leading-relaxed mb-6 text-lg">
            Wave Projects adalah penyedia jasa pembuatan web, jasa pembuatan sistem custom, dan software house profesional yang berfokus menghadirkan solusi digital modern untuk skala bisnis maupun enterprise. Kami ahli dalam membangun website profile, landing page, aplikasi custom, hingga sistem manajemen kompleks dengan performa tinggi dan aman.
          </p>
          <p className="font-body text-on-surface-variant opacity-80 leading-relaxed mb-6 text-lg">
            Platform all-in-one untuk konsultasi AI, pemesanan, pembayaran, hingga serah terima proyek web & aplikasi. Satu ekosistem. Tanpa ribet.
          </p>
        </div>

        <div className="space-y-12">
          <div>
            <h2 className="font-headline text-2xl sm:text-3xl font-bold mb-6 gradient-text-alt">Solusi Ekosistem Digital Terintegrasi untuk Skala Bisnis & Startup</h2>
            <h3 className="font-headline text-xl font-semibold text-white mt-6 mb-2">Jasa Pembuatan Website Company Profile & Landing Page Berperforma Tinggi</h3>
            <p className="font-body text-on-surface-variant opacity-70 mb-6 leading-relaxed">Deskripsi mendalam tentang optimasi kecepatan, desain stealth/modern, dan mobile-first.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───── CTA & Footer ───── */
function CTAAndFooter() {
  return (
    <>
      <section className="py-24 px-6 relative z-10 bg-surface-container-lowest">
        <div className="max-w-4xl mx-auto text-center relative z-10 glass-panel rounded-[3rem] p-12 md:p-20 shadow-[0_0_50px_rgba(59,130,246,0.1)] overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-30"></div>

          <h2 className="font-headline text-3xl md:text-5xl text-white mb-6 font-bold z-10 relative">Siap Memulai <span className="gradient-text">Proyek Anda?</span></h2>
          <p className="font-body text-lg text-on-surface-variant mb-10 max-w-xl mx-auto z-10 relative">Konsultasikan kebutuhan Anda dengan AI kami secara gratis. Analisis instan dan tajam.</p>

          <Link href="/chat" className="inline-flex items-center transition-all bg-on-surface text-background font-label text-sm uppercase tracking-widest py-4 px-10 rounded-full hover:bg-white hover:scale-105 z-10 relative">
            Mulai Diskusi
          </Link>
        </div>
      </section>

      <footer className="w-full border-t border-glass-stroke bg-obsidian-deep pt-20 pb-28 md:pb-12 px-6 z-10 relative mt-auto">
        <div className="max-w-[1440px] mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="font-display text-3xl font-extrabold tracking-tight flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">waves</span>
              <span className="text-on-surface">Wave Projects</span>
            </Link>
            <p className="font-body text-sm text-on-surface-variant max-w-md">
              Pioneering the Indo-Futuristic Frontier. Platform pembuatan IT tanpa hambatan, satu ekosistem dari konsultasi hingga deployment cloud mutakhir.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-label text-sm text-white uppercase tracking-widest opacity-50 mb-2">Connect</h4>
            <a href="#" className="font-body text-sm text-on-surface-variant hover:text-primary transition-colors">Instagram</a>
            <a href="#" className="font-body text-sm text-on-surface-variant hover:text-primary transition-colors">LinkedIn</a>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-label text-sm text-white uppercase tracking-widest opacity-50 mb-2">Legal</h4>
            <a href="#" className="font-body text-sm text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="font-body text-sm text-on-surface-variant hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto w-full flex flex-col md:flex-row justify-between items-center pt-8 border-t border-glass-stroke/50 gap-4">
          <p className="font-body text-xs text-on-surface-variant">© 2026 Wave Projects. Engineered with AI and Edge technologies.</p>
          <div className="flex gap-4 text-on-surface-variant text-xs opacity-60 font-label uppercase tracking-widest">
            <span>Next.js</span>
            <span>Vercel</span>
            <span>TiDB</span>
            <span>Midtrans</span>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ───── Main App ───── */
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
      <main className="flex-1 w-full flex flex-col relative z-0">
        <Hero settings={settings} />
        <Features />
        <Portfolio />
        <Packages />
        <SEOContent />
        <CTAAndFooter />
      </main>
    </>
  );
}
