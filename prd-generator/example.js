/**
 * example.js
 * ------------------------------------------------------------------
 * Demo end-to-end: kirim 1 permintaan customer yang sengaja ambigu,
 * lalu simpan hasil PRD-nya sebagai .docx.
 *
 * Cara coba:
 *   npm install
 *   export ANTHROPIC_API_KEY=sk-ant-...
 *   node example.js
 */

const fs = require("fs");
const path = require("path");
const { createPRD } = require("./index");

async function main() {
  const intake = {
    // ---- field ini biasanya sudah diisi otomatis oleh sistem intake/order Anda ----
    projectName: "Website Company Profile - PT Maju Jaya",
    clientName: "PT Maju Jaya",
    contact: "0812-3456-7890",
    channel: "WhatsApp",
    dateReceived: new Date().toLocaleDateString("id-ID"),
    projectType: "Website Company Profile",
    priority: "Sedang",
    deadline: "3 minggu",
    preparedBy: "Admin CS",
    companyName: "Nama Perusahaan Anda",

    // ---- ini bagian yang biasanya ambigu / tidak terstruktur ----
    rawCustomerRequest:
      "halo min, mau buat website kantor kayak yg punya kompetitor gitu, yg penting keliatan profesional aja, budget pas2an ya soalnya baru mulai usaha. bisa dikerjain ga kira2 3 mingguan?",
  };

  console.log("Mengirim permintaan ke AI...");
  const { buffer, prdData } = await createPRD(intake);

  const outPath = path.join(__dirname, "contoh-hasil-prd.docx");
  fs.writeFileSync(outPath, buffer);
  console.log("Selesai. PRD tersimpan di:", outPath);
  console.log("PRD ID:", prdData.prdId);
  console.log(
    "Jumlah pertanyaan klarifikasi yang AI sarankan ke customer:",
    prdData.interpretation.clarifyingQuestions.length
  );
}

main().catch((err) => {
  console.error("Gagal membuat PRD:", err.message);
  process.exit(1);
});
