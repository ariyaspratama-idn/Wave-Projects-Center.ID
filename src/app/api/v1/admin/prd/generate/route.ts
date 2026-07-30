import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60; // Extend Vercel timeout to 60 seconds

// Relative path to the original generator scripts
const { SYSTEM_PROMPT, buildUserPrompt } = require('../../../../../../../prd-generator/prdPrompt');
const { prdAiOutputSchema } = require('../../../../../../../prd-generator/prdSchema');
const { renderPRDToDocx } = require('../../../../../../../prd-generator/prdDocxRenderer');

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const body = await req.json();
        const { rawChatHistory, customPrice, projectName, clientName } = body;

        if (!rawChatHistory) {
            return NextResponse.json({ success: false, error: 'Chat history is required' }, { status: 400 });
        }

        // 1. Compile User Prompt
        const baseContext = {
            projectName: projectName || "Custom Offline Project",
            clientName: clientName || "Offline Client",
            projectType: "Custom Development",
            priority: "Tinggi",
            rawCustomerRequest: rawChatHistory + `\n\n[ADMIN NOTE: HARGA KESEPAKATAN FINAL RP ${customPrice || 'Silakan diisi di dokumen'}]`
        };

        const userPrompt = buildUserPrompt(baseContext);

        // 2. Setup Gemini Generation Config with Schema
        const generationConfig = {
            temperature: 0.2, // low temp for consistency
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
            responseSchema: prdAiOutputSchema,
        };

        // 3. Call AI with Retry (Pure Gemini-1.5-Pro due to Flash 404 key restriction)
        const activeModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        let jsonResp = "";
        let attempts = 0;
        let success = false;
        let lastError = "";

        while (attempts < 3 && !success) {
            try {
                const result = await activeModel.generateContent({
                    contents: [
                        { role: "user", parts: [{ text: userPrompt }] }
                    ],
                    systemInstruction: { role: 'system', parts: [{ text: SYSTEM_PROMPT }] },
                    generationConfig
                });

                jsonResp = result.response.text();
                success = true;
            } catch (err: any) {
                attempts++;
                lastError = err.message;
                console.error(`[PRD Generator] Attempt ${attempts} failed:`, lastError);

                if (attempts < 3) {
                    // Wait before retrying (exponential backoff: 5s, 10s) to bypass High Demand queue
                    await new Promise(resolve => setTimeout(resolve, attempts * 5000));
                }
            }
        }

        if (!success) {
            throw new Error(`Kapasitas server AI sedang penuh (503). Silakan coba lagi nanti. Detail: \n${lastError}`);
        }
        const prdData = JSON.parse(jsonResp);

        // Map Admin Inputs directly into the AI output before rendering
        prdData.projectName = baseContext.projectName;
        prdData.clientName = baseContext.clientName;
        prdData.prdId = `PRD-CUSTOM-${Date.now()}`;

        // Ensure Finance section holds the custom price if the AI didn't catch it
        if (!prdData.crossFunctionalOperations) prdData.crossFunctionalOperations = {};
        if (!prdData.crossFunctionalOperations.finance) prdData.crossFunctionalOperations.finance = {};
        prdData.crossFunctionalOperations.finance.budgetEstimateNotes = `Harga Kesepakatan Final: Rp ${customPrice || 'TBA'} (ditambahkan manual oleh Admin). ` + (prdData.crossFunctionalOperations.finance.budgetEstimateNotes || '');

        // 4. Render DOCX Buffer
        const docxBuffer = await renderPRDToDocx(prdData);

        // 5. Build standard Base64 response
        const base64Docx = docxBuffer.toString('base64');

        import('@/lib/telegram').then(({ sendTelegramDocumentBase64 }) => {
            sendTelegramDocumentBase64(base64Docx, `${prdData.prdId}.docx`, `📁 <b>DOKUMEN PRD DRAFT DIBUAT!</b>\n\n<b>Project:</b> ${baseContext.projectName}\n<b>Client:</b> ${baseContext.clientName}\n\nSilakan buka file .docx ini untuk ditinjau oleh developer.`);
        }).catch(e => console.error(e));

        return NextResponse.json({ success: true, fileName: `${prdData.prdId}.docx`, base64: base64Docx });

    } catch (e: any) {
        console.error("PRD Generator Error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
