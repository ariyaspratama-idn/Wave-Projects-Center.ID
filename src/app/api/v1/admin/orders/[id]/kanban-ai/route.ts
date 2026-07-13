import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const { id } = await params;
        const orderId = Number(id);

        // Fetch client brief & order details
        const [briefs]: any = await pool.query("SELECT * FROM client_briefs WHERE order_id = ?", [orderId]);
        if (briefs.length === 0) return NextResponse.json({ success: false, error: 'Brief belum diisi klien' }, { status: 400 });

        const [orders]: any = await pool.query("SELECT o.github_url, o.title, o.description, p.name as package_name, p.price as package_price, p.features as package_features FROM orders o LEFT JOIN packages p ON o.package_id = p.id WHERE o.id = ?", [orderId]);
        const order = orders.length > 0 ? orders[0] : { github_url: '', package_name: '', package_price: 0 };

        const brief = briefs[0];

        // Fetch PRD template from database
        let prdTemplateContext = '';
        try {
            const [templateRows]: any = await pool.query("SELECT setting_value FROM system_settings WHERE setting_key = 'prd_template'");
            if (templateRows.length > 0) {
                const sections = typeof templateRows[0].setting_value === 'string' ? JSON.parse(templateRows[0].setting_value) : templateRows[0].setting_value;
                prdTemplateContext = '\n\nPRD TEMPLATE STRUKTUR (27 Bagian) — Gunakan ini sebagai panduan mengelompokkan task:\n' +
                    sections.map((s: any) => `${s.no}. ${s.title}: ${s.desc}`).join('\n');
            }
        } catch (e) { }

        // Fetch custom SOP rules
        let sopContext = '';
        try {
            const [rules]: any = await pool.query('SELECT content FROM ai_knowledge_base WHERE is_active = 1');
            if (rules.length > 0) {
                sopContext = '\n\nSOP & ATURAN KHUSUS AGENCY (WAJIB DIPATUHI):\n' +
                    rules.map((r: any, i: number) => `${i + 1}. ${r.content}`).join('\n');
            }
        } catch (e) { }

        // Call Google Gemini Flash API
        const prompt = `
        You are an expert System Architect & PRD Specialist for Wave Projects Center.ID Agency.
        Review the following Client Brief and generate a comprehensive, PRD-aligned technical Kanban Board.

        CLIENT BRIEF:
        Project Name: ${brief.project_name}
        Attributes & Chat History: ${brief.core_attributes}
        Package: ${order.package_name || 'Custom'} (Rp ${Number(order.package_price || 0).toLocaleString('id-ID')})
        GitHub Repo: ${order.github_url || 'None'}
        ${prdTemplateContext}
        ${sopContext}

        INSTRUKSI:
        1. Pecah proyek menjadi task-task kecil yang actionable untuk developer.
        2. Kelompokkan task berdasarkan fase PRD: Setup, Frontend, Backend, Database, Integration, Testing, Deployment, Documentation.
        3. Setiap task harus spesifik dan bisa dikerjakan dalam 1-4 jam.
        4. Sertakan task untuk: Kepatuhan UU PDP, Analytics Setup, Security Checklist, SLA Documentation.

        OUTPUT FORMAT:
        Output ONLY a raw, minified JSON array of object tasks. No markdown, no prefixes, no explanations. 
        Like: [{"title": "Setup Next.js Auth", "description": "Configure NextAuth with Google Provider", "phase": "Backend"}, ...]
        Ensure it is exactly a valid JSON array.
        `;

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
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

        if (!geminiRes.ok) {
            return NextResponse.json({ success: false, error: 'Gemini API Fail: ' + JSON.stringify(geminiData) }, { status: 400 });
        }

        const rawJsonText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

        let taskArray = [];
        try {
            const stripped = rawJsonText.replace(/```json/gi, '').replace(/```/g, '').trim();
            taskArray = JSON.parse(stripped);
        } catch (e) {
            return NextResponse.json({ success: false, error: 'AI failed to generate valid JSON array. Raw: ' + rawJsonText }, { status: 400 });
        }

        // Wipe existing kanban tasks and insert new ones
        await pool.query("DELETE FROM kanban_tasks WHERE order_id = ?", [orderId]);

        for (const t of taskArray) {
            await pool.query(
                "INSERT INTO kanban_tasks (order_id, title, description, status) VALUES (?, ?, ?, 'TODO')",
                [orderId, t.title || 'Untitled', t.description || '']
            );
        }

        return NextResponse.json({ success: true, message: 'AI Kanban successfully spawned', tasks: taskArray.length, raw: rawJsonText });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const orderId = Number(id);
        const [tasks]: any = await pool.query("SELECT * FROM kanban_tasks WHERE order_id = ? ORDER BY id ASC", [orderId]);
        return NextResponse.json({ success: true, data: tasks });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const body = await req.json();
        const { taskId, status } = body;
        const { id } = await params;
        await pool.query("UPDATE kanban_tasks SET status = ? WHERE id = ? AND order_id = ?", [status, taskId, id]);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
