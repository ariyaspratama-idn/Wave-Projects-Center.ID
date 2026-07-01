/**
 * prdDocxRenderer.js
 * ------------------------------------------------------------------
 * Renders a complete PRD data object into a .docx Buffer, visually
 * matching the original "Template PRD Universal Lintas Divisi".
 *
 * Input shape (see generatePRD.js for how this is assembled):
 *   {
 *     // known facts (from your own system / intake form — NOT from AI)
 *     prdId, companyName, projectName, clientName, contact, channel,
 *     dateCreated, dateReceived, version, status, projectType,
 *     priority, deadline, preparedBy, approvedBy, rawCustomerRequest,
 *
 *     // AI-drafted content (matches prdSchema.js exactly)
 *     interpretation, goals, raci, roleRequirements, timeline, risks,
 *     suggestedAttachments,
 *   }
 *
 * Sign-off and revision history are intentionally rendered as BLANK
 * fillable sections (same as the original template) since those are
 * human inputs (real signatures/approval dates), never AI-generated.
 */

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType, VerticalAlign,
  PageNumber, PageBreak, TabStopType, TabStopPosition,
} = require("docx");

// ---------- CONSTANTS ----------
const FONT = "Arial";
const NAVY = "1F4E79";
const BLUE = "2E75B6";
const GREY_TEXT = "595959";
const LIGHT_LINE = "B4C6E7";
const STRIPE = "F2F6FC";
const BLACK = "000000";
const WHITE = "FFFFFF";

const PAGE_W = 11906; // A4
const PAGE_H = 16838;
const MARGIN = 1440;
const CONTENT_W = PAGE_W - MARGIN * 2; // 9026

const ROLE_COLORS = { dev: "1F4E79", admin: "538135", keuangan: "BF8F00", cs: "C55A11", owner: "7030A0" };

const FALLBACK = "[belum diisi]";
const EMPTY_NOTE = "(Tidak ada / tidak relevan untuk permintaan ini)";

const fmt = (v) => (v === undefined || v === null ? FALLBACK : String(v));

// ---------- LOW-LEVEL HELPERS ----------
function run(text, opts = {}) {
  return new TextRun({
    text: text === undefined || text === null ? "" : String(text),
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
    children: [run(text, { italics: opts.italics || false, color: opts.color || BLACK, size: 21 })],
  });
}

function fieldLabel(text) {
  return new Paragraph({
    spacing: { before: 160, after: 40 },
    children: [run(text, { bold: true, size: 22, color: NAVY })],
  });
}

// Renders a label + a list of AI-drafted bullet items (real content, normal weight).
// Falls back to a grey italic "tidak ada" note when the array is empty.
function fieldBlockList(label, items) {
  const out = [fieldLabel(label)];
  if (!items || items.length === 0) {
    out.push(bulletItem(EMPTY_NOTE, { italics: true, color: GREY_TEXT }));
  } else {
    items.forEach((it) => out.push(bulletItem(fmt(it))));
  }
  return out;
}

// Renders a label + a single block of AI-drafted prose text.
function fieldBlockText(label, text) {
  return [fieldLabel(label), para(fmt(text), { color: BLACK, size: 22 })];
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

// ---------- TABLE HELPERS ----------
function tableCell(text, { width, bold = false, color = BLACK, fill, align = AlignmentType.LEFT, size = 19 }) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: LIGHT_LINE };
  const borders = { top: border, bottom: border, left: border, right: border };
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 90, bottom: 90, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: align, children: [run(text, { bold, color, size })] })],
  });
}

