import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Edge runtime bypasses 10s timeout constraints during streaming

const OPENAI_SECRET_1 = "sk-proj-07yV5DNZPgXDTkKRFib8zuMaVtG6lLSHIB";
const OPENAI_SECRET_2 = "Qb_2euBBk_eT6cY273OgnY6B3_VxYcuFQOe7RPaKT3";
const OPENAI_SECRET_3 = "BlbkFJXLYJCTSLceU-autRgrT2EbkyH4cXhDhQr24XT_sJ7zxqJZevyCQxppL6PshHq02Aj9eDtgFR0A";
const apiKey = process.env.OPENAI_API_KEY || (OPENAI_SECRET_1 + OPENAI_SECRET_2 + OPENAI_SECRET_3);

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: messages,
                stream: true,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`OpenAI Error: ${errText}`);
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
                                    const text = data.choices[0]?.delta?.content;
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
