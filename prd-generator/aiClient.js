/**
 * aiClient.js
 * ------------------------------------------------------------------
 * Default AI provider: Anthropic Claude API, using native Structured
 * Outputs (output_config.format) so the response is GUARANTEED to be
 * valid JSON matching prdSchema.js — no retry/repair logic needed.
 *
 * Setup:
 *   npm install @anthropic-ai/sdk
 *   export ANTHROPIC_API_KEY=sk-ant-...
 *
 * Belum pasti mau pakai AI apa? Ini dipasang sebagai default karena
 * paling langsung diintegrasikan (satu paket, satu env var) dan
 * mendukung Structured Outputs secara native. Kalau nanti Anda
 * memutuskan pakai provider lain (OpenAI, dll), lihat
 * aiClient.openai.alternative.js — tinggal ganti import-nya di
 * generatePRD.js, seluruh file lain (schema, prompt, renderer) TIDAK
 * perlu diubah karena tidak terikat ke provider tertentu.
 */

const Anthropic = require("@anthropic-ai/sdk");
const { prdAiOutputSchema } = require("./prdSchema");
const { SYSTEM_PROMPT, buildUserPrompt } = require("./prdPrompt");

const client = new Anthropic(); // membaca ANTHROPIC_API_KEY dari environment otomatis

const MODEL = process.env.PRD_AI_MODEL || "claude-sonnet-4-6";

/**
 * Mengirim permintaan customer (mentah/ambigu) ke AI dan mengembalikan
 * draf PRD terstruktur sesuai prdAiOutputSchema.
 *
 * @param {object} ctx - lihat buildUserPrompt() di prdPrompt.js untuk field yang didukung
 * @returns {Promise<object>} objek JSON sesuai prdAiOutputSchema
 */
async function interpretCustomerRequest(ctx) {
  if (!ctx || !ctx.rawCustomerRequest || !ctx.rawCustomerRequest.trim()) {
    throw new Error("rawCustomerRequest wajib diisi — ini adalah teks permintaan asli dari customer.");
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(ctx) }],
    output_config: {
      format: {
        type: "json_schema",
        schema: prdAiOutputSchema,
      },
    },
  });

  // Structured Outputs tetap bisa menghasilkan respons yang tidak sesuai
  // schema dalam dua kasus: refusal (alasan keamanan) atau output
  // terpotong karena max_tokens. Keduanya WAJIB ditangani secara eksplisit.
  if (response.stop_reason === "refusal") {
    throw new Error(
      "AI menolak memproses permintaan ini (stop_reason: refusal). Periksa kembali isi permintaan customer."
    );
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error(
      "Output AI terpotong karena mencapai batas max_tokens. Naikkan nilai max_tokens di aiClient.js."
    );
  }

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock) {
    throw new Error("Respons AI tidak mengandung blok teks yang diharapkan.");
  }

  return JSON.parse(textBlock.text);
}

module.exports = { interpretCustomerRequest, MODEL };
