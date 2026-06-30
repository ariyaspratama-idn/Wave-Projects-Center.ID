const fs = require("fs");
const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    Header, Footer, AlignmentType, LevelFormat,
    HeadingLevel, BorderStyle, WidthType, ShadingType, VerticalAlign,
    PageNumber, PageBreak, TabStopType, TabStopPosition
} = require("docx");

// ---------- CONSTANTS ----------
const FONT = "Arial";
const NAVY = "1F4E79";
const BLUE = "2E75B6";
const GREY_TEXT = "595959";
const LIGHT_LINE = "B4C6E7";
const STRIPE = "F2F6FC";
const WHITE = "FFFFFF";
const BLACK = "000000";

const PAGE_W = 11906; // A4
const PAGE_H = 16838;
const MARGIN = 1440; // 1 inch
const CONTENT_W = PAGE_W - MARGIN * 2; // 9026

const ROLE_COLORS = {
    dev: "1F4E79",
    admin: "538135",
    keuangan: "BF8F00",
    cs: "C55A11",
    owner: "7030A0",
};

// ---------- LOW-LEVEL HELPERS ----------
function run(text, opts = {}) {
    return new TextRun({
        text,
        font: FONT,
        size: opts.size || 22,
        bold: opts.bold || false,
        italics: opts.italics || false,
        color: opts.color || BLACK,
    });
}

function para(text, opts = {}) {
    return new Paragraph({
        spacing: { before: opts.before || 0, after: opts.after || 120 },
        alignment: opts.align || AlignmentType.LEFT,
        children: [run(text, opts)],
    });
}

function heading1(text) {
    return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [run(text)] });
}

function heading2(text) {
    return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [run(text)] });
}

function divider(color = LIGHT_LINE) {
    return new Paragraph({
        spacing: { before: 40, after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color, space: 1 } },
        children: [],
    });
}

function roleBadge(label, color) {
    return new Paragraph({
        spacing: { before: 0, after: 160 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color, space: 4 } },
        children: [run(`UNTUK: ${label.toUpperCase()}`, { bold: true, color, size: 19 })],
    });
}

function bulletItem(text, opts = {}) {
    return new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 60 },
        children: [run(text, { italics: opts.italics !== false, color: opts.color || GREY_TEXT, size: 21 })],
    });
}

function plainBulletItem(text) {
    return new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 60 },
        children: [run(text, { color: BLACK, size: 21 })],
    });
}

function numberedItem(text) {
    return new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        spacing: { after: 80 },
        children: [run(text, { color: BLACK, size: 22 })],
    });
}

function fieldLabel(text) {
    return new Paragraph({
        spacing: { before: 160, after: 40 },
        children: [run(text, { bold: true, size: 22, color: NAVY })],
    });
}

function fieldBlock(label, items) {
    const out = [fieldLabel(label)];
    items.forEach((it) => out.push(bulletItem(it)));
    return out;
}

function pageBreak() {
    return new Paragraph({ children: [new PageBreak()] });
}

function tocItem(text, level = 0) {
    return new Paragraph({
        numbering: { reference: "bullets", level },
        spacing: { after: 70 },
        children: [run(text, { color: BLACK, size: 22, bold: level === 0 })],
    });
}

// ---------- TABLE HELPER ----------
function tableCell(text, { width, bold = false, color = BLACK, fill, align = AlignmentType.LEFT, size = 19 }) {
    const border = { style: BorderStyle.SINGLE, size: 1, color: LIGHT_LINE };
    const borders = { top: border, bottom: border, left: border, right: border };
    return new TableCell({
        borders,
        width: { size: width, type: WidthType.DXA },
        shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
        margins: { top: 90, bottom: 90, left: 120, right: 120 },
        verticalAlign: VerticalAlign.CENTER,
        children: [
            new Paragraph({
                alignment: align,
                children: [run(text, { bold, color, size })],
            }),
        ],
    });
}

