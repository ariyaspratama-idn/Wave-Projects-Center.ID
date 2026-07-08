/**
 * prdSchema.js
 * ------------------------------------------------------------------
 * JSON Schema describing the AI-generated part of the PRD.
 * Structured to meet Global Software Engineering Standards.
 */

const stringArray = (description, itemDescription) => ({
  type: "array",
  description,
  items: { type: "string", description: itemDescription || description },
});

const raciValue = {
  type: "string",
  description: 'RACI value for this role. Must be one of: "R", "A", "R/A", "C", "I", or "-".',
};

const prdAiOutputSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "introduction",
    "expectedOutcomes",
    "personas",
    "functionalRequirements",
    "nonFunctionalRequirements",
    "dataFlow",
    "outOfScope",
    "assumptions",
    "crossFunctionalOperations",
    "timeline",
    "risks",
    "suggestedAttachments"
  ],
  properties: {
    introduction: {
      type: "object",
      additionalProperties: false,
      required: ["background", "userProblems", "businessModel"],
      properties: {
        background: { type: "string", description: "Latar belakang proyek dan mengapa ini dibangun (The 'Why')." },
        userProblems: stringArray("Daftar masalah yang ingin dipecahkan.", "Satu rumusan masalah."),
        businessModel: { type: "string", description: "Skema harga/model bisnis (misal: One-Time Development Fee)." },
      },
    },
    expectedOutcomes: {
      type: "object",
      additionalProperties: false,
      required: ["impactEstimates", "keyMetrics"],
      properties: {
        impactEstimates: stringArray("Estimasi dampak/hasil proyek.", "Satu dampak spesifik."),
        keyMetrics: stringArray("Metrik Kesuksesan (Uptime, Adopsi Pengguna, Efisiensi).", "Satu metrik."),
      },
    },
    personas: {
      type: "array",
      description: "Daftar pengguna (aktor) yang akan mengoperasikan sistem beserta batasan hak aksesnya.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["role", "description", "objective"],
        properties: {
          role: { type: "string", description: "Nama Peran / Aktor (mis. Super Admin, Calon Pendaftar)." },
          description: { type: "string", description: "Deskripsi karakter & tanggung jawab." },
          objective: { type: "string", description: "Tujuan Utama Penggunaan Sistem." },
        }
      }
    },
    functionalRequirements: {
      type: "array",
      description: "Daftar fitur utama skala besar (Epic Level) beserta logika alur data secara runut.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["epicName", "description", "validationRules"],
        properties: {
          epicName: { type: "string", description: "Nama modul/epic." },
          description: { type: "string", description: "Deskripsi fitur secara konkrit." },
          validationRules: stringArray("Aturan validasi/bisnis logika.", "Satu aturan validasi."),
        }
      }
    },
    nonFunctionalRequirements: {
      type: "object",
      additionalProperties: false,
      required: ["performance", "security", "uiux", "architecturePhilosophy"],
      properties: {
        performance: stringArray("Beban maksimal, kecepatan halaman, availability.", "Satu kriteria performa."),
        security: stringArray("HTTPS, Firewall, Enkripsi, Backup.", "Satu standar keamanan."),
        uiux: stringArray("Tema, responsivitas, pedoman antarmuka.", "Satu panduan UI/UX."),
        architecturePhilosophy: { type: "string", description: "Penjelasan arsitektur (misal Self-Hosted First, Cloud-Native, dll)." },
      }
    },
    dataFlow: {
      type: "array",
      description: "Langkah-langkah berjalannya data secara kronologis (alur logika utama).",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["stepOrder", "description"],
        properties: {
          stepOrder: { type: "string", description: "Nomor/Urutan langkah (misal '1')." },
          description: { type: "string", description: "Penjelasan langkah data." },
        }
      }
    },
    outOfScope: stringArray(
      "Batasan ruang lingkup proyek. Hal yang TIDAK termasuk.",
      "Satu batasan scope."
    ),
    assumptions: stringArray(
      "Asumsi teknis dan ketergantungan hardware/API yang disepakati.",
      "Satu asumsi."
    ),
    crossFunctionalOperations: {
      type: "object",
      description: "Koordinasi lintas divisi agen internal (Tugas, RACI).",
      additionalProperties: false,
      required: ["raci", "admin", "finance", "cs", "owner"],
      properties: {
        raci: {
          type: "array",
          description: "Matriks RACI (Responsible, Accountable, Consulted, Informed) lintas divisi.",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["activity", "dev", "admin", "finance", "cs", "owner"],
            properties: {
              activity: { type: "string", description: "Satu deliverable." },
              dev: raciValue,
              admin: raciValue,
              finance: raciValue,
              cs: raciValue,
              owner: raciValue,
            },
          },
        },
        admin: {
          type: "object",
          additionalProperties: false,
          required: ["tasks", "resources"],
          properties: {
            tasks: stringArray("Rincian tugas operasional internal.", "Satu tugas."),
            resources: stringArray("Alat/Akses yang dibutuhkan.", "Satu resource."),
          },
        },
        finance: {
          type: "object",
          additionalProperties: false,
          required: ["budgetEstimateNotes", "paymentTermsSuggestion", "invoiceItems"],
          properties: {
            budgetEstimateNotes: { type: "string", description: "Draf estimasi biaya/skema (wajib tervalidasi admin keuangan)." },
            paymentTermsSuggestion: { type: "string", description: "Saran termin pembayaran (DP, dsb)." },
            invoiceItems: stringArray("Rincian item tagihan (software, server, layanan).", "Satu item tagihan."),
          },
        },
        cs: {
          type: "object",
          additionalProperties: false,
          required: ["communicationPlan", "customerExpectations", "faq"],
          properties: {
            communicationPlan: { type: "string", description: "Metode & frekuensi laporan (misal via RM, Trello)." },
            customerExpectations: stringArray("Ekspektasi klien yang harus dikelola.", "Satu ekspektasi."),
            faq: stringArray("FAQ Antisipatif proyek ini.", "Satu pertanyaan+jawaban."),
          },
        },
        owner: {
          type: "object",
          additionalProperties: false,
          required: ["strategicAlignment", "riskAssessment", "decisionNotes"],
          properties: {
            strategicAlignment: { type: "string", description: "Keselarasan proyek dengan bisnis." },
            riskAssessment: { type: "string", description: "Asesmen urgensi & investasi." },
            decisionNotes: { type: "string", description: "Catatan khusus pemutus final." },
          },
        }
      }
    },
    timeline: {
      type: "array",
      description: "Milestone dan estimasi waktu.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["milestone", "pic", "targetDateNote"],
        properties: {
          milestone: { type: "string" },
          pic: { type: "string" },
          targetDateNote: { type: "string", description: "Waktu relatif (misal: 'Minggu ke-1')." },
        },
      }
    },
    risks: {
      type: "array",
      description: "Risiko spesifik pengerjaan.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["risk", "impact", "mitigation", "pic"],
        properties: {
          risk: { type: "string" },
          impact: { type: "string" },
          mitigation: { type: "string" },
          pic: { type: "string" },
        }
      }
    },
    suggestedAttachments: stringArray("Dokumen referensi.", "Satu saran dokumen."),
  }
};

module.exports = { prdAiOutputSchema };
