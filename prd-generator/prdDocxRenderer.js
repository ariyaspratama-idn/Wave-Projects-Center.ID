/**
 * prdDocxRenderer.js
 * ------------------------------------------------------------------
 * Renders the new 27-Section Global Standard PRD structure into a .docx Buffer.
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

const FALLBACK = "[belum diisi / N/A]";
const EMPTY_NOTE = "(Tidak ada / tidak relevan untuk permintaan ini)";

const fmt = (v) => (v === undefined || v === null ? FALLBACK : String(v));

function run(text, opts = {}) {
  return new TextRun({ text: text === undefined || text === null ? "" : String(text), font: FONT, size: opts.size || 22, bold: opts.bold || false, italics: opts.italics || false, color: opts.color || BLACK });
}

function para(text, opts = {}) {
  return new Paragraph({ spacing: { before: opts.before || 0, after: opts.after || 120 }, alignment: opts.align || AlignmentType.LEFT, children: [run(text, opts)] });
}

function heading1(text) { return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [run(text)] }); }
function heading2(text) { return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [run(text)] }); }

function bulletItem(text, opts = {}) {
  return new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [run(text, { italics: opts.italics || false, color: opts.color || BLACK, size: 21 })] });
}

function fieldLabel(text) {
  return new Paragraph({ spacing: { before: 160, after: 40 }, children: [run(text, { bold: true, size: 22, color: NAVY })] });
}

function fieldBlockList(label, items) {
  const out = [fieldLabel(label)];
  if (!items || items.length === 0) out.push(bulletItem(EMPTY_NOTE, { italics: true, color: GREY_TEXT }));
  else items.forEach((it) => out.push(bulletItem(fmt(it))));
  return out;
}

function fieldBlockText(label, text) {
  return [fieldLabel(label), para(fmt(text), { color: BLACK, size: 22 })];
}

function pageBreak() { return new Paragraph({ children: [new PageBreak()] }); }

function tocItem(text, level = 0) {
  return new Paragraph({ numbering: { reference: "bullets", level }, spacing: { after: 70 }, children: [run(text, { color: BLACK, size: 22, bold: level === 0 })] });
}

function tableCell(text, { width, bold = false, color = BLACK, fill, align = AlignmentType.LEFT, size = 19 }) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: LIGHT_LINE };
  const borders = { top: border, bottom: border, left: border, right: border };
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA }, shading: fill ? { fill, type: ShadingType.CLEAR } : undefined, margins: { top: 90, bottom: 90, left: 120, right: 120 }, verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: align, children: [run(text, { bold, color, size })] })],
  });
}

function dataTable(headers, rows, colWidths, opts = {}) {
  const headerCells = headers.map((h, i) => tableCell(h, { width: colWidths[i], bold: true, color: WHITE, fill: NAVY, align: opts.headerAlign || AlignmentType.CENTER, size: 19 }));
  const trows = [new TableRow({ children: headerCells, tableHeader: true })];
  if (!rows || rows.length === 0) {
    trows.push(new TableRow({ children: [tableCell(EMPTY_NOTE, { width: colWidths.reduce((a, b) => a + b, 0), color: GREY_TEXT })] }));
  } else {
    rows.forEach((r, idx) => {
      const fill = idx % 2 === 1 ? STRIPE : undefined;
      const cells = r.map((val, i) => tableCell(fmt(val), { width: colWidths[i], fill, align: opts.cellAlign && opts.cellAlign[i] ? opts.cellAlign[i] : AlignmentType.LEFT }));
      trows.push(new TableRow({ children: cells }));
    });
  }
  return new Table({ width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: colWidths, rows: trows });
}

function formTable(rowsData) {
  const colWidths = [2700, CONTENT_W - 2700];
  const trows = rowsData.map((r) => new TableRow({ children: [tableCell(r[0], { width: colWidths[0], bold: true, fill: "EEF3FA", color: NAVY, size: 20 }), tableCell(fmt(r[1]), { width: colWidths[1], color: BLACK, size: 20 })] }));
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: colWidths, rows: trows });
}

function noteBox(text) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
    rows: [new TableRow({ children: [new TableCell({ borders: { top: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_LINE }, bottom: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_LINE }, left: { style: BorderStyle.SINGLE, size: 4, color: BLUE }, right: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_LINE } }, shading: { fill: "F2F6FC", type: ShadingType.CLEAR }, width: { size: CONTENT_W, type: WidthType.DXA }, margins: { top: 140, bottom: 140, left: 200, right: 200 }, children: [new Paragraph({ children: [run(text, { italics: true, color: GREY_TEXT, size: 20 })] })] })] })],
  });
}

function textBox(text) {
  const lines = String(text || "").split(/\n+/).filter((l) => l.trim() !== "");
  const paras = lines.length ? lines.map((line) => new Paragraph({ spacing: { after: 100 }, children: [run(line.trim(), { size: 21 })] })) : [new Paragraph({ children: [run(FALLBACK, { size: 21, color: GREY_TEXT, italics: true })] })];
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
    rows: [new TableRow({ children: [new TableCell({ borders: { top: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_LINE }, bottom: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_LINE }, left: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_LINE }, right: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_LINE } }, width: { size: CONTENT_W, type: WidthType.DXA }, margins: { top: 160, bottom: 160, left: 200, right: 200 }, children: paras })] })],
  });
}

async function renderPRDToDocx(prdData) {
  const d = prdData || {};
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
      ["Nomor Dokumen", d.prdId || "PRD-XXX"],
      ["Nama Proyek", d.projectName],
      ["Klien", d.clientName],
      ["Tanggal", dateCreated],
      ["Versi Dokumen", "v2.0 (27 Sections Standard)"],
      ["Status Dokumen", "Draft \u2014 menunggu persetujuan"],
    ]),
    new Paragraph({ spacing: { before: 400 }, children: [] }),
    noteBox("Dokumen ini memuat standar wajib 27 Bagian Ekosistem Wave Projects Center. Dihasilkan secara otonom namun memiliki legalitas mengikat."),
    pageBreak()
  );

  // ============ DAFTAR ISI ============
  const tocSections = [
    "Pendahuluan & Ringkasan", "Goals & Metrik Terukur (OKR)", "Functional Requirements",
    "Non-Functional Requirements", "User Stories", "Scope & Batasan",
    "Arsitektur Sistem & Data Flow", "Schema Database", "API Specification",
    "UI/UX & Design Guidelines", "Pemetaan Akses per Role", "Integrasi Pihak Ketiga",
    "SEO & Performance Optimization", "Testing Strategy", "Deployment Strategy",
    "DevOps & Monitoring", "Security Checklist", "Estimasi Biaya & Pembayaran",
    "Komunikasi & Kolaborasi", "Timeline & Manajemen Risiko", "Persetujuan & Tanda Tangan",
    "Analytics & Tracking", "Kepatuhan Data Pribadi (UU PDP)", "Backup & Disaster Recovery",
    "Acceptance Criteria", "SLA Pasca Go-Live", "Glossary / Daftar Istilah"
  ];
  children.push(
    heading1("Daftar Isi"),
    ...tocSections.map((title, i) => tocItem(`${i + 1}. ${title}`, 0)),
    pageBreak()
  );

  // 1. PENDAHULUAN
  const s1 = d.pendahuluan || {};
  children.push(heading1("1. Pendahuluan & Ringkasan"), ...fieldBlockText("Nama Proyek", s1.projectName), ...fieldBlockText("Info Klien", s1.clientInfo), ...fieldBlockText("Overview", s1.overview));

  // 2. OKR
  const o2 = d.okr || [];
  children.push(heading1("2. Goals & Metrik Terukur (OKR)"), dataTable(["Objective", "Key Result", "Target"], o2.map(x => [x.objective, x.keyResult, x.target]), [3026, 3000, 2000]));

  // 3. Functional Requirements
  const o3 = d.functionalRequirements || [];
  children.push(heading1("3. Functional Requirements"), dataTable(["ID", "Fitur", "PIC", "Prioritas"], o3.map(x => [x.id, x.feature, x.pic, x.priority]), [1000, 4526, 1500, 1000]));

  // 4. Non-Functional
  const s4 = d.nonFunctionalRequirements || {};
  children.push(heading1("4. Non-Functional Requirements"), ...fieldBlockText("Performance", s4.performance), ...fieldBlockText("Keamanan", s4.security), ...fieldBlockText("Skalabilitas", s4.scalability), ...fieldBlockText("Aksesibilitas", s4.accessibility));

  // 5. User Stories
  children.push(heading1("5. User Stories"), ...fieldBlockList("Daftar Aksi Pengguna", d.userStories || []));

  // 6. Scope & Batasan
  const s6 = d.scopeBatasan || {};
  children.push(heading1("6. Scope & Batasan"), ...fieldBlockList("TERMASUK (In-Scope)", s6.inScope || []), ...fieldBlockList("TIDAK TERMASUK (Out-of-Scope)", s6.outOfScope || []), pageBreak());

  // 7. Arsitektur Sistem
  const s7 = d.arsitekturSistem || {};
  children.push(
    heading1("7. Arsitektur Sistem & Data Flow"),
    ...fieldBlockList("Data Flow", s7.dataFlow || []),
    ...fieldBlockText("Tech Stack", s7.techStack),
    ...fieldBlockText("Struktur Folder (Rekomendasi Mutlak)", s7.folderStructure),
    ...fieldBlockText("Core Pseudocode & Logika Inti", s7.corePseudocode)
  );

  // 8. Schema Database
  const o8 = d.schemaDatabase || [];
  children.push(heading1("8. Schema Database"), dataTable(["Table", "Kolom", "Relasi", "Index"], o8.map(x => [x.table, x.columns, x.relations, x.index]), [2000, 3026, 1800, 1200]), pageBreak());

  // 9. API Specs
  const o9 = d.apiSpecification || [];
  children.push(heading1("9. API Specification"));
  if (o9.length > 0) {
    children.push(dataTable(["Modul", "Method & Path", "Body", "Response", "Auth"], o9.map(x => [x.module, x.method + " " + x.path, x.body, x.response, x.auth]), [1500, 2526, 1500, 1500, 1000]));
    o9.forEach(api => {
      if (api.requestPayloadExample || api.responsePayloadExample) {
        children.push(...fieldBlockText(`Contoh Request & Response: [${api.method}] ${api.path}`, `Request Payload:\n${api.requestPayloadExample || 'Tidak ada'}\n\nResponse Payload:\n${api.responsePayloadExample || 'Tidak ada'}`));
      }
    });
  }
  children.push(pageBreak());

  // 10. UI/UX
  const s10 = d.uiUxGuidelines || {};
  children.push(heading1("10. UI/UX & Design Guidelines"), ...fieldBlockText("Color Palette", s10.colorPalette), ...fieldBlockText("Tipografi", s10.typography), ...fieldBlockText("Layout", s10.layout), ...fieldBlockText("Responsivitas", s10.responsiveness));

  // 11. Role Access
  const o11 = d.roleAccessMapping || [];
  children.push(heading1("11. Pemetaan Akses per Role"), dataTable(["Role", "Fitur", "Hak Akses (CRUD)"], o11.map(x => [x.role, x.feature, x.crudPermissions]), [2500, 3526, 2000]), pageBreak());

  // 12. Integrasi ke-3
  const o12 = d.thirdPartyIntegrations || [];
  children.push(heading1("12. Integrasi Pihak Ketiga"), dataTable(["Layanan", "Provider", "Tujuan"], o12.map(x => [x.service, x.provider, x.purpose]), [2500, 2500, 3026]));

  // 13. SEO
  const s13 = d.seoAndPerformance || {};
  children.push(heading1("13. SEO & Performance Optimization"), ...fieldBlockText("Meta & OG", s13.metaTags + " / " + s13.openGraph), ...fieldBlockText("Optimization Strategy", s13.optimizationStrategy));

  // 14. Testing
  const s14 = d.testingStrategy || {};
  children.push(heading1("14. Testing Strategy"), ...fieldBlockText("Unit & Integration", s14.unitTest + " \n " + s14.integrationTest), ...fieldBlockText("UAT & Browser", s14.uat + " \n " + s14.browserMatrix), pageBreak());

  // 15. Deployment
  const s15 = d.deploymentStrategy || {};
  children.push(heading1("15. Deployment Strategy"), ...fieldBlockText("Environtment", s15.environment), ...fieldBlockText("CI/CD Pipeline", s15.cicdPipeline), ...fieldBlockText("Domain Config", s15.domainConfig));

  // 16. DevOps Monitoring
  const s16 = d.devOpsMonitoring || {};
  children.push(heading1("16. DevOps & Monitoring"), ...fieldBlockText("Logging & Error Tracking", s16.logging + " / " + s16.errorTracking), ...fieldBlockText("Uptime Alerting", s16.uptimeAlerting));

  // 17. Security
  children.push(heading1("17. Security Checklist"), ...fieldBlockList("Checklist", d.securityChecklist || []), pageBreak());

  // 18. Estimasi Biaya
  const s18 = d.estimasiBiaya || {};
  children.push(heading1("18. Estimasi Biaya & Pembayaran"), ...fieldBlockList("Breakdown Biaya", s18.costBreakdown || []), ...fieldBlockText("Pembayaran & Jadwal", s18.paymentMethod + " - " + s18.schedule));

  // 19. Komunikasi
  const s19 = d.komunikasiKolaborasi || {};
  children.push(heading1("19. Komunikasi & Kolaborasi"), ...fieldBlockText("Tools", s19.tools), ...fieldBlockText("Frekuensi", s19.frequency), ...fieldBlockList("PIC", s19.pics || []), pageBreak());

  // 20. Timeline & Risiko
  const s20 = d.timelineRisiko || {};
  children.push(heading1("20. Timeline & Manajemen Risiko"), ...fieldBlockList("Milestones", s20.ganttMilestones || []), ...fieldBlockList("Risiko & Mitigasi", s20.risks || []));

  // 21. Sign-Off
  const o21 = d.persetujuanSignOff || [];
  children.push(heading1("21. Persetujuan & Tanda Tangan"), dataTable(["Role", "Nama", "Tanggal"], o21.map(x => [x.role, x.name, x.date]), [3000, 3000, 2026]), pageBreak());

  // 22. Analytics Tracking
  const s22 = d.analyticsTracking || {};
  children.push(heading1("22. Analytics & Tracking"), ...fieldBlockList("Metrics", s22.metrics || []), ...fieldBlockText("Tools", s22.tools));

  // 23. Kepatuhan Data (PDP)
  const o23 = d.kepatuhanDataPDP || [];
  children.push(heading1("23. Kepatuhan Data Pribadi (UU PDP)"), dataTable(["Item", "Deskripsi", "Status Kepatuhan"], o23.map(x => [x.item, x.description, x.compliance]), [2000, 4026, 2000]), pageBreak());

  // 24. Backup DR
  const s24 = d.backupDisasterRecovery || {};
  children.push(heading1("24. Backup & Disaster Recovery"), ...fieldBlockList("RTO & RPO", s24.rtoRpo || []), ...fieldBlockList("Prosedur Recovery", s24.drProcedures || []), pageBreak());

  // 25. Acceptance Criteria
  children.push(heading1("25. Acceptance Criteria"), ...fieldBlockList("Definition of Done", d.acceptanceCriteria || []));

  // 26. SLA Dukungan
  const o26 = d.slaDukungan || [];
  children.push(heading1("26. SLA Pasca Go-Live"), dataTable(["Tier / Kategori", "Durasi", "Deskripsi"], o26.map(x => [x.tier, x.duration, x.description]), [2000, 2000, 4026]), pageBreak());

  // 27. Glossary
  const o27 = d.glossary || [];
  children.push(heading1("27. Glossary / Daftar Istilah"), dataTable(["Istilah", "Definisi"], o27.map(x => [x.term, x.meaning]), [2500, 5526]));


  // ---------- DOCUMENT ASSEMBLY ----------
  const doc = new Document({
    creator: "AI PRD Generator", title: `PRD \u2014 ${fmt(d.projectName)}`,
    styles: {
      default: { document: { run: { font: FONT, size: 22, color: BLACK } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 30, bold: true, font: FONT, color: NAVY }, paragraph: { spacing: { before: 320, after: 200 }, outlineLevel: 0, keepNext: true, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY, space: 4 } } } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 25, bold: true, font: FONT, color: BLUE }, paragraph: { spacing: { before: 260, after: 140 }, outlineLevel: 1, keepNext: true } },
      ],
    },
    numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] }] },
    sections: [
      {
        properties: { page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN } } },
        headers: { default: new Header({ children: [new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }], border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_LINE, space: 4 } }, children: [run(`PRD \u2014 ${fmt(d.projectName)}`, { size: 16, color: GREY_TEXT }), run(`\t${companyName}`, { size: 16, color: GREY_TEXT })] })] }) },
        footers: { default: new Footer({ children: [new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }], children: [run("Wave Projects Center - Standar 27 Bagian PRD", { size: 16, color: GREY_TEXT }), new TextRun({ text: "\tHalaman ", font: FONT, size: 16, color: GREY_TEXT }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: GREY_TEXT }), new TextRun({ text: " / ", font: FONT, size: 16, color: GREY_TEXT }), new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: GREY_TEXT })] })] }) },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

module.exports = { renderPRDToDocx };