function dataTable(headers, rows, colWidths, opts = {}) {
    const headerCells = headers.map((h, i) =>
        tableCell(h, { width: colWidths[i], bold: true, color: WHITE, fill: NAVY, align: opts.headerAlign || AlignmentType.CENTER, size: 19 })
    );
    const trows = [new TableRow({ children: headerCells, tableHeader: true })];
    rows.forEach((r, idx) => {
        const fill = idx % 2 === 1 ? STRIPE : undefined;
        const cells = r.map((val, i) =>
            tableCell(val, { width: colWidths[i], fill, align: opts.cellAlign && opts.cellAlign[i] ? opts.cellAlign[i] : AlignmentType.LEFT })
        );
        trows.push(new TableRow({ children: cells }));
    });
    return new Table({
        width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
        columnWidths: colWidths,
        rows: trows,
    });
}

// Two-column "form" table: label | fill-in area
function formTable(rowsData) {
    const colWidths = [2700, CONTENT_W - 2700];
    const trows = rowsData.map((r) => {
        return new TableRow({
            children: [
                tableCell(r[0], { width: colWidths[0], bold: true, fill: "EEF3FA", color: NAVY, size: 20 }),
                tableCell(r[1], { width: colWidths[1], color: GREY_TEXT, size: 20 }),
            ],
        });
    });
    return new Table({
        width: { size: CONTENT_W, type: WidthType.DXA },
        columnWidths: colWidths,
        rows: trows,
    });
}

function noteBox(text) {
    return new Table({
        width: { size: CONTENT_W, type: WidthType.DXA },
        columnWidths: [CONTENT_W],
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_LINE },
                            bottom: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_LINE },
                            left: { style: BorderStyle.SINGLE, size: 4, color: BLUE },
                            right: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_LINE },
                        },
                        shading: { fill: "F2F6FC", type: ShadingType.CLEAR },
                        width: { size: CONTENT_W, type: WidthType.DXA },
                        margins: { top: 140, bottom: 140, left: 200, right: 200 },
                        children: [
                            new Paragraph({ children: [run(text, { italics: true, color: GREY_TEXT, size: 20 })] }),
                        ],
                    }),
                ],
            }),
        ],
    });
}

// ---------- DOCUMENT CONTENT ----------
const children = [];

// ============ COVER PAGE ============
children.push(
    new Paragraph({ spacing: { before: 600, after: 0 }, children: [] }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 800, after: 100 },
        children: [run("Wave Projects. ID Center", { size: 22, color: GREY_TEXT, italics: true })],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        children: [run("PRODUCT REQUIREMENTS DOCUMENT", { size: 52, bold: true, color: NAVY })],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [run("( P R D )", { size: 32, bold: true, color: BLUE })],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 },
        children: [run("Template Standar Universal — Lintas Divisi", { size: 26, italics: true, color: GREY_TEXT })],
    }),
    new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BLUE, space: 1 } },
        spacing: { after: 600 },
        children: [],
    }),
    formTable([
        ["Nomor Dokumen (PRD ID)", "[Contoh: PRD-2026-001]"],
        ["Nama Proyek / Pesanan", "[Isi nama proyek atau pesanan di sini]"],
        ["Klien / Customer", "[Nama klien / customer]"],
        ["Tanggal Dibuat", "[DD/MM/YYYY]"],
        ["Versi Dokumen", "[v1.0]"],
        ["Status Dokumen", "Draft / Review / Disetujui / Berjalan / Selesai  (pilih salah satu)"],
        ["Disusun Oleh", "[Nama & Jabatan penyusun — biasanya Admin Customer Service]"],
        ["Disetujui Oleh", "[Nama & Jabatan — Super Admin / Pemilik]"],
    ]),
    new Paragraph({ spacing: { before: 800 }, children: [] }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [run("Dokumen Internal — Bersifat Rahasia", { size: 18, italics: true, color: GREY_TEXT })],
    }),
    pageBreak()
);

