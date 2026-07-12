Wave Projects Center.ID
PRODUCT REQUIREMENTS DOCUMENT (PRD)
Web Profile KP

Field	Detail
Nomor Dokumen (PRD ID)	
Nama Proyek / Pesanan	
Klien / Customer	
Tanggal Dibuat (v1.0)	
Versi Dokumen	
Status Dokumen	
Disusun Oleh	AI System Architect � Wave Projects Center.ID
Disetujui Oleh	

Catatan : 


Daftar Isi
1. Pendahuluan & Ringkasan Proyek
2. Problem Statement (Akar Masalah)
3. Goals (Tujuan & Metrik Keberhasilan)
4. Target User & Tingkatan Akses
5. User Stories
6. Functional Requirements (Trigger�Respon Sistem)
7. Non-Functional Requirements
8. Scope (In-Scope, Out-of-Scope & Asumsi)
9. Permintaan Asli dari Customer (Verbatim)
10. Spesifikasi Modul Fungsional (Detail Epic & Tech Mapping)
11. Arsitektur Sistem & Infrastruktur
12. Spesifikasi Backend (Laravel)
13. Spesifikasi Frontend (Next.js)
14. Skema Database (Entity Relationship)
15. Use Case & Alur Kerja (Workflow)
16. Matriks Tools & Integrasi Wajib
17. CI/CD Pipeline & Deployment Workflow
18. Alur Data Utama (Data Flow)
19. Koordinasi & Operasional Lintas Divisi (Internal)
20. Timeline & Manajemen Risiko
21. Persetujuan & Lembar Pengesahan (Sign-Off)


1. Pendahuluan & Ringkasan Proyek
Latar Belakang Proyek.
Model Bisnis & Skema Harga.

2. Problem Statement (Akar Masalah)
Ringkasan Masalah Inti
Dasar Identifikasi Masalah
Kebutuhan (Needs)
Aset yang Saat Ini Dimiliki (Current Assets)
Feedback dari Pengguna (Pola Umum pada Segmen Ini)
Analisis Kompetitor
Observasi Lapangan
Catatan Validasi: 
3.Goals (Tujuan & Metrik Keberhasilan)

ID	Goal	Menjawab Problem	Metrik Keberhasilan
G1			
G2			
G3			
G4			

4. Target User & Tingkatan Akses
4.1 Profil Pengguna (Personas)
Peran / Aktor	Karakter & Tanggung Jawab	Tujuan Utama (Objective)
		
		
		

4.2 Pemetaan Akses per Menu/Fitur
Matriks berikut memetakan menu dan fitur mana yang bisa diakses oleh masing-masing tingkatan pengguna.
Menu / Fitur							
							
							
							
							
							
							
							
							

5. User Stories
Setiap user story menjelaskan tugas dari sudut pandang peran tertentu, fitur yang bisa diakses, serta batasannya.
ID	Sebagai	User Story	Batasan (Constraints)
US-01			
US-02			
US-03			
US-04			
US-05			
US-06			
US-07			
US-08			
US-09			
US-10			
			
			
			
			
			
			
			


6. Functional Requirements (Trigger�Respon Sistem)
Menjelaskan apa yang dilakukan dan direspon oleh sistem ketika suatu aktivitas/kondisi terjadi. Detail naratif per modul & pemetaan teknologi ada di Bagian 10.
ID	Trigger / Kondisi	Respon Sistem yang Diharapkan	Modul Terkait
FR-01			
FR-02			
FR-03			
FR-04			
FR-05			
FR-06			
FR-07			
FR-08			
FR-09			
FR-10			
			
			
			
			
			
			
			
			
			
			
			

7. Non-Functional Requirements
Menjelaskan bagaimana sistem harus berperilaku (kualitas atribut), bukan aktivitas apa yang dilakukan sistem.
Kategori	Kebutuhan	Target Terukur
		
		
		
		
		
		
		
		
		
		

8. Scope (In-Scope, Out-of-Scope & Asumsi)
8.1 In-Scope � Dikerjakan pada Fase 1 (Sekarang)
8.2 Out-of-Scope � Fase Mendatang (Pending / Update / Scaling)
8.3 Asumsi & Ketergantungan

9. Permintaan Asli dari Customer (Verbatim)
Disertakan sebagai jejak (traceability) atas dari mana Problem Statement pada Bagian 2 diturunkan.
Isi Permintaan
Dokumen/Lampiran

