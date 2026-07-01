# prd-generator

Modul Node.js untuk menghasilkan PRD (Product Requirements Document) `.docx` secara otomatis menggunakan AI. Dirancang khusus untuk menerjemahkan permintaan customer yang tidak terstruktur, ambigu, atau bercampur bahasa menjadi dokumen PRD profesional siap-distribusi ke 5 peran tim: Full Stack Developer, Admin, Admin Keuangan, Admin Customer Service, dan Super Admin/Pemilik.

---

## Cara Kerja (Arsitektur)

```
intake (rawCustomerRequest + data pesanan)
        │
        ▼
┌──────────────────────────────────────┐
│  Step 1 — aiClient.js                │
│  Kirim ke AI via Structured Outputs  │
│  → dijamin valid JSON (prdSchema.js) │
└──────────────────────────────────────┘
        │  aiDraft (JSON terstruktur)
        ▼
┌──────────────────────────────────────┐
│  Step 2 — generatePRD.js             │
│  Gabungkan aiDraft + data intake     │
│  → satu objek prdData lengkap        │
└──────────────────────────────────────┘
        │  prdData
        ▼
┌──────────────────────────────────────┐
│  Step 3 — prdDocxRenderer.js         │
│  Render ke Word (.docx)              │
│  Desain identik template asli        │
└──────────────────────────────────────┘
        │
        ▼
   Buffer (.docx) → simpan / kirim
```

**Kunci utama**: Step 1 menggunakan **Structured Outputs** (bukan prompt biasa), sehingga AI tidak bisa menghasilkan JSON yang cacat atau field yang hilang. Tidak ada retry/repair logic yang diperlukan.

---

## Struktur File

```
prd-generator/
├── index.js                        ← entry point utama, require dari sini
├── generatePRD.js                  ← orkestrator: panggil AI → render docx
├── prdSchema.js                    ← JSON Schema (kontrak data antara AI & renderer)
├── prdPrompt.js                    ← system prompt + user prompt builder
├── aiClient.js                     ← Claude API (default)
├── aiClient.openai.alternative.js  ← OpenAI API (opsional, swap mudah)
├── prdDocxRenderer.js              ← render JSON → .docx berformat rapi
├── example.js                      ← demo end-to-end, jalankan untuk coba
└── package.json
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Pasang API key provider AI yang Anda pilih
export ANTHROPIC_API_KEY=sk-ant-...   # default (Claude)
# atau
export OPENAI_API_KEY=sk-...          # kalau pakai OpenAI (ganti aiClient dulu)

# 3. Coba demo
node example.js
```

---

## Integrasi ke Project Anda

```js
const { createPRD } = require("./prd-generator");
const fs = require("fs");

const { buffer, prdData } = await createPRD({
  // Data dari sistem intake / form pesanan Anda (semuanya opsional kecuali rawCustomerRequest)
  projectName:      "Website Company Profile - PT Maju Jaya",
  clientName:       "PT Maju Jaya",
  contact:          "0812-3456-7890 / [email protected]",
  channel:          "WhatsApp",        // channel permintaan masuk
  dateReceived:     "01/07/2026",
  projectType:      "Website Company Profile",
  priority:         "Sedang",          // Rendah | Sedang | Tinggi | Mendesak
  deadline:         "3 minggu",
  preparedBy:       "Admin CS - Sinta",
  companyName:      "CV Digital Kreasi", // untuk cover & header dokumen
  customerAttachments: [               // lampiran dari customer, jika ada
    "Referensi desain (tautan Google Drive)",
  ],

  // WAJIB — teks mentah dari customer, apa adanya, tidak perlu diedit dulu
  rawCustomerRequest: `
    halo min, mau buat website kantor kayak yg punya kompetitor gitu,
    yg penting keliatan profesional aja, budget pas2an ya soalnya baru
    mulai usaha. bisa dikerjain ga kira2 3 mingguan?
  `,
});

// Simpan file
fs.writeFileSync(`PRD-${prdData.prdId}.docx`, buffer);

// Atau kirim langsung sebagai response HTTP (Express/Fastify/dll)
// res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
// res.setHeader("Content-Disposition", `attachment; filename="PRD-${prdData.prdId}.docx"`);
// res.send(buffer);

// prdData berisi seluruh data JSON lengkap kalau Anda mau simpan ke database
console.log(prdData.prdId);
console.log(prdData.interpretation.clarifyingQuestions);
```