// ============ DAFTAR ISI ============
children.push(
    heading1("Daftar Isi"),
    para(
        "Gunakan daftar berikut sebagai peta navigasi dokumen. Anda juga dapat membuka panel Navigasi (View > Navigation Pane) di Microsoft Word untuk berpindah antar bagian dengan lebih cepat.",
        { italics: true, color: GREY_TEXT, size: 20 }
    ),
    new Paragraph({ spacing: { before: 100 }, children: [] }),
    tocItem("Panduan Penggunaan Template Ini"),
    tocItem("Bagian 1: Informasi Proyek / Pesanan"),
    tocItem("Bagian 2: Permintaan Asli dari Customer (Verbatim)"),
    tocItem("Bagian 3: Interpretasi & Klarifikasi Kebutuhan"),
    tocItem("Bagian 4: Tujuan & Kriteria Keberhasilan"),
    tocItem("Bagian 5: Matriks Tanggung Jawab (RACI)"),
    tocItem("Bagian 6: Kebutuhan Detail per Bagian / Divisi"),
    tocItem("6.1  Untuk Full Stack Developer / Tim Teknis", 1),
    tocItem("6.2  Untuk Admin (Operasional Umum)", 1),
    tocItem("6.3  Untuk Admin Keuangan", 1),
    tocItem("6.4  Untuk Admin Customer Service", 1),
    tocItem("6.5  Untuk Super Admin / Pemilik", 1),
    tocItem("Bagian 7: Timeline & Milestone"),
    tocItem("Bagian 8: Risiko & Ketergantungan"),
    tocItem("Bagian 9: Lampiran"),
    tocItem("Bagian 10: Persetujuan (Sign-Off)"),
    tocItem("Bagian 11: Riwayat Revisi"),
    pageBreak()
);

// ============ PANDUAN PENGGUNAAN ============
children.push(
    heading1("Panduan Penggunaan Template Ini"),
    para(
        "Template ini dibuat sebagai alat bantu universal untuk menerjemahkan permintaan customer atau pemesan — yang dalam praktiknya sering disampaikan secara tidak terstruktur, lisan, atau ambigu — menjadi dokumen kerja tunggal yang jelas, terukur, dan dapat langsung dieksekusi oleh seluruh bagian dalam tim."
    ),
    para(
        "Struktur PRD ini mengikuti kaidah umum manajemen produk/proyek global (problem statement, scope, RACI matrix, acceptance criteria, sign-off) namun disederhanakan agar dapat dipakai oleh tim lintas peran: Full Stack Developer, Admin, Admin Keuangan, Admin Customer Service, hingga Super Admin/Pemilik."
    ),
    fieldLabel("Alur Penggunaan yang Disarankan:"),
    numberedItem("Admin Customer Service menerima permintaan dari customer dan mencatatnya apa adanya (verbatim) pada Bagian 2."),
    numberedItem("Tim terkait berdiskusi untuk menerjemahkan permintaan tersebut menjadi kebutuhan yang jelas pada Bagian 3 dan 4, termasuk menandai asumsi serta hal yang perlu diklarifikasi ulang ke customer."),
    numberedItem("Setiap bagian melengkapi detail kebutuhan sesuai perannya masing-masing pada Bagian 6 (6.1 s.d. 6.5)."),
    numberedItem("Admin Keuangan dan Super Admin/Pemilik meninjau anggaran, risiko, dan kelayakan proyek sebelum dokumen disetujui."),
    numberedItem("Super Admin/Pemilik memberikan persetujuan akhir pada Bagian 10, dan dokumen yang telah disetujui menjadi acuan kerja bersama hingga pesanan selesai."),
    numberedItem("Setiap perubahan signifikan di tengah jalan dicatat pada Riwayat Revisi (Bagian 11), bukan ditambahkan diam-diam ke pekerjaan yang sudah disepakati."),
    new Paragraph({ spacing: { before: 220, after: 80 }, children: [run("Peta Bagian Dokumen vs. Penanggung Jawab Utama:", { bold: true, size: 22, color: NAVY })] }),
    dataTable(
        ["Bagian Dokumen", "Pihak yang Paling Berkepentingan"],
        [
            ["Bagian 1 – 4 (Informasi, Permintaan, Interpretasi, Tujuan)", "Seluruh tim — diinput utama oleh Admin Customer Service"],
            ["Bagian 5 (Matriks RACI)", "Seluruh tim"],
            ["Bagian 6.1", "Full Stack Developer / Tim Teknis"],
            ["Bagian 6.2", "Admin (Operasional)"],
            ["Bagian 6.3", "Admin Keuangan"],
            ["Bagian 6.4", "Admin Customer Service"],
            ["Bagian 6.5", "Super Admin / Pemilik"],
            ["Bagian 7 – 11 (Timeline, Risiko, Lampiran, Persetujuan, Revisi)", "Seluruh tim & Super Admin/Pemilik"],
        ],
        [5426, 3600]
    ),
    pageBreak()
);

