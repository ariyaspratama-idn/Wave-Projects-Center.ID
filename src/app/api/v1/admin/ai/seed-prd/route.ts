import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

// PRD Template Structure — 27 sections
const PRD_TEMPLATE_SECTIONS = [
    { no: 1, title: "Pendahuluan & Ringkasan", desc: "Nama proyek, versi dokumen, tanggal, info klien, overview singkat tujuan proyek." },
    { no: 2, title: "Goals & Metrik Terukur (OKR)", desc: "Tabel Objective → Key Result → Target Terukur. Minimal 3-5 goals." },
    { no: 3, title: "Functional Requirements", desc: "Tabel FR-01 s/d FR-XX: fitur wajib yang harus diimplementasikan, PIC, dan prioritas." },
    { no: 4, title: "Non-Functional Requirements", desc: "Performance (PageSpeed ≥80), Keamanan (XSS/SQLi protection), Skalabilitas, Aksesibilitas." },
    { no: 5, title: "User Stories", desc: "Format: 'Sebagai [Role], saya ingin [aksi], sehingga [manfaat]'. Minimal 5-8 user stories." },
    { no: 6, title: "Scope & Batasan (In-Scope / Out-of-Scope)", desc: "Daftar tegas apa yang TERMASUK dan TIDAK TERMASUK dalam proyek ini." },
    { no: 7, title: "Arsitektur Sistem & Data Flow", desc: "Diagram arsitektur: Frontend → API → Database. Tech stack yang digunakan." },
    { no: 8, title: "Schema Database", desc: "Tabel-tabel utama, kolom, tipe data, relasi, index. Gambarkan ERD jika memungkinkan." },
    { no: 9, title: "API Specification", desc: "Daftar endpoint: Method, Path, Body, Response, Auth. Grouped by modul." },
    { no: 10, title: "UI/UX Wireframe & Design Guidelines", desc: "Color palette, tipografi, layout utama, responsivitas target (Mobile-first)." },
    { no: 11, title: "Pemetaan Akses per Role", desc: "Matriks akses: Role × Fitur → CRUD permissions." },
    { no: 12, title: "Integrasi Pihak Ketiga", desc: "Daftar integrasi: Payment Gateway, Email (Brevo), Storage (Cloudinary), AI (Gemini), dll." },
    { no: 13, title: "SEO & Performance Optimization", desc: "Meta tags, Open Graph, sitemap, lazy loading, image optimization." },
    { no: 14, title: "Testing Strategy", desc: "Unit test, integration test, UAT, browser testing matrix." },
    { no: 15, title: "Deployment Strategy", desc: "Environment (dev/staging/prod), CI/CD pipeline, domain config." },
    { no: 16, title: "DevOps & Monitoring", desc: "Logging, error tracking (Sentry), uptime monitoring, alerting." },
    { no: 17, title: "Security Checklist", desc: "HTTPS, CORS, rate limiting, input sanitization, JWT/session management." },
    { no: 18, title: "Estimasi Biaya & Rincian Pembayaran", desc: "Breakdown biaya per modul/fase, metode pembayaran (DP 30% / Full), jadwal pelunasan." },
    { no: 19, title: "Komunikasi & Kolaborasi", desc: "Tools kolaborasi, frekuensi update, PIC per role, channel komunikasi." },
    { no: 20, title: "Timeline & Manajemen Risiko", desc: "Gantt chart / milestone, identifikasi risiko, mitigasi, plan B." },
    { no: 21, title: "Persetujuan & Lembar Pengesahan (Sign-Off)", desc: "Tabel tanda tangan: Super Admin, Admin, Developer, Customer — dengan tanggal persetujuan." },
    { no: 22, title: "Analytics & Conversion Tracking", desc: "Metrik: Page Views, Conversion Rate, Bounce Rate, Funnel Drop-Off. Tool: GA4/Vercel Analytics." },
    { no: 23, title: "Kepatuhan Data Pribadi (UU PDP)", desc: "7 item kepatuhan: Consent, Data Minimization, Hak Hapus, Enkripsi, Privacy Policy, Retention, Third-Party." },
    { no: 24, title: "Backup & Disaster Recovery", desc: "Tabel RTO/RPO per komponen (DB, File, Code). Prosedur DR 5 langkah." },
    { no: 25, title: "Acceptance Criteria / Definition of Done", desc: "9 kriteria: Functional, Responsive, Cross-Browser, Performance ≥80, Security, Code Review, UAT." },
    { no: 26, title: "SLA Dukungan Pasca Go-Live", desc: "4 tier dukungan: Bug Fix (30 hari), Minor Revision (14 hari), Tech Support, Training/Onboarding." },
    { no: 27, title: "Glossary / Daftar Istilah", desc: "15+ istilah teknis: PRD, MVP, SLA, RTO, RPO, UU PDP, Go-Live, Handover, CI/CD, API, Webhook, dll." },
];

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        // 1. Store PRD Template in system_settings
        const templateJson = JSON.stringify(PRD_TEMPLATE_SECTIONS);
        await pool.query(`
            INSERT INTO system_settings (setting_key, setting_value, description)
            VALUES ('prd_template', ?, 'Template PRD 27 bagian untuk AI Agent')
            ON DUPLICATE KEY UPDATE setting_value = ?, description = 'Template PRD 27 bagian untuk AI Agent (updated)'
        `, [templateJson, templateJson]);

        // 2. Create AI Knowledge Base entry with PRD template summary
        const prdKnowledge = `TEMPLATE PRD RESMI WAVE PROJECTS CENTER.ID — 27 BAGIAN WAJIB:
Saat membuat PRD untuk klien, AI WAJIB mengikuti struktur 27 bagian berikut:
${PRD_TEMPLATE_SECTIONS.map(s => `${s.no}. ${s.title}: ${s.desc}`).join('\n')}

ATURAN PENTING:
- Untuk proyek Starter/Landing Page: Fokus pada bagian 1-6, 10, 13, 18, 21, 25, 26, 27.
- Untuk proyek Standard/E-Commerce: Semua bagian WAJIB kecuali 16 (opsional).
- Untuk proyek Ultimate/Enterprise: SEMUA 27 bagian WAJIB tanpa terkecuali.
- Sesuaikan isi setiap bagian berdasarkan permintaan klien dan paket yang dipilih.
- Dokumen PRD ini akan dibagikan ke: Super Admin, Admin, dan Developer.`;

        // Check if PRD knowledge already exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ai_knowledge_base (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                content TEXT NOT NULL,
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        const [existing]: any = await pool.query("SELECT id FROM ai_knowledge_base WHERE content LIKE '%TEMPLATE PRD RESMI%' LIMIT 1");
        if (existing.length > 0) {
            await pool.query("UPDATE ai_knowledge_base SET content = ?, is_active = 1 WHERE id = ?", [prdKnowledge, existing[0].id]);
        } else {
            await pool.query("INSERT INTO ai_knowledge_base (content, is_active) VALUES (?, 1)", [prdKnowledge]);
        }

        return NextResponse.json({
            success: true,
            message: `PRD Template (${PRD_TEMPLATE_SECTIONS.length} bagian) berhasil disimpan ke database!`,
            sections: PRD_TEMPLATE_SECTIONS.length,
            stored_in: ['system_settings (prd_template)', 'ai_knowledge_base (SOP aktif)']
        });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
