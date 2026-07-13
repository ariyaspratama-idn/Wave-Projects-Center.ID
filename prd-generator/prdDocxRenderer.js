/**
 * prdDocxRenderer.js
 * ------------------------------------------------------------------
 * Renders the new Global Standard PRD structure into a .docx Buffer.
 */

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType, VerticalAlign,
  PageNumber, PageBreak, TabStopType, TabStopPosition,
} = require("docx");

const FONT = "Arial";
const NAVY = "1F4E79";
const BLUE = "2E75B6";
const GREY_TEXT = "595959";
const LIGHT_LINE = "B4C6E7";
const STRIPE = "F2F6FC";
const BLACK = "000000";
const WHITE = "FFFFFF";

const PAGE_W = 11906;
const PAGE_H = 16838;
const MARGIN = 1440;
const CONTENT_W = PAGE_W - MARGIN * 2;

const FALLBACK = "[belum diisi]";
const EMPTY_NOTE = "(Tidak ada / tidak relevan untuk permintaan ini)";

const fmt = (v) => (v === undefined || v === null ? FALLBACK : String(v));

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

function fieldBlockList(label, items) {
  const out = [fieldLabel(label)];
  if (!items || items.length === 0) {
    out.push(bulletItem(EMPTY_NOTE, { italics: true, color: GREY_TEXT }));
  } else {
    items.forEach((it) => out.push(bulletItem(fmt(it))));
  }
  return out;
}

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

const raciCols = ["Dev", "Admin", "Admin Keuangan", "Admin CS", "Super Admin"];

