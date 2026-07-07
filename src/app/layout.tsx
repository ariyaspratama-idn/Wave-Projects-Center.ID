import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wave Projects ID | Jasa Pembuatan Website & Aplikasi MVP",
  description:
    "Wave Projects membantu merealisasikan ide bisnis Anda menjadi aplikasi, WMS, dan website siap pakai dengan integrasi AI, sistem pembayaran instan, dan performa tinggi.",
  keywords: "Wave Projects, Wave Projects ID, WPID, Jasa Pembuatan Website, Bikin Aplikasi MVP, Laravel Developer Indonesia",
  openGraph: {
    title: "Wave Projects ID | Software House & Digital Agency",
    description: "Konsultasikan kebutuhan sistem Anda dengan AI Architect kami dan dapatkan PRD instan secara gratis.",
    url: "https://waveprojects.id",
    type: "website",
    images: [
      {
        url: "https://waveprojects.id/assets/img/og-image-stealth.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0a0f1e] text-white font-['Inter',sans-serif]">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