10. Spesifikasi Modul Fungsional (Detail Epic & Tech Mapping)
Elaborasi naratif dari Functional Requirements pada Bagian 6, dipetakan ke modul/epic dan teknologi terkait.
Modul 1: Sistem Autentikasi & Otorisasi Admin
Modul 2: Dynamic Content Management System (CMS)
Modul 3: Interactive Lead & Inquiry Form
Modul 4: Sistem Notifikasi Multi-Channel
Modul 5: Responsive Showcase & Portfolio


11. Arsitektur Sistem & Infrastruktur
Gambaran Umum Arsitektur
Komponen Infrastruktur
Layer	Komponen	Provider / Tools	Keterangan
Edge / Security	DNS, WAF, CDN, Anti-DDoS		
Frontend	Rendering UI, SSG/ISR		
Backend	REST API, business logic		
Database	Penyimpanan data relasional		
Media Storage	Penyimpanan & optimasi gambar		
Email	Notifikasi 		
Push Notification	Notifikasi real-time		
Messaging	Notifikasi & auto-reply WhatsApp		
Version Control	Kolaborasi & histori kode		
CI/CD	Build, test, deploy otomatis		
Load Testing	Uji beban sebelum go-live		

Catatan Teknis: 
Topologi Lingkungan (Environment)
Environment	Domain/URL	Branch GitHub	Tujuan
			
			
			

12. Spesifikasi Backend (Laravel)
Struktur Modul Backend
Format Response API Standar
{ "success": true, "data": { }, "message": "string" }  |  { "success": false, "errors": { }, "message": "string" }
Daftar API Endpoint
Method	Endpoint	Deskripsi	Auth
POST	/api/v1/auth/login		
POST	/api/v1/auth/verify-2fa		
POST	/api/v1/auth/logout		
GET	/api/v1/auth/me		
GET/PUT	/api/v1/admin/company-profile		
GET/POST	/api/v1/admin/services		
PUT/DELETE	/api/v1/admin/services/{id}		
GET/POST	/api/v1/admin/portfolios		
PUT/DELETE	/api/v1/admin/portfolios/{id}		
POST	/api/v1/admin/portfolios/{id}/publish		
GET/POST	/api/v1/admin/banners		
GET	/api/v1/admin/inquiries		
PATCH	/api/v1/admin/inquiries/{id}/status		
GET	/api/v1/public/company-profile		
GET	/api/v1/public/services		
GET	/api/v1/public/portfolios		
GET	/api/v1/public/banners		
POST	/api/v1/public/inquiries		

13. Spesifikasi Frontend 
Struktur Halaman & Strategi Rendering
Route	Tipe Rendering	Deskripsi
		
		
		
		
		
		
		
		
		

Manajemen State & Data Fetching
Revalidasi Konten (ISR)
SEO & Meta

14. Skema Database (Entity Relationship)
Database menggunakan TiDB Cloud (kompatibel protokol MySQL). Berikut struktur tabel utama:
users
Field	Tipe	Keterangan
id	BIGINT (PK)	
name	VARCHAR(100)	
email	VARCHAR(150) UNIQUE	
password	VARCHAR(255)	
two_factor_secret	TEXT NULLABLE	
two_factor_enabled	BOOLEAN	
role	ENUM	
created_at / updated_at	TIMESTAMP	

company_profiles
Field	Tipe	Keterangan
id	BIGINT (PK)	
name, tagline, description	VARCHAR/TEXT	
logo_url	VARCHAR(255)	
address, phone, email	VARCHAR	
social_links	JSON	
updated_at	TIMESTAMP	

services
Field	Tipe	Keterangan
id	BIGINT (PK)	
title, slug	VARCHAR	
description	TEXT	
icon_url	VARCHAR(255)	
order	INT	
is_active	BOOLEAN	

portfolio_categories & portfolios
Field	Tipe	Keterangan
portfolio_categories.id	BIGINT (PK)	
portfolio_categories.name, slug	VARCHAR	
portfolios.id	BIGINT (PK)	
portfolios.category_id	BIGINT (FK -> ............. )	
portfolios.title, description	VARCHAR/TEXT	
portfolios.cover_image_url	VARCHAR(255)	
portfolios.gallery	JSON	
portfolios.is_published	BOOLEAN	

