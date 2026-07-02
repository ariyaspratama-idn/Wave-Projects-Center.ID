import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const orderId = Number(params.id);

        // Fetch client brief
        const [briefs]: any = await pool.query("SELECT * FROM client_briefs WHERE order_id = ?", [orderId]);
        if (briefs.length === 0) return NextResponse.json({ success: false, error: 'Brief belum diisi klien' }, { status: 400 });

        const brief = briefs[0];

        // Call Google Gemini Flash API (native fetch — zero SDK overhead)
        const prompt = `
        You are an expert System Architect. Review the following Client Brief and extract a comprehensive technical Kanban Board checklist.
        Break down the project into tiny, actionable technical tasks for a Solo-Developer.

        CLIENT BRIEF:
        Project Name: ${brief.project_name}
        Attributes: ${brief.core_attributes}

        OUTPUT FORMAT:
        Output ONLY a raw, minified JSON array of object tasks. No markdown, no prefixes, no explanations. 
        Like: [{"title": "Setup Next.js Auth", "description": "Configure NextAuth with Google Provider"}, ...]
        Ensure it is exactly a valid JSON array.
        `;

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 4096,
                    },
                    systemInstruction: {
                        parts: [{ text: "You are an AI that ONLY outputs raw, minified valid JSON arrays. Never use markdown code blocks or any wrapping." }]
                    }
                })
            }
        );

        const geminiData = await geminiRes.json();
        const rawJsonText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

        let taskArray = [];
        try {
            taskArray = JSON.parse(rawJsonText);
        } catch (e) {
            // fallback if it wrapped in ```json
            const stripped = rawJsonText.replace(/```json/g, '').replace(/```/g, '').trim();
            taskArray = JSON.parse(stripped);
        }

        // Wipe existing kanban tasks and insert new ones
        await pool.query("DELETE FROM kanban_tasks WHERE order_id = ?", [orderId]);

        for (const t of taskArray) {
            const [result]: any = await pool.query(
                "INSERT INTO kanban_tasks (order_id, title, description, status) VALUES (?, ?, ?, 'TODO')",
                [orderId, t.title || 'Untitled', t.description || '']
            );
            const insertId = result.insertId;
            const taskCode = `TASK-${orderId}-${insertId}`;
            await pool.query("UPDATE kanban_tasks SET task_code = ? WHERE id = ?", [taskCode, insertId]);
        }

        return NextResponse.json({ success: true, message: 'AI Kanban successfully spawned', tasks: taskArray.length });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const orderId = Number(params.id);
        const [tasks]: any = await pool.query("SELECT * FROM kanban_tasks WHERE order_id = ? ORDER BY id ASC", [orderId]);
        return NextResponse.json({ success: true, data: tasks });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        const { taskId, status } = body;
        await pool.query("UPDATE kanban_tasks SET status = ? WHERE id = ? AND order_id = ?", [status, taskId, params.id]);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