// ============ BAGIAN 1 ============
children.push(
    heading1("Bagian 1: Informasi Proyek / Pesanan"),
    formTable([
        ["Nama Klien / Customer", "[Nama lengkap / nama usaha klien]"],
        ["Kontak (No. HP / Email)", "[Nomor telepon dan/atau alamat email]"],
        ["Channel Permintaan Masuk", "WhatsApp / Email / Telepon / Tatap Muka / Media Sosial / Lainnya"],
        ["Tanggal Permintaan Diterima", "[DD/MM/YYYY]"],
        ["Jenis Proyek / Produk / Layanan", "[Contoh: Pembuatan aplikasi, website, sistem internal, dsb.]"],
        ["Tingkat Prioritas", "Rendah / Sedang / Tinggi / Mendesak  (pilih salah satu)"],
        ["Tenggat Waktu yang Diminta Klien", "[DD/MM/YYYY atau “belum ditentukan”]"],
    ])
);

// ============ BAGIAN 2 ============
children.push(
    heading1("Bagian 2: Permintaan Asli dari Customer (Verbatim)"),
    noteBox(
        "Tempelkan permintaan customer persis seperti aslinya di bawah ini — termasuk jika kalimatnya tidak rapi, terpotong-potong, atau bercampur bahasa. Jangan diedit atau dirapikan dulu di sini. Proses merapikan dan menerjemahkan kebutuhan dilakukan secara terpisah pada Bagian 3."
    ),
    fieldLabel("Isi Permintaan Customer (salin-tempel apa adanya):"),
    para("[Tempel di sini pesan, transkrip percakapan, atau catatan permintaan asli dari customer]", { italics: true, color: GREY_TEXT }),
    para("", { after: 600 }),
    fieldLabel("Lampiran dari Customer (jika ada):"),
    bulletItem("[Contoh: referensi gambar, contoh desain, dokumen, tautan, dll.]"),
    bulletItem("[Tambahkan baris lain bila ada lampiran lebih dari satu]")
);

// ============ BAGIAN 3 ============
children.push(
    heading1("Bagian 3: Interpretasi & Klarifikasi Kebutuhan"),
    para(
        "Bagian ini adalah inti dari proses “penerjemahan” permintaan customer menjadi kebutuhan kerja yang jelas. Pisahkan dengan tegas antara apa yang benar-benar dikatakan customer (Bagian 2) dan bagaimana tim memahaminya di sini."
    ),
    ...fieldBlock("Pemahaman Tim terhadap Permintaan (ringkasan dalam bahasa yang jelas)", [
        "[Tuliskan ulang permintaan customer dalam kalimat yang terstruktur dan tidak ambigu]",
    ]),
    ...fieldBlock("Asumsi yang Diambil Tim (karena tidak disebutkan eksplisit oleh customer)", [
        "[Contoh: Asumsi bahwa target pengguna adalah perangkat mobile, karena customer tidak menyebutkan platform]",
        "[Tambahkan asumsi lain di sini]",
    ]),
    ...fieldBlock("Pertanyaan yang Perlu Diklarifikasi ke Customer", [
        "[Contoh: Apakah dibutuhkan integrasi pembayaran online atau cukup transfer manual?]",
        "[Tambahkan pertanyaan lain di sini]",
    ]),
    ...fieldBlock("Termasuk dalam Cakupan Pekerjaan (In-Scope)", [
        "[Daftar hal yang disepakati akan dikerjakan]",
    ]),
    ...fieldBlock("TIDAK Termasuk dalam Cakupan Pekerjaan (Out-of-Scope)", [
        "[Daftar hal yang secara eksplisit TIDAK dikerjakan, agar tidak terjadi scope creep di kemudian hari]",
    ])
);