function dataTable(headers, rows, colWidths, opts = {}) {
  const headerCells = headers.map((h, i) =>
    tableCell(h, { width: colWidths[i], bold: true, color: WHITE, fill: NAVY, align: opts.headerAlign || AlignmentType.CENTER, size: 19 })
  );
  const trows = [new TableRow({ children: headerCells, tableHeader: true })];
  if (!rows || rows.length === 0) {
    trows.push(
      new TableRow({
        children: [tableCell(EMPTY_NOTE, { width: colWidths.reduce((a, b) => a + b, 0), color: GREY_TEXT })],
      })
    );
  } else {
    rows.forEach((r, idx) => {
      const fill = idx % 2 === 1 ? STRIPE : undefined;
      const cells = r.map((val, i) =>
        tableCell(fmt(val), { width: colWidths[i], fill, align: opts.cellAlign && opts.cellAlign[i] ? opts.cellAlign[i] : AlignmentType.LEFT })
      );
      trows.push(new TableRow({ children: cells }));
    });
  }
  return new Table({ width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: colWidths, rows: trows });
}

function formTable(rowsData) {
  const colWidths = [2700, CONTENT_W - 2700];
  const trows = rowsData.map(
    (r) =>
      new TableRow({
        children: [
          tableCell(r[0], { width: colWidths[0], bold: true, fill: "EEF3FA", color: NAVY, size: 20 }),
          tableCell(fmt(r[1]), { width: colWidths[1], color: BLACK, size: 20 }),
        ],
      })
  );
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: colWidths, rows: trows });
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
            children: [new Paragraph({ children: [run(text, { italics: true, color: GREY_TEXT, size: 20 })] })],
          }),
        ],
      }),
    ],
  });
}

// Long free-text block (verbatim customer request) inside a bordered box.
function textBox(text) {
  const lines = String(text || "")
    .split(/\n+/)
    .filter((l) => l.trim() !== "");
  const paras = lines.length
    ? lines.map((line) => new Paragraph({ spacing: { after: 100 }, children: [run(line.trim(), { size: 21 })] }))
    : [new Paragraph({ children: [run(FALLBACK, { size: 21, color: GREY_TEXT, italics: true })] })];
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
              left: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_LINE },
              right: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_LINE },
            },
            width: { size: CONTENT_W, type: WidthType.DXA },
            margins: { top: 160, bottom: 160, left: 200, right: 200 },
            children: paras,
          }),
        ],
      }),
    ],
  });
}

const raciCols = ["Full Stack Dev", "Admin", "Adm. Keuangan", "Adm. CS", "Super Admin"];

/**
 * @param {object} prdData - merged known-facts + AI output, see file header
 * @returns {Promise<Buffer>}
 */
