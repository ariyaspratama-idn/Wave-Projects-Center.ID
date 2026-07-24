import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jasa Pembuatan Web & Sistem Custom Profesional | Wave Projects",
  description: "Wave Projects: Jasa pembuatan web & sistem custom. Platform all-in-one untuk konsultasi AI, pemesanan, pembayaran, hingga serah terima proyek tanpa ribet.",
  keywords: "jasa pembuatan web, jasa pembuatan sistem, pembuat website, software house indonesia, jasa pembuatan aplikasi custom, web development berbasis AI, konsultasi pembuatan website, wave projects",
  robots: "index, follow",
  alternates: {
    canonical: "https://www.waveprojects.my.id/",
  },
  openGraph: {
    title: "Jasa Pembuatan Web & Sistem Custom Profesional | Wave Projects",
    description: "Platform all-in-one untuk konsultasi AI, pemesanan, pembayaran, hingga serah terima proyek web & aplikasi. Satu ekosistem. Tanpa ribet.",
    url: "https://www.waveprojects.my.id/",
    type: "website",
    images: [
      {
        url: "https://www.waveprojects.my.id/assets/img/og-preview.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jasa Pembuatan Web & Sistem Custom Profesional | Wave Projects",
    description: "Platform all-in-one untuk konsultasi AI, pemesanan, pembayaran, hingga serah terima proyek web & aplikasi. Satu ekosistem. Tanpa ribet.",
    images: ["https://www.waveprojects.my.id/assets/img/og-preview.png"],
  },
};

const schemaJSON = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Wave Projects",
  "image": "https://www.waveprojects.my.id/assets/img/og-preview.png",
  "@id": "https://www.waveprojects.my.id/#agent",
  "url": "https://www.waveprojects.my.id/",
  "telephone": "",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "ID"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -6.2088,
    "longitude": 106.8456
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "opens": "00:00",
    "closes": "23:59"
  },
  "sameAs": [],
  "description": "Platform all-in-one untuk konsultasi AI, pemesanan, pembayaran, hingga serah terima proyek web & aplikasi. Satu ekosistem. Tanpa ribet.",
  "potentialAction": {
    "@type": "ReserveAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.waveprojects.my.id/",
      "inLanguage": "id",
      "actionPlatform": ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"]
    },
    "result": {
      "@type": "Reservation",
      "name": "Konsultasi Pembuatan Website & Sistem"
    }
  }
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJSON) }} />
      </head>
      <body className="min-h-full flex flex-col bg-[#0a0f1e] text-white font-['Inter',sans-serif]">
        {children}
      </body>
    </html>
  );
}