// ============ BAGIAN 4 ============
children.push(
    heading1("Bagian 4: Tujuan & Kriteria Keberhasilan"),
    ...fieldBlock("Tujuan Bisnis / Tujuan Proyek", [
        "[Mengapa customer membutuhkan ini? Masalah apa yang ingin diselesaikan?]",
    ]),
    ...fieldBlock("Indikator Keberhasilan (Success Metrics / KPI)", [
        "[Contoh: Sistem mampu memproses 100 transaksi per hari tanpa gangguan]",
    ]),
    ...fieldBlock("Definisi “Selesai” (Definition of Done)", [
        "[Kondisi spesifik yang menandakan pekerjaan dapat dianggap tuntas dan diserahterimakan]",
    ])
);

// ============ BAGIAN 5: RACI ============
children.push(
    heading1("Bagian 5: Matriks Tanggung Jawab (RACI)"),
    para(
        "Matriks ini memetakan siapa mengerjakan apa di setiap tahapan, agar tidak ada pekerjaan yang terlewat atau dikerjakan ganda oleh dua bagian sekaligus."
    ),
    dataTable(
        ["Aktivitas / Deliverable", "Full Stack Dev", "Admin", "Adm. Keuangan", "Adm. CS", "Super Admin"],
        [
            ["Menerima & mencatat permintaan customer", "I", "C", "I", "R/A", "I"],
            ["Menerjemahkan kebutuhan menjadi PRD (Bag. 2–4)", "C", "C", "I", "R", "A"],
            ["Menyusun estimasi biaya & penawaran", "C", "I", "R/A", "I", "A"],
            ["Persetujuan PRD sebelum eksekusi dimulai", "I", "I", "I", "I", "R/A"],
            ["Pengerjaan / pengembangan produk", "R/A", "C", "I", "I", "I"],
            ["Update progres berkala ke customer", "C", "I", "I", "R/A", "I"],
            ["Penagihan & pencatatan pembayaran", "I", "I", "R/A", "C", "I"],
            ["Quality check & serah terima hasil", "R", "C", "I", "C", "A"],
            ["Penutupan proyek & evaluasi akhir", "C", "C", "C", "C", "R/A"],
        ],
        [3026, 1200, 1200, 1200, 1200, 1200],
        { headerAlign: AlignmentType.CENTER, cellAlign: [AlignmentType.LEFT, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER] }
    ),
    new Paragraph({
        spacing: { before: 160 },
        children: [
            run("Keterangan: ", { bold: true, size: 19 }),
            run("R = Responsible (pelaksana) • A = Accountable (penanggung jawab akhir) • C = Consulted (dikonsultasikan) • I = Informed (diinformasikan)", { size: 19, color: GREY_TEXT }),
        ],
    }),
    pageBreak()
);

// ============ BAGIAN 6 INTRO ============
children.push(
    heading1("Bagian 6: Kebutuhan Detail per Bagian / Divisi"),
    para(
        "Setiap sub-bagian di bawah ini ditujukan untuk satu peran spesifik. Saat dokumen ini dibagikan, masing-masing peran dapat langsung menuju sub-bagiannya tanpa perlu membaca detail teknis atau finansial yang bukan tanggung jawabnya — namun tetap memiliki konteks lengkap dari Bagian 1–5 di atas."
    )
);