### Return value `createPRD()`

| Field | Tipe | Keterangan |
|---|---|---|
| `buffer` | `Buffer` | Isi file `.docx`, siap disimpan/dikirim |
| `prdData` | `object` | Seluruh data PRD (known facts + draf AI) — simpan ke DB jika perlu |

---

## Mengganti AI Provider

Default-nya **Claude (Anthropic)**. Kalau Anda ingin pakai **OpenAI**, ubah satu baris di `generatePRD.js`:

```js
// Sebelum
const { interpretCustomerRequest } = require("./aiClient");

// Sesudah
const { interpretCustomerRequest } = require("./aiClient.openai.alternative");
```

Lalu install: `npm install openai` dan set `OPENAI_API_KEY`.

`prdSchema.js` dan `prdPrompt.js` tidak perlu diubah — keduanya tidak terikat ke provider tertentu.

### Menggunakan provider lain (Gemini, Mistral, dll)

Buat file `aiClient.namaProvider.js` dengan ekspor:
```js
async function interpretCustomerRequest(ctx) {
  // panggil API provider Anda, pastikan:
  // 1. Gunakan Structured Outputs / response_format / json_schema sesuai provider
  // 2. Sertakan prdAiOutputSchema dari prdSchema.js sebagai schema
  // 3. Kembalikan objek JS (sudah di-parse dari JSON)
}
module.exports = { interpretCustomerRequest };
```
Lalu swap import-nya di `generatePRD.js`.

---

## Kustomisasi

### Menambah field ke PRD
1. Tambah field ke schema di `prdSchema.js` (pastikan masuk ke `required`, tidak ada `anyOf`)
2. Tambah instruksi pengisian di `prdPrompt.js` (bagian SYSTEM_PROMPT)
3. Render field baru di `prdDocxRenderer.js` (tambah `fieldBlockText` atau `fieldBlockList` di bagian yang relevan)

### Mengubah desain dokumen
Semua warna, font, ukuran halaman, dan gaya tabel ada di konstanta di atas `prdDocxRenderer.js`:
```js
const NAVY = "1F4E79";    // warna heading utama
const BLUE = "2E75B6";    // warna heading 2
const ROLE_COLORS = { dev: "1F4E79", admin: "538135", ... }; // warna badge per peran
```

### PRD ID dari database Anda
Ganti fungsi `autoPrdId()` di `generatePRD.js`, atau cukup pass `prdId` langsung di `intake`:
```js
await createPRD({ prdId: order.id, rawCustomerRequest: ... });
```

### Mengubah model AI
```bash
# Claude
export PRD_AI_MODEL=claude-opus-4-6

# OpenAI (kalau pakai aiClient.openai.alternative.js)
export PRD_AI_MODEL=gpt-5.5
```

---

## Hal-hal yang Sengaja TIDAK Dihasilkan oleh AI

| Bagian Dokumen | Kenapa |
|---|---|
| **Sign-off / tanda tangan** (Bagian 10) | Selalu kosong, diisi manusia setelah review |
| **Riwayat revisi** (Bagian 11) | Dimulai dari satu baris "Draf Otomatis AI v1.0", revisi berikutnya oleh tim |
| **Angka harga final** | AI hanya menulis narasi estimasi awal berlabel "wajib divalidasi Admin Keuangan" — tidak pernah mencetak angka pasti |
| **Tanggal kalender spesifik** | AI menggunakan penanda relatif ("Minggu ke-2") — tanggal riil diisi tim setelah PRD disetujui |

---

## Catatan Penting untuk Tim

- Dokumen yang dihasilkan **SELALU** berlabel "Draf Otomatis AI — Wajib Direview" di footer
- Bagian 3 (Asumsi & Pertanyaan Klarifikasi) adalah output paling kritikal — Admin CS wajib mengecek ini sebelum menjanjikan apapun ke customer
- Seluruh data `prdData` (JSON) juga tersedia untuk disimpan ke database Anda, jadi Anda bisa membangun fitur riwayat PRD, pencarian, atau dashboard tanpa perlu parse ulang dari file Word

---

## Lisensi & Penggunaan

Gunakan bebas untuk project internal Anda. Sesuaikan system prompt, schema, dan renderer sesuai kebutuhan spesifik bisnis Anda.