banners
Field	Tipe	Keterangan
id	BIGINT (PK)	
image_url	VARCHAR(255)	
title, subtitle, link_url	VARCHAR	
order, is_active	INT / BOOLEAN	

inquiries
Field	Tipe	Keterangan
id	BIGINT (PK)	
name, email, whatsapp_number	VARCHAR	
message	TEXT	
source_page	VARCHAR(100)	
status	ENUM('new','contacted','closed')	
created_at	TIMESTAMP	

notification_logs & activity_logs
Field	Tipe	Keterangan
notification_logs.id	BIGINT (PK)	
notification_logs.inquiry_id	BIGINT (FK -> inquiries.id)	
notification_logs.channel	ENUM('email','onesignal','whatsapp')	
notification_logs.status, sent_at	VARCHAR / TIMESTAMP	
activity_logs.id	BIGINT (PK)	
activity_logs.user_id	BIGINT (FK -> users.id)	
activity_logs.action, entity_type, entity_id	VARCHAR/VARCHAR/BIGINT	

Relasi Antar Tabel (Ringkasan)


15. Use Case & Alur Kerja (Workflow)
UC-01: 
Aktor: 
Prasyarat: 
Alur Alternatif: 
Postkondisi: 
UC-02: 
Aktor: 
Alur Alternatif: 
Postkondisi: 
UC-03: 
Aktor: 
Alur Alternatif: 
Postkondisi:
UC-04: Admin Menindaklanjuti Inquiry
Aktor: Super Admin
Postkondisi: 

16. Matriks Tools & Integrasi Wajib
Tool	Fungsi	Fase Digunakan	Status	Catatan
Vercel				
GitHub				
GitHub Actions				
TiDB Cloud				
Cloudinary				
Brevo				
OneSignal				
WhatsApp Gateway 				
Payment Gateway 				
Cloudflare				
K6				
Sentry 				

17. CI/CD Pipeline & Deployment Workflow
Strategi Branching Git
Alur GitHub Actions 
Alur GitHub Actions (Backend � Laravel)
Manajemen Environment Variables & Secrets
Seluruh kredensial disimpan di Vercel Environment Variables (terpisah per environment), antara lain:
Rollback & Monitoring

18. Alur Data Utama (Data Flow)
Langkah	Deskripsi Proses Berjalannya Data
1	
2	
3	
4	
5	

19. Koordinasi & Operasional Lintas Divisi (Internal)
19.1 Matriks RACI
Aktivitas / Deliverable	Dev	Admin	Super Admin/Owner
			
			
			
			
			
			


19.2 Admin
Tugas:
Resources/Kebutuhan:
19.3 Skema Keuangan (Draf Kasar)
Tagihan/Item Invoice:
19.5 Strategic Owner / Super Admin
Keselarasan Arah Bisnis:
Penilaian Risiko Pemilik: 
Catatan Keputusan: 

20. Timeline & Manajemen Risiko
Timeline & Target Kerangka Waktu
Milestone	PIC	Target Waktu
		
		
		
		
		
		

Manajemen Risiko
Risiko	Dampak	Mitigasi	PIC
			
			
			
			


21. Persetujuan & Lembar Pengesahan (Sign-Off)
Dokumen ini dianggap berlaku sebagai kontrak pengerjaan internal setelah seluruh form ini disetujui.
Jabatan / Peran	Nama	Tanda Tangan	Tanggal Persetujuan
Full Stack Developer			
Admin			
Super Admin / Pemilik			
Customer (Klien)			


22. Analytics & Conversion Tracking
Bagian ini mendefinisikan metrik analitik dan pelacakan konversi yang wajib diimplementasikan untuk mengukur keberhasilan proyek.

Kode    Deskripsi Metrik Target  Tool/SDK
AT-01   Page Views & Unique Visitors    Terpantau real-time     Google Analytics 4 / Vercel Analytics
AT-02   Conversion Rate (Checkout)      >= 3% dari total visitor        Event Tracking Custom
AT-03   Bounce Rate     < 50%   GA4 Behavior Flow
AT-04   Average Session Duration        >= 2 menit      GA4
AT-05   Funnel Drop-Off per Step        Teridentifikasi per langkah     Custom Event Pipeline
AT-06   Revenue per Channel     Terlacak per sumber traffic     UTM Parameter + GA4