// 6.1 Full Stack Developer
children.push(
    heading2("6.1  Untuk Full Stack Developer / Tim Teknis"),
    roleBadge("Full Stack Developer / Tim Teknis", ROLE_COLORS.dev),
    ...fieldBlock("Kebutuhan Fungsional (Functional Requirements)", [
        "[Contoh: Sistem login & manajemen akun pengguna]",
        "[Contoh: Dashboard admin untuk mengelola data]",
        "[Contoh: Form pemesanan / transaksi online]",
        "[Tambahkan kebutuhan fungsional lain di sini]",
    ]),
    ...fieldBlock("Kebutuhan Non-Fungsional (performa, keamanan, skalabilitas)", [
        "[Contoh: Waktu muat halaman di bawah 3 detik, data pengguna terenkripsi, dapat menampung hingga 1000 pengguna aktif]",
    ]),
    ...fieldBlock("Platform & Tech Stack", [
        "[Web / Mobile (iOS, Android) / Desktop — sebutkan bahasa pemrograman, framework, dan database yang digunakan]",
    ]),
    ...fieldBlock("Integrasi Pihak Ketiga", [
        "[Contoh: payment gateway, API pengiriman, layanan SMS/WhatsApp, dll.]",
    ]),
    ...fieldBlock("Alur Pengguna (User Flow) Singkat", [
        "[Gambarkan langkah demi langkah bagaimana pengguna akhir akan menggunakan produk/fitur ini]",
    ]),
    ...fieldBlock("Batasan Teknis (Technical Constraints)", [
        "[Contoh: harus kompatibel dengan sistem lama, batas waktu pengerjaan, infrastruktur yang sudah ada]",
    ]),
    ...fieldBlock("Kriteria Penerimaan Teknis (Acceptance Criteria)", [
        "[Contoh: Fitur dapat digunakan tanpa error pada browser Chrome, Safari, dan Firefox versi terbaru]",
        "[Tambahkan kriteria lain yang terukur dan dapat diuji]",
    ]),
    pageBreak()
);

// 6.2 Admin
children.push(
    heading2("6.2  Untuk Admin (Operasional Umum)"),
    roleBadge("Admin (Operasional)", ROLE_COLORS.admin),
    ...fieldBlock("Rincian Tugas & Timeline Internal", [
        "[Daftar tugas operasional harian/mingguan terkait proyek ini]",
    ]),
    ...fieldBlock("Sumber Daya yang Dibutuhkan", [
        "[Contoh: akses software tertentu, tenaga tambahan, perangkat]",
    ]),
    ...fieldBlock("Koordinasi Antar Tim yang Diperlukan", [
        "[Siapa perlu berkoordinasi dengan siapa, dan kapan]",
    ]),
    ...fieldBlock("Dokumentasi / Pelaporan yang Harus Disiapkan", [
        "[Contoh: laporan progres mingguan ke Super Admin/Pemilik]",
    ]),
    pageBreak()
);

// 6.3 Admin Keuangan
children.push(
    heading2("6.3  Untuk Admin Keuangan"),
    roleBadge("Admin Keuangan", ROLE_COLORS.keuangan),
    ...fieldBlock("Estimasi Biaya / Anggaran Proyek", [
        "[Rincian komponen biaya: jasa pengerjaan, infrastruktur/server, lisensi, dll.]",
    ]),
    ...fieldBlock("Termin Pembayaran", [
        "[Contoh: DP 50% di awal, pelunasan 50% saat serah terima]",
    ]),
    ...fieldBlock("Rincian Item Tagihan / Invoice", [
        "[Daftar item yang akan ditagihkan beserta nominalnya]",
    ]),
    ...fieldBlock("Status Pembayaran", [
        "Belum Dibayar / DP Diterima / Lunas  (perbarui sesuai progres)",
    ]),
    ...fieldBlock("Catatan Pajak / Legal (jika relevan)", [
        "[Contoh: PPN, kebutuhan kontrak kerja atau surat perjanjian]",
    ]),
    pageBreak()
);

// 6.4 Admin CS
children.push(
    heading2("6.4  Untuk Admin Customer Service"),
    roleBadge("Admin Customer Service", ROLE_COLORS.cs),
    ...fieldBlock("Rencana & Channel Komunikasi dengan Customer", [
        "[Contoh: update dikirim via WhatsApp setiap Senin & Kamis]",
    ]),
    ...fieldBlock("Frekuensi Update yang Dijanjikan ke Customer", [
        "[Contoh: setiap 3 hari kerja, atau setiap pencapaian milestone]",
    ]),
    ...fieldBlock("Ekspektasi Customer yang Perlu Dikelola", [
        "[Contoh: pastikan customer memahami estimasi waktu pengerjaan dan batasan scope]",
    ]),
    ...fieldBlock("Prosedur Eskalasi Jika Ada Komplain / Masalah", [
        "[Ke siapa dan bagaimana isu disampaikan jika tidak dapat diselesaikan sendiri oleh CS]",
    ]),
    ...fieldBlock("Pertanyaan yang Mungkin Diajukan Customer (FAQ Antisipatif)", [
        "[Contoh: “Kapan progres bisa dilihat?”, “Bisakah ada revisi setelah selesai?”]",
    ]),
    pageBreak()
);

