import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const body = await req.json();
        const { rawCustomerRequest, projectName, part, prevContext, packagePrice, packageTimeline } = body;

        if (!rawCustomerRequest) {
            return NextResponse.json({ success: false, error: 'rawCustomerRequest required' }, { status: 400 });
        }

        const rawRequestStr = typeof rawCustomerRequest === 'object' ? JSON.stringify(rawCustomerRequest, null, 2) : String(rawCustomerRequest);

        // Fetch schema and prompts dynamically by reading the file to avoid CJS import errors
        const { prdAiOutputSchemaPart1, prdAiOutputSchemaPart2, prdAiOutputSchemaPart3 } = require('../../../../../../../prd-generator/prdSchema');
        const { SYSTEM_PROMPT, buildUserPrompt } = require('../../../../../../../prd-generator/prdPrompt');

        let schemaToUse = prdAiOutputSchemaPart1;
        let partInfo = "";

        if (part === 1) {
            schemaToUse = prdAiOutputSchemaPart1;
            partInfo = "\n\n[PENTING] INI ADALAH GENERATE PRD PART 1 (BAB AWAL). Fokus hanya menghasilkan field JSON yang sesuai schema Part 1.";
        } else if (part === 2) {
            schemaToUse = prdAiOutputSchemaPart2;
            partInfo = `\n\n[PENTING] INI ADALAH GENERATE PRD PART 2 (BAB TENGAH). Berikut adalah hasil dari Part 1: ${JSON.stringify(prevContext || {})}`;
        } else if (part === 3) {
            schemaToUse = prdAiOutputSchemaPart3;
            partInfo = `\n\n[PENTING] INI ADALAH GENERATE PRD PART 3 (FINAL/TEKNIS). Berikut adalah hasil sebelumnya: ${JSON.stringify(prevContext || {})}`;
        }

        // Clean schema for Gemini
        function cleanSchemaForGemini(schema: any): any {
            if (!schema || typeof schema !== 'object') return schema;
            const cleaned = { ...schema };
            delete cleaned.additionalProperties;
            if (cleaned.properties) {
                const props: any = {};
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

        const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-3-flash-preview", "gemini-flash-lite-latest", "gemini-pro-latest", "gemini-2.5-pro"];
        let finalResponse: Response | null = null;
        let lastErrStr = "";

        for (const model of MODELS) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                    contents: [{ parts: [{ text: buildUserPrompt({ projectName, rawCustomerRequest: rawRequestStr, packagePrice, packageTimeline }) + partInfo }] }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 8192,
                        responseMimeType: "application/json",
                        responseSchema: cleanSchemaForGemini(schemaToUse),
                    }
                })
            });

            if (response.ok) {
                finalResponse = response;
                break;
            }

            lastErrStr = await response.text();
            // Continue unconditionally
        }

        if (!finalResponse) {
            throw new Error(`Semua varian model AI sedang kepenuhan/gagal (High Demand). Error terakhir: ${lastErrStr}`);
        }

        const data = await finalResponse.json();
        const textPart = data.candidates?.[0]?.content?.parts?.[0]?.text;

        return NextResponse.json({
            success: true,
            data: JSON.parse(textPart || "{}")
        });

    } catch (e: any) {
        console.error(`PRD chunk generation crash:`, e);
        return NextResponse.json({ success: false, error: e.message || 'Fatal PRD error' }, { status: 500 });
    }
}
