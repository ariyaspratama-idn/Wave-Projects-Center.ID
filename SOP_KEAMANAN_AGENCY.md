# STANDARD OPERATING PROCEDURE (SOP) WAVE PROJECTS CENTER
**DOKUMEN KONTROL AKSES & KEAMANAN INFRASTRUKTUR**

Dokumen ini adalah aturan mutlak bagi seluruh jajaran struktural Wave Projects Center.ID (baik Super Admin, Project Manager, maupun Developer) untuk menjamin Hak Kekayaan Intelektual (HAKI) dan menghindari kebocoran data Klien.

## 1. ATURAN PENUGASAN DEVELOPER (GITHUB)
- Setiap *Developer* DILARANG KERAS menyimpan *source code* perusahaan di repositori pribadi (Private/Public milik individu).
- Semua proyek Klien wajib berada di bawah organisasi GitHub resmi milik Agency.
- Super Admin hanya akan memberikan akses berstatus **"Collaborator - Write Only"**. Developer dilarang diberikan status "Admin" pada repositori.
- Apabila masa kerja/kontrak developer selesai, Super Admin WAJIB mencabut status *Collaborator* tersebut di hari yang sama.

## 2. PENGELOLAAN DATABASE (TIDB) & PENYIMPANAN
- **PRODUKSI (VVIP):** Untuk pesanan *custom* proyek skala besar, Super Admin **WAJIB** membuatkan akun Email Google baru (ex: `namaklien.it@waveprojects.id`) khusus untuk mendaftarkan klaster TiDB (Database) milik Klien tersebut agar limit *Free-Tier* tetap eksklusif.
- **SANDBOX (LOKAL):** Developer hanya akan diberikan Kredensial Database "Mainan" (*Dummy*) lokal untuk pengembangan. Tidak ada data riil yang boleh tersentuh laptop Developer.

## 3. PANDUAN ENVIRONMENT VARIABLES (.ENV)
- Developer bekerja menggunakan `.env.example` sebagai kerangka acuan (blueprint).
- Developer TIDAK PERLU tahu API Keys asli perusahaan. Developer silakan mengisi `BREVO_API_KEY` atau `CLOUDINARY_URL` di lokal laptop masing-masing dengan kunci percobaan (*free dev account* milik sendiri).
- API Keys / Rahasia Asli (Production Keys) **hanya boleh** dimasukkan lewat fitur **"Environment Variables"** secara langsung dari dalam Dashboard Vercel Pusat milik Super Admin.

## 4. ATURAN PENGIRIMAN KODE (DEPLOYMENT)
- Developer diwajibkan mengerjakan fitur dalam *branch* terpisah (misal: `feature/login`, `update/payment`).
- Vercel pusat hanya disetel untuk melakukan *Auto-Deploy* ketika ada integrasi (*Merge*) masuk ke *branch* utama (`main`). 
- Hal ini secara ketat diatur demi mengamankan sistem Klien dari *bugs* yang belum diuji, sekaligus menghemat kuota *100 Deploys/Day* dari Vercel Hobby. 

*Disahkan Oleh,*
**Chief Technology Officer / Pemilik**
**Wave Projects Center.ID**
