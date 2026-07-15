import { NextResponse } from 'next/server';

export const runtime = 'edge';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Cari system prompt
        const sysMsg = messages.find((m: any) => m.role === 'system');
        const systemInstruction = sysMsg ? { parts: [{ text: sysMsg.content }] } : undefined;

        // Convert messages array
        const contents = messages
            .filter((m: any) => m.role !== 'system')
            .map((m: any) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: contents,
                systemInstruction: systemInstruction,
                generationConfig: {
                    temperature: 0.7,
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Gemini Error: ${errText}`);
        }

        const stream = new ReadableStream({
            async start(controller) {
                const reader = response.body?.getReader();
                if (!reader) {
                    controller.close();
                    return;
                }
                const decoder = new TextDecoder();
                let buffer = '';
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        buffer += decoder.decode(value, { stream: true });

                        let boundary = buffer.indexOf('\n\n');
                        while (boundary !== -1) {
                            const chunk = buffer.slice(0, boundary);
                            buffer = buffer.slice(boundary + 2);

                            if (chunk.startsWith('data: ')) {
                                const dataStr = chunk.replace('data: ', '');
                                if (dataStr === '[DONE]') {
                                    break;
                                }
                                try {
                                    const data = JSON.parse(dataStr);
                                    let text = "";
                                    if (data.candidates && data.candidates.length > 0) {
                                        const parts = data.candidates[0].content?.parts;
                                        if (parts) {
                                            parts.forEach((p: any) => { if (p.text) text += p.text });
                                        }
                                    }
                                    if (text) controller.enqueue(new TextEncoder().encode(text));
                                } catch (e) { }
                            }
                            boundary = buffer.indexOf('\n\n');
                        }
                    }
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache'
            }
        });
    } catch (e: any) {
        return new Response(`[Error] ${e.message}`, { status: 500 });
    }
}
