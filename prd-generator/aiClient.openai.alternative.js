/**
 * aiClient.openai.alternative.js
 * ------------------------------------------------------------------
 * NOT used by default. This is a drop-in alternative to aiClient.js
 * for when you decide to use OpenAI instead of Claude.
 *
 * To switch: in generatePRD.js, change
 *   const { interpretCustomerRequest } = require("./aiClient");
 * to
 *   const { interpretCustomerRequest } = require("./aiClient.openai.alternative");
 * Nothing else in the project needs to change — prdSchema.js and
 * prdPrompt.js are provider-agnostic.
 *
 * Setup:
 *   npm install openai
 *   export OPENAI_API_KEY=sk-...
 */

const OpenAI = require("openai");
const { prdAiOutputSchema } = require("./prdSchema");
const { SYSTEM_PROMPT, buildUserPrompt } = require("./prdPrompt");

const client = new OpenAI(); // membaca OPENAI_API_KEY dari environment otomatis

const MODEL = process.env.PRD_AI_MODEL || "gpt-5.5";

async function interpretCustomerRequest(ctx) {
  if (!ctx || !ctx.rawCustomerRequest || !ctx.rawCustomerRequest.trim()) {
    throw new Error("rawCustomerRequest wajib diisi — ini adalah teks permintaan asli dari customer.");
  }

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(ctx) },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "prd_draft",
        strict: true,
        schema: prdAiOutputSchema,
      },
    },
  });

  const choice = completion.choices[0];

  if (choice.finish_reason === "length") {
    throw new Error("Output AI terpotong (finish_reason: length). Naikkan max_completion_tokens.");
  }
  if (choice.message.refusal) {
    throw new Error(`AI menolak memproses permintaan ini: ${choice.message.refusal}`);
  }

  return JSON.parse(choice.message.content);
}

module.exports = { interpretCustomerRequest, MODEL };
