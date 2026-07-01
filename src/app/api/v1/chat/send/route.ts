import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { session_token, message, customer_name, customer_email } = body;

        let sessionId;

        // 1. Check or Create session
        if (session_token) {
            const [rows]: any = await pool.query('SELECT id FROM chat_sessions WHERE session_token = ? LIMIT 1', [session_token]);
            if (rows.length > 0) sessionId = rows[0].id;
        }

        if (!sessionId) {
            const newToken = session_token || `CHAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const [result]: any = await pool.query(
                "INSERT INTO chat_sessions (session_token, customer_name) VALUES (?, ?)",
                [newToken, customer_name || 'Guest']
            );
            sessionId = result.insertId;
        }

        // 2. Save User Message
        await pool.query(
            "INSERT INTO chat_messages (chat_session_id, sender, content) VALUES (?, ?, ?)",
            [sessionId, 'customer', message]
        );

        // 3. Generate AI Response
        let aiText = "Terima kasih atas pesannya! Mohon tunggu sebentar, konsultan kami akan segera menganalisisnya.";
        try {
            // Context injection for AI Consultant behavior (Mock behavior if key invalid)
            const prompt = `Anda adalah AI Consultant di Wave Projects Center.ID. 
            Tugas Anda: merekomendasikan layanan pembuatan software/web dan harga.
            Pesan customer: "${message}" 
            Jawab singkat dan ramah (max 3 kalimat).`;

            const result = await model.generateContent(prompt);
            aiText = result.response.text();

        } catch (genErr) {
            console.error("Gemini fallback triggered");
        }

        // 4. Save AI Response
        await pool.query(
            "INSERT INTO chat_messages (chat_session_id, sender, content) VALUES (?, ?, ?)",
            [sessionId, 'ai', aiText]
        );

        return NextResponse.json({
            success: true,
            data: {
                session_token: session_token || `CHAT-${sessionId}`, // Give back token if it was new
                reply: aiText
            }
        });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