async function renderPRDToDocx(prdData) {
  const d = prdData || {};
  const intro = d.introduction || {};
  const outcomes = d.expectedOutcomes || {};
  const personas = d.personas || [];
  const funcs = d.functionalRequirements || [];
  const nonfuncs = d.nonFunctionalRequirements || {};
  const df = d.dataFlow || [];
  const outOfScope = d.outOfScope || [];
  const assumptions = d.assumptions || [];
  const cross = d.crossFunctionalOperations || {};
  const raci = cross.raci || [];
  const cAdmin = cross.admin || {};
  const cFinance = cross.finance || {};
  const cCS = cross.cs || {};
  const cOwner = cross.owner || {};
  const timeline = d.timeline || [];
  const risks = d.risks || [];
  const attachments = d.suggestedAttachments || [];
  const analytics = d.analyticsAndConversion || {};
  const dataPrivacy = d.dataPrivacy || [];
  const dr = d.drAndBackup || {};
  const ac = d.acceptanceCriteria || [];
  const sla = d.slaPascaGoLive || [];
  const glossary = d.glossary || [];

  const companyName = d.companyName || "Wave Projects Center.ID";
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
      ["Versi Dokumen", d.version || "v1.0 (Standar Industri)"],
      ["Status Dokumen", d.status || "Draft \u2014 menunggu persetujuan"],
      ["Disusun Oleh", d.preparedBy || "AI System Architect"],
      ["Disetujui Oleh", d.approvedBy],
    ]),
    new Paragraph({ spacing: { before: 400 }, children: [] }),
    noteBox("Dokumen ini mengikuti standar pengembangan perangkat lunak (Global Standard SW Engineering). Dihasilkan secara otomatis namun memuat logika dan arsitektur spesifik yang mengikat."),
    pageBreak()
  );

  // ============ DAFTAR ISI ============
  children.push(
    heading1("Daftar Isi"),
    tocItem("1. Pendahuluan & Latar Belakang"),
    tocItem("2. Permintaan Asli Customer"),
    tocItem("3. Target & Ekspektasi Hasil"),
    tocItem("4. Profil Pengguna (Personas)"),
    tocItem("5. Kebutuhan Fungsional (Core Engine)"),
    tocItem("6. Kebutuhan Non-Fungsional & Arsitektur"),
    tocItem("7. Alur Data (Data Flow)"),
    tocItem("8. Batasan Proyek & Asumsi (Out of Scope)"),
    tocItem("9. Operasional Lintas Divisi"),
    tocItem("10. Timeline & Risiko"),
    tocItem("11. Analytics & Conversion Tracking"),
    tocItem("12. Kepatuhan Data Pribadi (UU PDP)"),
    tocItem("13. Backup & Disaster Recovery"),
    tocItem("14. Acceptance Criteria (DoD)"),
    tocItem("15. SLA Dukungan Pasca Go-Live"),
    tocItem("16. Glossary / Daftar Istilah"),
    tocItem("17. Persetujuan & Tanda Tangan"),
    pageBreak()
  );

  // ============ BAGIAN 1 ============
  children.push(
    heading1("1. Pendahuluan & Latar Belakang (The \"Why\")"),
    ...fieldBlockText("Latar Belakang Proyek", intro.background),
    ...fieldBlockList("Masalah Pengguna & Kebutuhan Pasar", intro.userProblems),
    ...fieldBlockText("Model Bisnis & Skema Harga", intro.businessModel)
  );

  // ============ BAGIAN 2 ============
  children.push(
    heading1("2. Permintaan Asli dari Customer (Verbatim)"),
    fieldLabel("Isi Permintaan:"),
    textBox(d.rawCustomerRequest),
    fieldLabel("Dokumen/Lampiran:"),
    ...(d.customerAttachments && d.customerAttachments.length
      ? d.customerAttachments.map((a) => bulletItem(fmt(a)))
      : [bulletItem(EMPTY_NOTE, { italics: true, color: GREY_TEXT })])
  );

  // ============ BAGIAN 3 ============
  children.push(
    heading1("3. Hasil yang Diharapkan & Metrik Utama"),
    ...fieldBlockList("Estimasi Hasil Dampak", outcomes.impactEstimates),
    ...fieldBlockList("Metrik Kesuksesan (Key Metrics)", outcomes.keyMetrics)
  );

  // ============ BAGIAN 4 ============
  children.push(
    heading1("4. Profil Pengguna (Personas)"),
    dataTable(
      ["Peran / Aktor", "Karakter & Tanggung Jawab", "Tujuan Utama (Objective)"],
      personas.map(p => [p.role, p.description, p.objective]),
      [2500, 3500, 3026]
    ),
    new Paragraph({ spacing: { after: 200 } })
  );

  // ============ BAGIAN 5 ============
  children.push(
    heading1("5. Kebutuhan Fungsional (Core Engine Requirements)"),
    para("Di bawah ini adalah penjelasan modul-modul skala besar beserta logika dan aturan sistem."),
    ...(funcs.map(f => {
      const b1 = fieldBlockText(`Modul/Epic: ${f.epicName}`, f.description);
      const b2 = fieldBlockList("Aturan Validasi:", f.validationRules);
      return [...b1, ...b2, new Paragraph({ spacing: { after: 200 } })];
    }).flat())
  );

  // ============ BAGIAN 6 ============
  children.push(
    heading1("6. Kebutuhan Non-Fungsional & Arsitektur"),
    ...fieldBlockText("Filosofi Arsitektur (Technical Direction)", nonfuncs.architecturePhilosophy),
    ...fieldBlockList("Performa & Beban Sistem", nonfuncs.performance),
    ...fieldBlockList("Keamanan Jaringan & Data", nonfuncs.security),
    ...fieldBlockList("Tampilan (UI/UX)", nonfuncs.uiux)
  );

  // ============ BAGIAN 7 ============
  children.push(
    heading1("7. Alur Data Utama (Data Flow)"),
    dataTable(
      ["Langkah", "Deskripsi Proses Berjalannya Data"],
      df.map(d => [d.stepOrder, d.description]),
      [1500, 7526]
    ),
    pageBreak()
  );

  // ============ BAGIAN 8 ============
  children.push(
    heading1("8. Batasan Luar Ruang Lingkup (Out of Scope) & Asumsi"),
    ...fieldBlockList("Batasan Proyek (Hanya in-scope yang dikerjakan)", outOfScope),
    ...fieldBlockList("Asumsi & Ketergantungan", assumptions)
  );

  // ============ BAGIAN 9 ============
  children.push(
    heading1("9. Koordinasi & Operasional Lintas Divisi (Internal)"),
    heading2("9.1 Matriks RACI"),
    dataTable(
      ["Aktivitas / Deliverable", ...raciCols],
      raci.map(r => [r.activity, r.dev, r.admin, r.finance, r.cs, r.owner]),
      [3026, 1200, 1200, 1200, 1200, 1200],
      { headerAlign: AlignmentType.CENTER, cellAlign: [AlignmentType.LEFT, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER] }
    ),
    heading2("9.2 Operasional Admin"),
    ...fieldBlockList("Tugas: ", cAdmin.tasks),
    ...fieldBlockList("Resouces/Kebutuhan: ", cAdmin.resources),
    heading2("9.3 Skema Keuangan (Draf Kasar)"),
    ...fieldBlockText("Estimasi Biaya: ", cFinance.budgetEstimateNotes),
    ...fieldBlockText("Termin Pembayaran: ", cFinance.paymentTermsSuggestion),
    ...fieldBlockList("Tagihan/Item Invoice: ", cFinance.invoiceItems),
    heading2("9.4 Pendekatan Customer Service"),
    ...fieldBlockText("Rencana Komunikasi: ", cCS.communicationPlan),
    ...fieldBlockList("Manajemen Ekspektasi: ", cCS.customerExpectations),
    ...fieldBlockList("FAQ: ", cCS.faq),
    heading2("9.5 Strategic Owner / Super Admin"),
    ...fieldBlockText("Keselarasan Arah Bisnis: ", cOwner.strategicAlignment),
    ...fieldBlockText("Penilaian Risiko Pemilik: ", cOwner.riskAssessment),
    ...fieldBlockText("Catatan Keputusan: ", cOwner.decisionNotes),
    pageBreak()
  );

  // ============ BAGIAN 10 ============
  children.push(
    heading1("10. Timeline & Risiko Proyek"),
    heading2("Timeline & Target Kerangka Waktu"),
    dataTable(
      ["Milestone", "Penanggung Jawab (PIC)", "Target Waktu"],
      timeline.map(t => [t.milestone, t.pic, t.targetDateNote]),
      [4026, 3000, 2000]
    ),
    heading2("Manajemen Risiko"),
    dataTable(
      ["Risiko", "Dampak", "Mitigasi", "PIC"],
      risks.map(r => [r.risk, r.impact, r.mitigation, r.pic]),
      [2526, 2000, 3000, 1500]
    )
  );

  // ============ BAGIAN 11 ============
  children.push(
    heading1("11. Analytics & Conversion Tracking"),
    ...fieldBlockList("Metrik Pelacakan", analytics.metrics),
    ...fieldBlockText("Catatan Integrasi Analytics", analytics.notes),
    pageBreak()
  );

  // ============ BAGIAN 12 ============
  children.push(
    heading1("12. Kepatuhan Data Pribadi (UU PDP)"),
    dataTable(
      ["Persyaratan", "Status", "PIC"],
      dataPrivacy.map(p => [p.requirement, p.status, p.pic]),
      [5000, 2000, 2026]
    ),
    pageBreak()
  );

  // ============ BAGIAN 13 ============
  children.push(
    heading1("13. Backup & Disaster Recovery"),
    heading2("Strategi Backup"),
    dataTable(
      ["Komponen", "Strategi", "Frekuensi", "RTO", "RPO"],
      (dr.strategies || []).map(s => [s.component, s.strategy, s.frequency, s.rto, s.rpo]),
      [2000, 3000, 1500, 1000, 1526]
    ),
    heading2("Prosedur Recovery"),
    ...fieldBlockList("Langkah-Langkah DR", dr.procedure),
    pageBreak()
  );

  // ============ BAGIAN 14 ============
  children.push(
    heading1("14. Acceptance Criteria (Definition of Done)"),
    ...fieldBlockList("Kriteria Penerimaan per User Story", ac),
    pageBreak()
  );

  // ============ BAGIAN 15 ============
  children.push(
    heading1("15. SLA Dukungan Pasca Go-Live"),
    dataTable(
      ["Kategori", "Durasi", "Response Time", "PIC"],
      sla.map(s => [s.category, s.duration, s.response_time, s.pic]),
      [2500, 2500, 2500, 1526]
    ),
    pageBreak()
  );

  // ============ BAGIAN 16 ============
  children.push(
    heading1("16. Glossary / Daftar Istilah"),
    dataTable(
      ["Istilah", "Definisi"],
      glossary.map(g => [g.term, g.definition]),
      [2500, 6526]
    ),
    pageBreak()
  );

  // ============ BAGIAN 17 ============
  children.push(
    heading1("17. Persetujuan & Lembar Pengesahan (Sign-Off)"),
    para("Dokumen ini dianggap berlaku sebagai kontrak pengerjaan internal setelah seluruh form ini disetujui."),
    dataTable(
      ["Jabatan / Peran", "Nama", "Tanda Tangan", "Tanggal Persetujuan"],
      [
        ["Full Stack Developer", "[Nama]", "", "[tgl]"],
        ["Admin", "[Nama]", "", "[tgl]"],
        ["Admin Keuangan", "[Nama]", "", "[tgl]"],
        ["Admin Customer Service", "[Nama]", "", "[tgl]"],
        ["Super Admin / Pemilik", "[Nama]", "", "[tgl]"],
        ["Customer (Klien)", d.clientName || "[Nama/Instansi]", "", "[tgl]"],
      ],
      [2826, 2300, 2200, 1700]
    ),
    pageBreak()
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
          ],
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
                  run("Wave Projects Center - Standar Global Software PRD", { size: 16, color: GREY_TEXT }),
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
