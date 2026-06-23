import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600 tracking-tight">Wave Projects Center</h1>
          <nav>
            <ul className="flex space-x-6">
              <li><Link href="/" className="text-gray-600 hover:text-blue-600 transition">Services</Link></li>
              <li><Link href="/" className="text-gray-600 hover:text-blue-600 transition">Portfolio</Link></li>
              <li><Link href="/" className="text-gray-600 hover:text-blue-600 transition">AI Consultation</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8 px-4 text-center">
        <h2 className="text-5xl font-extrabold text-gray-900 mb-6 drop-shadow-sm">Transform Your Vision into Reality</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mb-10 leading-relaxed">
          Platform pemesanan dan manajemen project software all-in-one. Dilengkapi dengan asisten AI untuk memandu Anda menemukan paket terbaik, dan integrasi Vercel Serverless yang sangat cepat.
        </p>

        <div className="flex gap-4">
          <button className="bg-blue-600 text-white font-medium py-3 px-8 rounded-full shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-200">
            Mulai Konsultasi AI
          </button>
          <button className="bg-white text-blue-600 font-medium py-3 px-8 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 hover:-translate-y-0.5 transition-all duration-200">
            Lihat Paket Layanan
          </button>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {[
            { tag: 'MVP', title: 'Landing Page', price: 'Rp 1.500.000', desc: 'Sistem company profile ringan, responsive, dan SEO friendly.' },
            { tag: 'Advanced', title: 'E-Commerce', price: 'Rp 5.000.000', desc: 'Aplikasi toko online lengkap dengan integrasi payment gateway Midtrans.' },
            { tag: 'Enterprise', title: 'Custom Portal', price: 'Rp 15.000.000+', desc: 'Proyek kompleks dengan dashboard terintegrasi AI, Vercel Serverless, dan TiDB.' }
          ].map((pkg, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-8 text-left shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">{pkg.tag}</span>
              <h3 className="mt-4 text-2xl font-bold text-gray-900">{pkg.title}</h3>
              <p className="mt-2 text-3xl font-extrabold text-blue-600 mb-4">{pkg.price}</p>
              <p className="text-gray-600 border-t border-gray-100 pt-4 leading-relaxed">{pkg.desc}</p>
              <button className="w-full mt-6 bg-gray-50 text-blue-600 border border-blue-100 font-medium py-2 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors">
                Pesan Sekarang
              </button>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-white border-t py-8">
        <p className="text-center text-gray-500 text-sm">© 2026 Wave Projects Center.ID - All Rights Reserved</p>
      </footer>
    </div>
  );
}
