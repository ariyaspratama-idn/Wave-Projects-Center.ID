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
        // 4 Paket Ekonomis khusus Ekosistem Kampus (Serba di bawah 500k)
        $pkgs = [
            [
                "tag" => "Starter",
                "name" => "CV & Portofolio Digital",
                "price" => 149000,
                "desc" => "Website portofolio personal dan CV digital interaktif untuk melamar kerja/magang. Responsif dan SEO friendly.",
                "features" => ["Desain Custom", "Responsive Mobile", "Tombol Download CV", "Link Chat WhatsApp", "Deploy Vercel"],
                "popular" => false,
            ],
            [
                "tag" => "PKM",
                "name" => "Landing Page Kelompok",
                "price" => 249000,
                "desc" => "Website landing page produk kreatif khusus kelompok mahasiswa untuk kebutuhan nilai mata kuliah atau juri PKM.",
                "features" => ["Desain Produk Custom", "Integrasi Form WA", "Cloudinary Storage", "Google Analytics", "PWA Support"],
                "popular" => false,
            ],
            [
                "tag" => "Best Seller",
                "name" => "Web Profile KP",
                "price" => 349000,
                "desc" => "Sistem informasi profile sekolah/instansi dinamis + Admin Panel lengkap untuk syarat kelulusan Kerja Praktek.",
                "features" => ["Admin Panel CMS", "Multi-page Layout", "TiDB Database", "Form Hubungi Kami", "Sitemap & SEO"],
                "popular" => true,
            ],
            [
                "tag" => "Ultimate",
                "name" => "Fullstack Web Terima Jadi",
                "price" => 499000,
                "desc" => "Aplikasi sistem CRUD fullstack siap pakai untuk bahan demo UAS atau Tugas Akhir. Terima beres langsung live.",
                "features" => ["Sistem CRUD Lengkap", "Dashboard Admin Panel", "Koneksi TiDB Cloud", "Link Live Vercel", "Dokumentasi Alur Aplikasi"],
                "popular" => false,
            ],
        ];

        foreach ($pkgs as $p) {
            \App\Models\Package::firstOrCreate(['slug' => \Illuminate\Support\Str::slug($p['name'])], $p);
        }

        // Seed Roles
        $roles = ['Super Admin', 'Admin', 'Marketing', 'Developer', 'Customer'];
        foreach ($roles as $r) {
            \App\Models\Role::firstOrCreate(['name' => $r], ['description' => $r . ' Role']);
        }

        // Create Super Admin User
        $superAdmin = \App\Models\User::firstOrCreate(
            ['email' => 'superadmin@gmail.com'],
            [
                'name' => 'Wave Super Admin',
                'uuid' => (string) \Illuminate\Support\Str::uuid(),
                'phone' => '081234567890',
                'password' => \Illuminate\Support\Facades\Hash::make('admin123'),
                'status' => 'active'
            ]
        );

        $saRole = \App\Models\Role::where('name', 'Super Admin')->first();
        if ($saRole && !$superAdmin->roles->contains($saRole->id)) {
            $superAdmin->roles()->attach($saRole->id);
        }
    }
}