Catatan AI Agent:
- Sesuaikan metrik AT-01 s/d AT-06 dengan jenis proyek klien (e-commerce, landing page, web app).
- Jika klien tidak memiliki Google Analytics, rekomendasikan setup awal sebagai bagian dari scope proyek.
- Untuk proyek landing page sederhana, fokus pada AT-01, AT-02, dan AT-03 saja.


23. Kepatuhan Data Pribadi (UU PDP Indonesia)
Bagian ini memastikan proyek mematuhi Undang-Undang Pelindungan Data Pribadi (UU No. 27 Tahun 2022) dan regulasi terkait.

Kode    Persyaratan     Status Implementasi     PIC
PDP-01  Consent Management: Formulir persetujuan pengumpulan data pribadi (cookie banner, checkbox)  [ ] Belum / [x] Selesai Developer
PDP-02  Data Minimization: Hanya kumpulkan data yang benar-benar diperlukan untuk layanan     [ ] Belum / [x] Selesai Developer
PDP-03  Hak Akses & Penghapusan: User bisa melihat, mengubah, dan menghapus data pribadinya  [ ] Belum / [x] Selesai Developer
PDP-04  Enkripsi Data: Password di-hash (bcrypt), data sensitif dienkripsi at-rest dan in-transit (HTTPS)        [ ] Belum / [x] Selesai Developer
PDP-05  Privacy Policy Page: Halaman kebijakan privasi wajib tersedia dan mudah diakses       [ ] Belum / [x] Selesai Admin
PDP-06  Data Retention Policy: Definisikan berapa lama data disimpan sebelum dihapus otomatis [ ] Belum / [x] Selesai Super Admin
PDP-07  Third-Party Data Sharing: Dokumentasikan semua pihak ketiga yang menerima data user   [ ] Belum / [x] Selesai Admin

Catatan AI Agent:
- WAJIB dimasukkan di setiap PRD tanpa terkecuali.
- Sesuaikan PDP-01 s/d PDP-07 dengan fitur yang dimiliki proyek.
- Jika proyek tidak mengumpulkan data pribadi (misal: company profile statis), cukup cantumkan PDP-04 dan PDP-05.


24. Backup & Disaster Recovery
Strategi pencadangan data dan pemulihan bencana untuk menjamin kelangsungan operasional proyek.

Komponen  Strategi Backup  Frekuensi       RTO (Recovery Time Objective)   RPO (Recovery Point Objective)
Database (TiDB Cloud)   Automated Snapshot      Harian (00:00 WIB)      <= 2 jam        <= 24 jam
File Upload (Cloudinary)        CDN Redundancy + Multi-Region   Real-time       <= 30 menit     0 (zero data loss)
Source Code (GitHub)    Git Version Control     Setiap commit   <= 15 menit     0
Environment Config (.env)       Encrypted backup di vault       Mingguan        <= 1 jam        <= 7 hari
Deployment (Vercel)     Auto-rollback ke versi sebelumnya        Per deployment  <= 5 menit      0

Prosedur Disaster Recovery:
1. Identifikasi insiden (monitoring alert via Vercel / TiDB dashboard).
2. Evaluasi dampak dan tentukan severity (P1-Critical / P2-High / P3-Medium).
3. Eksekusi rollback/restore sesuai tabel di atas.
4. Komunikasi ke stakeholder (Super Admin → Admin → Customer jika terdampak).
5. Post-mortem report dalam 48 jam setelah insiden teratasi.

Catatan AI Agent:
- Sesuaikan tabel backup dengan infrastruktur yang digunakan klien.
- Untuk proyek kecil (landing page), cukup cantumkan Source Code backup dan Deployment rollback.
- Untuk proyek enterprise, tambahkan monitoring tools (Sentry, UptimeRobot, dll).


25. Acceptance Criteria / Definition of Done per User Story
Setiap User Story pada bagian 5 dianggap "SELESAI" (Done) jika dan hanya jika memenuhi seluruh kriteria berikut:

