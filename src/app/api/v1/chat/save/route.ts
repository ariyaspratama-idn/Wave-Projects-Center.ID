import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { sessionId, aiText, customer_name, message } = await req.json();

        // WhatsApp Admin Alert Logic
        const lowerPrompt = message?.toLowerCase() || "";
        const lowerResponse = aiText?.toLowerCase() || "";

        if (lowerPrompt.includes("ultimate") || lowerResponse.includes("ultimate") || lowerPrompt.includes("custom") || lowerResponse.includes("custom")) {
            // Import dinamis agar tidak memperlambat start routing
            import('@/lib/whatsapp').then(({ sendAdminAlert }) => {
                sendAdminAlert(customer_name || 'Guest', 'Paket Ultimate / Custom', sessionId.toString()).catch(e => console.error(e));
            }).catch(e => console.error("Gagal load whatsapp lib", e));
        }

        // Save AI Response
        if (sessionId && aiText) {
            await pool.query(
                "INSERT INTO chat_messages (chat_session_id, sender, content) VALUES (?, ?, ?)",
                [sessionId, 'ai', aiText]
            );
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
