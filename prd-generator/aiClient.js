/**
 * aiClient.js
 * ------------------------------------------------------------------
 * AI provider: Google Gemini 2.0 Flash API via native fetch().
 * Uses `responseMimeType: "application/json"` + `responseSchema` for
 * structured output enforcement — guaranteed valid JSON matching
 * prdSchema.js, no retry/repair logic needed.
 *
 * Setup:
 *   export GEMINI_API_KEY=your-key-here
 *
 * This replaces the previous Anthropic Claude integration while
 * maintaining the exact same contract: interpretCustomerRequest(ctx)
 * returns a parsed JSON object matching prdAiOutputSchema.
 */

const { prdAiOutputSchemaPart1, prdAiOutputSchemaPart2, prdAiOutputSchemaPart3, prdAiOutputSchema } = require("./prdSchema");
const { SYSTEM_PROMPT, buildUserPrompt } = require("./prdPrompt");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-flash-latest";

/**
 * Converts our JSON Schema to Gemini's responseSchema format.
 * Gemini doesn't support `additionalProperties`, so we strip it.
 */
function cleanSchemaForGemini(schema) {
  if (!schema || typeof schema !== 'object') return schema;
  const cleaned = { ...schema };
  delete cleaned.additionalProperties;
  if (cleaned.properties) {
    const props = {};
    for (const [key, val] of Object.entries(cleaned.properties)) {
      props[key] = cleanSchemaForGemini(val);
    }
    cleaned.properties = props;
  }
  if (cleaned.items) {
    cleaned.items = cleanSchemaForGemini(cleaned.items);
  }
  return cleaned;
}

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

  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY belum diset di environment variables.");
  }

  let schemaToUse = prdAiOutputSchema;
  let partInfo = "";

  if (ctx.part === 1) {
    schemaToUse = prdAiOutputSchemaPart1;
    partInfo = "\n\n[PENTING] INI ADALAH GENERATE PRD PART 1 (BAB AWAL). Fokus hanya menghasilkan field JSON yang sesuai schema Part 1.";
  } else if (ctx.part === 2) {
    schemaToUse = prdAiOutputSchemaPart2;
    partInfo = `\n\n[PENTING] INI ADALAH GENERATE PRD PART 2 (BAB TENGAH). Berikut adalah hasil dari Part 1 agar konteks nyambung (JANGAN tulis ulang): ${JSON.stringify(ctx.prevContext || {})}`;
  } else if (ctx.part === 3) {
    schemaToUse = prdAiOutputSchemaPart3;
    partInfo = `\n\n[PENTING] INI ADALAH GENERATE PRD PART 3 (FINAL/TEKNIS). Berikut adalah hasil sebelumnya agar arsitektur teknis tepat: ${JSON.stringify(ctx.prevContext || {})}`;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: [{ parts: [{ text: buildUserPrompt(ctx) + partInfo }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: cleanSchemaForGemini(schemaToUse),
      }
    })
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errBody}`);
  }

  const data = await response.json();

  // Check for blocked content
  const candidate = data.candidates?.[0];
  if (!candidate) {
    throw new Error("Gemini tidak mengembalikan kandidat respons. Periksa kembali isi permintaan customer.");
  }
  if (candidate.finishReason === "SAFETY") {
    throw new Error("AI menolak memproses permintaan ini karena alasan keamanan konten.");
  }
  if (candidate.finishReason === "MAX_TOKENS") {
    throw new Error("Output AI terpotong karena mencapai batas max_tokens. Naikkan nilai maxOutputTokens.");
  }

  const textPart = candidate.content?.parts?.[0]?.text;
  if (!textPart) {
    throw new Error("Respons AI tidak mengandung teks yang diharapkan.");
  }

  return JSON.parse(textPart);
}

module.exports = { interpretCustomerRequest, MODEL };