// 6.5 Super Admin
children.push(
    heading2("6.5  Untuk Super Admin / Pemilik"),
    roleBadge("Super Admin / Pemilik", ROLE_COLORS.owner),
    ...fieldBlock("Keselarasan dengan Strategi / Arah Bisnis", [
        "[Apakah proyek/pesanan ini sejalan dengan arah bisnis perusahaan saat ini?]",
    ]),
    ...fieldBlock("Penilaian Risiko & Tingkat Urgensi", [
        "[Risiko utama dan seberapa mendesak proyek ini dibandingkan pekerjaan lain yang berjalan]",
    ]),
    ...fieldBlock("Persetujuan Anggaran & Alokasi Sumber Daya", [
        "[Konfirmasi anggaran dan sumber daya tim yang dialokasikan]",
    ]),
    ...fieldBlock("Keputusan Akhir & Catatan Khusus", [
        "[Catatan, arahan, atau syarat khusus dari Pemilik sebelum proyek dieksekusi]",
    ]),
    pageBreak()
);

// ============ BAGIAN 7: TIMELINE ============
children.push(
    heading1("Bagian 7: Timeline & Milestone"),
    dataTable(
        ["Milestone / Tahapan", "Penanggung Jawab", "Target Tanggal", "Status"],
        [
            ["Klarifikasi & persetujuan PRD", "Admin CS & Super Admin", "[tgl]", "[status]"],
            ["Estimasi biaya & pembayaran DP", "Admin Keuangan", "[tgl]", "[status]"],
            ["Mulai pengerjaan / development", "Full Stack Developer", "[tgl]", "[status]"],
            ["Progress review / demo ke customer", "Full Stack Dev & Super Admin", "[tgl]", "[status]"],
            ["Quality check & revisi", "Full Stack Dev & Admin", "[tgl]", "[status]"],
            ["Serah terima & pelunasan", "Admin Keuangan & Admin CS", "[tgl]", "[status]"],
            ["Penutupan proyek", "Super Admin / Pemilik", "[tgl]", "[status]"],
        ],
        [3526, 2400, 1700, 1400]
    )
);

// ============ BAGIAN 8: RISIKO ============
children.push(
    heading1("Bagian 8: Risiko & Ketergantungan"),
    dataTable(
        ["Risiko / Hambatan", "Dampak", "Rencana Mitigasi", "PIC"],
        [
            ["Kebutuhan customer berubah di tengah jalan", "Keterlambatan & pembengkakan biaya", "Scope didokumentasikan di awal; perubahan di luar scope dikenakan biaya tambahan", "Admin CS & Super Admin"],
            ["Keterlambatan pembayaran dari customer", "Proyek tertunda", "Termin pembayaran disepakati & ditagih sejak awal", "Admin Keuangan"],
            ["Ketergantungan pada pihak ketiga (API/vendor)", "Pengerjaan terhambat di luar kendali tim", "Siapkan alternatif / rencana cadangan", "Full Stack Developer"],
            ["Miskomunikasi antar bagian", "Hasil tidak sesuai ekspektasi", "Update rutin & seluruh keputusan dicatat di PRD ini", "Seluruh Tim"],
            ["[Tambahkan risiko lain sesuai konteks proyek]", "[dampak]", "[mitigasi]", "[PIC]"],
        ],
        [2526, 2000, 3000, 1500]
    )
);

