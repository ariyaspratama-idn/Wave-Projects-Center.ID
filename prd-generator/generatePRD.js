/**
 * generatePRD.js
 * ------------------------------------------------------------------
 * Main entry point. This is the one function most of your project
 * will actually call.
 *
 *   const { createPRD } = require("./prd-generator");
 *
 *   const { buffer, prdData } = await createPRD({
 *     projectName: "Website company profile PT Maju Jaya",
 *     clientName: "PT Maju Jaya",
 *     contact: "081234567890 / [email protected]",
 *     channel: "WhatsApp",
 *     projectType: "Website company profile",
 *     priority: "Sedang",
 *     deadline: "3 minggu",
 *     preparedBy: "Admin CS - Sinta",
 *     rawCustomerRequest: "halo min, mau buat website kantor kayak yg punya kompetitor gitu, yg penting keliatan profesional aja, budget pas2an ya soalnya baru mulai",
 *   });
 *
 *   fs.writeFileSync("prd-output.docx", buffer);
 *
 * To swap AI providers, change the require() below — nothing else in
 * this file needs to change.
 */

const { interpretCustomerRequest } = require("./aiClient");
// const { interpretCustomerRequest } = require("./aiClient.openai.alternative"); // <-- alternatif

const { renderPRDToDocx } = require("./prdDocxRenderer");

let counter = 0;
function autoPrdId() {
  const year = new Date().getFullYear();
  counter += 1;
  const seq = String(counter).padStart(3, "0");
  return `PRD-${year}-${seq}`;
  // Catatan: counter ini hanya bertahan selama proses berjalan (in-memory).
  // Di project nyata, ganti dengan ID dari database/sistem pemesanan Anda
  // (auto-increment, UUID, atau nomor order yang sudah ada) supaya unik
  // dan konsisten meskipun server restart.
}

/**
 * @param {object} intake
 * @param {string} intake.rawCustomerRequest - WAJIB. Teks permintaan asli dari customer, apa adanya.
 * @param {string} [intake.projectName]
 * @param {string} [intake.clientName]
 * @param {string} [intake.contact]
 * @param {string} [intake.channel] - mis. "WhatsApp", "Email", "Telepon"
 * @param {string} [intake.dateReceived]
 * @param {string} [intake.projectType]
 * @param {string} [intake.priority] - "Rendah" | "Sedang" | "Tinggi" | "Mendesak"
 * @param {string} [intake.deadline]
 * @param {string} [intake.preparedBy]
 * @param {string} [intake.approvedBy]
 * @param {string} [intake.companyName] - untuk branding di cover/header dokumen
 * @param {string} [intake.prdId] - jika tidak diisi, akan dibuat otomatis
 * @param {string[]} [intake.customerAttachments] - daftar lampiran dari customer (nama file/link), jika ada
 *
 * @returns {Promise<{ buffer: Buffer, prdData: object }>}
 *   buffer  - isi file .docx siap disimpan/dikirim
 *   prdData - objek JSON lengkap (known facts + draf AI) untuk disimpan ke database Anda sendiri jika perlu
 */
async function createPRD(intake) {
  if (!intake || !intake.rawCustomerRequest) {
    throw new Error("createPRD() butuh intake.rawCustomerRequest (teks permintaan asli dari customer).");
  }

  // Langkah 1: AI menerjemahkan permintaan mentah menjadi draf terstruktur.
  const aiDraft = await interpretCustomerRequest(intake);

  // Langkah 2: gabungkan fakta yang sudah diketahui sistem Anda dengan draf AI.
  const prdData = {
    prdId: intake.prdId || autoPrdId(),
    companyName: intake.companyName,
    projectName: intake.projectName,
    clientName: intake.clientName,
    contact: intake.contact,
    channel: intake.channel,
    dateCreated: intake.dateCreated || new Date().toLocaleDateString("id-ID"),
    dateReceived: intake.dateReceived,
    version: intake.version,
    status: intake.status,
    projectType: intake.projectType,
    priority: intake.priority,
    deadline: intake.deadline,
    preparedBy: intake.preparedBy,
    approvedBy: intake.approvedBy,
    rawCustomerRequest: intake.rawCustomerRequest,
    customerAttachments: intake.customerAttachments || [],

    ...aiDraft, // interpretation, goals, raci, roleRequirements, timeline, risks, suggestedAttachments
  };

  // Langkah 3: render ke .docx dengan desain yang sama seperti template asli.
  const buffer = await renderPRDToDocx(prdData);

  return { buffer, prdData };
}

module.exports = { createPRD };