async function renderPRDToDocx(prdData) {
  const d = prdData || {};
  const interp = d.interpretation || {};
  const goals = d.goals || {};
  const raci = d.raci || [];
  const rr = d.roleRequirements || {};
  const dev = rr.dev || {};
  const admin = rr.admin || {};
  const finance = rr.finance || {};
  const cs = rr.cs || {};
  const owner = rr.owner || {};
  const timeline = d.timeline || [];
  const risks = d.risks || [];
  const attachments = d.suggestedAttachments || [];

  const companyName = d.companyName || "[Nama Perusahaan / Brand Anda]";
  const dateCreated = d.dateCreated || new Date().toLocaleDateString("id-ID");

  const children = [];

  // ============ COVER ============
  children.push(
    new Paragraph({ spacing: { before: 600, after: 0 }, children: [] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 800, after: 100 }, children: [run(companyName, { size: 22, color: GREY_TEXT, italics: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 }, children: [run("PRODUCT REQUIREMENTS DOCUMENT", { size: 52, bold: true, color: NAVY })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [run("( P R D )", { size: 32, bold: true, color: BLUE })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 800 }, children: [run(fmt(d.projectName), { size: 26, italics: true, color: GREY_TEXT })] }),
    new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BLUE, space: 1 } }, spacing: { after: 600 }, children: [] }),
    formTable([
      ["Nomor Dokumen (PRD ID)", d.prdId],
      ["Nama Proyek / Pesanan", d.projectName],
      ["Klien / Customer", d.clientName],
      ["Tanggal Dibuat", dateCreated],
      ["Versi Dokumen", d.version || "v1.0 (Draf AI)"],
      ["Status Dokumen", d.status || "Draft \u2014 menunggu review tim"],
      ["Disusun Oleh", d.preparedBy || "AI Assistant (draf otomatis)"],
      ["Disetujui Oleh", d.approvedBy],
    ]),
    new Paragraph({ spacing: { before: 400 }, children: [] }),
    noteBox(
      "Dokumen ini adalah DRAF yang dihasilkan otomatis oleh AI berdasarkan permintaan customer. Seluruh isi \u2014 terutama estimasi biaya, tanggal, dan asumsi pada Bagian 3 \u2014 wajib direview dan dikonfirmasi oleh tim terkait sebelum digunakan sebagai acuan kerja final."
    ),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [run("Dokumen Internal \u2014 Bersifat Rahasia", { size: 18, italics: true, color: GREY_TEXT })] }),
    pageBreak()
  );

  // ============ DAFTAR ISI ============
  children.push(
    heading1("Daftar Isi"),
    para("Gunakan daftar berikut sebagai peta navigasi dokumen. Anda juga dapat membuka panel Navigasi (View > Navigation Pane) di Microsoft Word untuk berpindah antar bagian dengan lebih cepat.", { italics: true, color: GREY_TEXT, size: 20 }),
    new Paragraph({ spacing: { before: 100 }, children: [] }),
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

  // ============ BAGIAN 1 ============
  children.push(
    heading1("Bagian 1: Informasi Proyek / Pesanan"),
    formTable([
      ["Nama Klien / Customer", d.clientName],
      ["Kontak (No. HP / Email)", d.contact],
      ["Channel Permintaan Masuk", d.channel],
      ["Tanggal Permintaan Diterima", d.dateReceived],
      ["Jenis Proyek / Produk / Layanan", d.projectType],
      ["Tingkat Prioritas", d.priority],
      ["Tenggat Waktu yang Diminta Klien", d.deadline],
    ])
  );

  // ============ BAGIAN 2 ============
  children.push(
    heading1("Bagian 2: Permintaan Asli dari Customer (Verbatim)"),
    fieldLabel("Isi Permintaan Customer (apa adanya):"),
    textBox(d.rawCustomerRequest),
    fieldLabel("Lampiran dari Customer:"),
    ...(d.customerAttachments && d.customerAttachments.length
      ? d.customerAttachments.map((a) => bulletItem(fmt(a)))
      : [bulletItem(EMPTY_NOTE, { italics: true, color: GREY_TEXT })])
  );

  // ============ BAGIAN 3 ============
  children.push(
    heading1("Bagian 3: Interpretasi & Klarifikasi Kebutuhan"),
    para("Bagian ini adalah hasil terjemahan AI atas permintaan customer pada Bagian 2. WAJIB direview oleh tim sebelum dieksekusi \u2014 khususnya bagian asumsi dan pertanyaan klarifikasi di bawah."),
    ...fieldBlockText("Pemahaman Tim terhadap Permintaan", interp.teamUnderstanding),
    ...fieldBlockList("Asumsi yang Diambil (perlu dikonfirmasi)", interp.assumptions),
    ...fieldBlockList("Pertanyaan yang Perlu Diklarifikasi ke Customer", interp.clarifyingQuestions),
    ...fieldBlockList("Termasuk dalam Cakupan Pekerjaan (In-Scope)", interp.inScope),
    ...fieldBlockList("TIDAK Termasuk dalam Cakupan Pekerjaan (Out-of-Scope)", interp.outOfScope)
  );

  // ============ BAGIAN 4 ============
  children.push(
    heading1("Bagian 4: Tujuan & Kriteria Keberhasilan"),
    ...fieldBlockText("Tujuan Bisnis / Tujuan Proyek", goals.businessGoal),
    ...fieldBlockList("Indikator Keberhasilan (Success Metrics / KPI)", goals.successMetrics),
    ...fieldBlockText("Definisi \u201cSelesai\u201d (Definition of Done)", goals.definitionOfDone)
  );

  // ============ BAGIAN 5: RACI ============
  children.push(
    heading1("Bagian 5: Matriks Tanggung Jawab (RACI)"),
    para("Matriks ini memetakan siapa mengerjakan apa di setiap tahapan, agar tidak ada pekerjaan yang terlewat atau dikerjakan ganda."),
    dataTable(
      ["Aktivitas / Deliverable", ...raciCols],
      raci.map((r) => [r.activity, r.dev, r.admin, r.finance, r.cs, r.owner]),
      [3026, 1200, 1200, 1200, 1200, 1200],
      { headerAlign: AlignmentType.CENTER, cellAlign: [AlignmentType.LEFT, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER] }
    ),
    new Paragraph({
      spacing: { before: 160 },
      children: [
        run("Keterangan: ", { bold: true, size: 19 }),
        run("R = Responsible (pelaksana) \u2022 A = Accountable (penanggung jawab akhir) \u2022 C = Consulted (dikonsultasikan) \u2022 I = Informed (diinformasikan)", { size: 19, color: GREY_TEXT }),
      ],
    }),
    pageBreak()
  );

  // ============ BAGIAN 6 ============
  children.push(
    heading1("Bagian 6: Kebutuhan Detail per Bagian / Divisi"),
    para("Setiap sub-bagian di bawah ini ditujukan untuk satu peran spesifik dan dapat langsung didistribusikan tanpa perlu membaca detail yang bukan tanggung jawabnya.")
  );

  children.push(
    heading2("6.1  Untuk Full Stack Developer / Tim Teknis"),
    roleBadge("Full Stack Developer / Tim Teknis", ROLE_COLORS.dev),
    ...fieldBlockList("Kebutuhan Fungsional (Functional Requirements)", dev.functionalRequirements),
    ...fieldBlockList("Kebutuhan Non-Fungsional (performa, keamanan, skalabilitas)", dev.nonFunctionalRequirements),
    ...fieldBlockText("Platform & Tech Stack (saran awal)", dev.techStackNotes),
    ...fieldBlockList("Integrasi Pihak Ketiga", dev.integrations),
    ...fieldBlockText("Alur Pengguna (User Flow)", dev.userFlow),
    ...fieldBlockText("Batasan Teknis (Technical Constraints)", dev.constraints),
    ...fieldBlockList("Kriteria Penerimaan Teknis (Acceptance Criteria)", dev.acceptanceCriteria),
    pageBreak()
  );

  children.push(
    heading2("6.2  Untuk Admin (Operasional Umum)"),
    roleBadge("Admin (Operasional)", ROLE_COLORS.admin),
    ...fieldBlockList("Rincian Tugas & Timeline Internal", admin.tasks),
    ...fieldBlockList("Sumber Daya yang Dibutuhkan", admin.resources),
    ...fieldBlockList("Koordinasi Antar Tim yang Diperlukan", admin.coordination),
    ...fieldBlockList("Dokumentasi / Pelaporan yang Harus Disiapkan", admin.documentation),
    pageBreak()
  );

  children.push(
    heading2("6.3  Untuk Admin Keuangan"),
    roleBadge("Admin Keuangan", ROLE_COLORS.keuangan),
    ...fieldBlockText("Estimasi Biaya / Anggaran Proyek (draf awal \u2014 wajib divalidasi)", finance.budgetEstimateNotes),
    ...fieldBlockText("Saran Termin Pembayaran", finance.paymentTermsSuggestion),
    ...fieldBlockList("Rincian Item Tagihan / Invoice", finance.invoiceItems),
    ...fieldBlockText("Status Pembayaran", finance.paymentStatus),
    ...fieldBlockText("Catatan Pajak / Legal", finance.taxNotes),
    pageBreak()
  );

  children.push(
    heading2("6.4  Untuk Admin Customer Service"),
    roleBadge("Admin Customer Service", ROLE_COLORS.cs),
    ...fieldBlockText("Rencana & Channel Komunikasi dengan Customer", cs.communicationPlan),
    ...fieldBlockText("Frekuensi Update yang Dijanjikan ke Customer", cs.updateFrequency),
    ...fieldBlockList("Ekspektasi Customer yang Perlu Dikelola", cs.customerExpectations),
    ...fieldBlockText("Prosedur Eskalasi Jika Ada Komplain / Masalah", cs.escalationProcedure),
    ...fieldBlockList("Pertanyaan yang Mungkin Diajukan Customer (FAQ Antisipatif)", cs.faq),
    pageBreak()
  );

  children.push(
    heading2("6.5  Untuk Super Admin / Pemilik"),
    roleBadge("Super Admin / Pemilik", ROLE_COLORS.owner),
    ...fieldBlockText("Keselarasan dengan Strategi / Arah Bisnis", owner.strategicAlignment),
    ...fieldBlockText("Penilaian Risiko & Tingkat Urgensi", owner.riskAssessment),
    ...fieldBlockText("Persetujuan Anggaran & Alokasi Sumber Daya yang Diminta", owner.budgetApproval),
    ...fieldBlockText("Keputusan Akhir & Catatan Khusus", owner.finalDecisionNotes),
    pageBreak()
  );

  // ============ BAGIAN 7: TIMELINE ============
  children.push(
    heading1("Bagian 7: Timeline & Milestone"),
    dataTable(
      ["Milestone / Tahapan", "Penanggung Jawab", "Target Waktu", "Status"],
      timeline.map((t) => [t.milestone, t.pic, t.targetDateNote, t.status]),
      [3526, 2400, 1700, 1400]
    )
  );

  // ============ BAGIAN 8: RISIKO ============
  children.push(
    heading1("Bagian 8: Risiko & Ketergantungan"),
    dataTable(
      ["Risiko / Hambatan", "Dampak", "Rencana Mitigasi", "PIC"],
      risks.map((r) => [r.risk, r.impact, r.mitigation, r.pic]),
      [2526, 2000, 3000, 1500]
    )
  );

  // ============ BAGIAN 9: LAMPIRAN ============
  children.push(
    heading1("Bagian 9: Lampiran"),
    para("Dokumen, tautan, atau referensi pendukung yang relevan dengan proyek/pesanan ini (saran awal dari AI, lengkapi sesuai kebutuhan)."),
    ...(attachments.length ? attachments.map((a) => bulletItem(fmt(a))) : [bulletItem(EMPTY_NOTE, { italics: true, color: GREY_TEXT })]),
    pageBreak()
  );

  // ============ BAGIAN 10: PERSETUJUAN (selalu kosong - diisi manusia) ============
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
    ),
    pageBreak()
  );

  // ============ BAGIAN 11: REVISI (selalu mulai dari draf AI) ============
  children.push(
    heading1("Bagian 11: Riwayat Revisi"),
    dataTable(
      ["Versi", "Tanggal", "Diubah Oleh", "Deskripsi Perubahan"],
      [["v1.0", dateCreated, d.preparedBy || "AI Assistant", "Draf otomatis dibuat dari permintaan customer"]],
      [1200, 1600, 2226, 4000]
    )
  );

  // ---------- DOCUMENT ASSEMBLY ----------
  const doc = new Document({
    creator: "AI PRD Generator",
    title: `PRD \u2014 ${fmt(d.projectName)}`,
    styles: {
      default: { document: { run: { font: FONT, size: 22, color: BLACK } } },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 30, bold: true, font: FONT, color: NAVY },
          paragraph: { spacing: { before: 320, after: 200 }, outlineLevel: 0, keepNext: true, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY, space: 4 } } },
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
            { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } },
            { level: 1, format: LevelFormat.BULLET, text: "\u2013", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 270 } } } },
          ],
        },
        {
          reference: "numbers",
          levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }],
        },
      ],
    },
    sections: [
      {
        properties: { page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN } } },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_LINE, space: 4 } },
                children: [run(`PRD \u2014 ${fmt(d.projectName)}`, { size: 16, color: GREY_TEXT }), run(`\t${companyName}`, { size: 16, color: GREY_TEXT })],
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
                  run("Draf Otomatis AI \u2014 Wajib Direview", { size: 16, color: GREY_TEXT }),
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

  return Packer.toBuffer(doc);
}

module.exports = { renderPRDToDocx };