Kriteria         Deskripsi       Wajib?
AC-01 Functional Test   Fitur berfungsi sesuai deskripsi user story tanpa error/bug kritis        Ya
AC-02 Responsive Test   Tampilan responsif di Mobile (360px), Tablet (768px), dan Desktop (1440px)       Ya
AC-03 Cross-Browser     Berfungsi di Chrome, Firefox, Safari, dan Edge versi terbaru     Ya
AC-04 Performance       PageSpeed Insights score >= 80 (mobile) dan >= 90 (desktop)     Ya
AC-05 Security  Tidak ada vulnerability kritis (XSS, SQL Injection, CSRF)       Ya
AC-06 Code Review       Kode sudah di-review oleh minimal 1 developer lain (atau Super Admin)   Ya
AC-07 Documentation     Perubahan terdokumentasi di README atau changelog proyek        Opsional
AC-08 Data Integrity    Input/output data konsisten, validasi berjalan benar     Ya
AC-09 User Acceptance   Demo ke klien dan mendapat persetujuan tertulis (via email/dashboard)    Ya

Catatan AI Agent:
- Cantumkan AC-01, AC-02, AC-04, AC-05, dan AC-09 di SETIAP PRD sebagai standar minimum.
- Untuk proyek enterprise, tambahkan AC-03, AC-06, AC-07, dan AC-08.
- Jika klien memiliki kriteria tambahan, masukkan sebagai AC-10 dst.


26. SLA Dukungan Pasca Go-Live
Service Level Agreement (SLA) untuk dukungan teknis setelah proyek diserahterimakan (handover).

Kategori         Durasi  Cakupan Respon Time     PIC
Garansi Bug Fix  30 hari setelah handover        Perbaikan bug/error yang ditemukan setelah Go-Live      <= 24 jam (hari kerja)  Developer
Minor Revision   14 hari setelah handover        Perubahan teks, warna, gambar (tanpa perubahan fitur)   <= 48 jam       Developer
Technical Support        30 hari setelah handover        Asistensi teknis: deployment, domain, hosting   <= 24 jam       Admin / Super Admin
Training & Onboarding   7 hari setelah handover Pelatihan penggunaan dashboard/admin panel kepada klien <= 72 jam       Admin

Ketentuan Tambahan:
- Permintaan di luar cakupan SLA (penambahan fitur baru, redesign, integrasi baru) akan dikenakan biaya tambahan sesuai tarif paket.
- Perpanjangan dukungan pasca Go-Live bisa dinegosiasikan sebagai kontrak terpisah.
- Klien wajib melaporkan bug melalui Dashboard Tracking atau email resmi, bukan via chat pribadi.

Catatan AI Agent:
- WAJIB cantumkan tabel SLA di setiap PRD.
- Sesuaikan durasi garansi berdasarkan paket: Starter (14 hari), Standard (30 hari), Ultimate/Enterprise (60 hari).
- Jika klien meminta perpanjangan SLA, arahkan ke negosiasi dengan Super Admin.


27. Glossary / Daftar Istilah
Daftar istilah teknis yang digunakan dalam dokumen PRD ini untuk memastikan pemahaman yang seragam antar semua pihak.

Istilah  Definisi
PRD     Product Requirements Document — dokumen spesifikasi kebutuhan produk.
MVP     Minimum Viable Product — versi produk dengan fitur inti minimum yang layak diluncurkan.
SLA     Service Level Agreement — perjanjian tingkat layanan antara penyedia dan klien.
RTO     Recovery Time Objective — target waktu maksimal untuk memulihkan layanan setelah gangguan.
RPO     Recovery Point Objective — target jumlah data maksimal yang boleh hilang saat pemulihan.
UU PDP  Undang-Undang Pelindungan Data Pribadi (UU No. 27 Tahun 2022 Republik Indonesia).
Go-Live Tanggal resmi peluncuran produk ke publik/production.
Handover        Proses serah terima proyek dari tim pengembang ke klien.
Deployment      Proses pengunggahan/pemasangan kode ke server production.
Rollback        Proses mengembalikan sistem ke versi sebelumnya jika terjadi error.
CI/CD   Continuous Integration / Continuous Deployment — otomasi build dan deploy.
API     Application Programming Interface — antarmuka komunikasi antar sistem.
Webhook Mekanisme notifikasi otomatis dari satu sistem ke sistem lain via HTTP.
Kanban  Metode manajemen proyek visual berbasis papan tugas (To-Do, In Progress, Done).
Sprint  Periode kerja terbatas (biasanya 1-2 minggu) dalam metodologi Agile.

Catatan AI Agent:
- Tambahkan istilah teknis lain yang relevan dengan proyek klien.
- Glossary ini membantu klien non-teknis memahami dokumen PRD.
- Untuk proyek enterprise, tambahkan istilah domain-specific (misal: ERP, CRM, Microservices, dll).