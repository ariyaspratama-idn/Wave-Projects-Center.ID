<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $pkgs = [
            [
                "tag" => "Starter",
                "name" => "Landing Page",
                "price" => 1500000,
                "desc" => "Website company profile satu halaman, responsif, cepat, dan SEO friendly.",
                "features" => ["Desain Custom", "Responsive Mobile", "Form Kontak", "SEO Dasar", "Deploy Vercel"],
                "popular" => false,
            ],
            [
                "tag" => "Popular",
                "name" => "Fullstack MVP",
                "price" => 5000000,
                "desc" => "Aplikasi web lengkap dengan backend API, database, dan admin panel terintegrasi.",
                "features" => ["Analisis AI", "Admin Panel", "TiDB Database", "Midtrans Payment", "PWA Support", "Cloudinary Storage"],
                "popular" => true,
            ],
            [
                "tag" => "Enterprise",
                "name" => "Custom Portal",
                "price" => 15000000,
                "desc" => "Sistem skala besar dengan multi-role dashboard, AI automation, dan arsitektur cloud-native.",
                "features" => ["Custom Architecture", "Multi-Role RBAC", "AI PRD Generator", "OneSignal Push", "K6 Load Testing", "SLA 99.9%"],
                "popular" => false,
            ],
        ];

        foreach ($pkgs as $p) {
            \App\Models\Package::create($p);
        }
    }
}
