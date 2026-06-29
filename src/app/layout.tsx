import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wave Projects Center.ID — Software House & AI Consultation",
  description:
    "Platform pemesanan jasa pembuatan Web & APK terintegrasi AI. Konsultasi, pesan, bayar, dan terima proyek dalam satu ekosistem.",
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
      </body>
    </html>
  );
}