// ============ BAGIAN 9: LAMPIRAN ============
children.push(
    heading1("Bagian 9: Lampiran"),
    para("Cantumkan dokumen, tautan, atau referensi pendukung lain yang relevan dengan proyek/pesanan ini."),
    plainBulletItem("[Contoh: tautan desain/mockup]"),
    plainBulletItem("[Contoh: dokumen kontrak / penawaran]"),
    plainBulletItem("[Contoh: catatan rapat dengan customer]"),
    plainBulletItem("[Tambahkan lampiran lain di sini]"),
    pageBreak()
);

// ============ BAGIAN 10: PERSETUJUAN ============
children.push(
    heading1("Bagian 10: Persetujuan (Sign-Off)"),
    para("Dokumen ini dianggap berlaku sebagai acuan kerja bersama setelah seluruh pihak berikut menandatangani persetujuan."),
    dataTable(
        ["Jabatan / Peran", "Nama", "Tanda Tangan", "Tanggal"],
        [
            ["Full Stack Developer", "[Nama]", "", "[tgl]"],
            ["Admin", "[Nama]", "", "[tgl]"],
            ["Admin Keuangan", "[Nama]", "", "[tgl]"],
            ["Admin Customer Service", "[Nama]", "", "[tgl]"],
            ["Super Admin / Pemilik", "[Nama]", "", "[tgl]"],
        ],
        [2826, 2300, 2200, 1700]
    )
);

// ============ BAGIAN 11: REVISI ============
children.push(
    heading1("Bagian 11: Riwayat Revisi"),
    dataTable(
        ["Versi", "Tanggal", "Diubah Oleh", "Deskripsi Perubahan"],
        [
            ["v1.0", "[tgl]", "[nama]", "Draf awal dibuat berdasarkan permintaan customer"],
            ["[v1.1]", "[tgl]", "[nama]", "[deskripsi perubahan]"],
        ],
        [1200, 1600, 2226, 4000]
    )
);

// ---------- DOCUMENT ASSEMBLY ----------
const doc = new Document({
    creator: "Wave Web Agency",
    title: "Template PRD Universal Lintas Divisi",
    styles: {
        default: {
            document: { run: { font: FONT, size: 22, color: BLACK } },
        },
        paragraphStyles: [
            {
                id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 30, bold: true, font: FONT, color: NAVY },
                paragraph: {
                    spacing: { before: 320, after: 200 },
                    outlineLevel: 0,
                    keepNext: true,
                    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY, space: 4 } },
                },
            },
            {
                id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 25, bold: true, font: FONT, color: BLUE },
                paragraph: { spacing: { before: 260, after: 140 }, outlineLevel: 1, keepNext: true },
            },
        ],
    },
    numbering: {
        config: [
            {
                reference: "bullets",
                levels: [
                    {
                        level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
                        style: { paragraph: { indent: { left: 540, hanging: 270 } } }
                    },
                    {
                        level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT,
                        style: { paragraph: { indent: { left: 1080, hanging: 270 } } }
                    },
                ],
            },
            {
                reference: "numbers",
                levels: [{
                    level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
                    style: { paragraph: { indent: { left: 540, hanging: 270 } } }
                }],
            },
        ],
    },
    sections: [
        {
            properties: {
                page: {
                    size: { width: PAGE_W, height: PAGE_H },
                    margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
                },
            },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_LINE, space: 4 } },
                            children: [
                                run("Template PRD — Standar Universal Lintas Divisi", { size: 16, color: GREY_TEXT }),
                                run("\tWave Projects. ID Center", { size: 16, color: GREY_TEXT }),
                            ],
                        }),
                    ],
                }),
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                            children: [
                                run("Dokumen Internal — Bersifat Rahasia", { size: 16, color: GREY_TEXT }),
                                new TextRun({ text: "\tHalaman ", font: FONT, size: 16, color: GREY_TEXT }),
                                new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: GREY_TEXT }),
                                new TextRun({ text: " / ", font: FONT, size: 16, color: GREY_TEXT }),
                                new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: GREY_TEXT }),
                            ],
                        }),
                    ],
                }),
            },
            children,
        },
    ],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("Template_PRD_Universal_Lintas_Divisi.docx", buffer);
    console.log("Document generated successfully.");
});
