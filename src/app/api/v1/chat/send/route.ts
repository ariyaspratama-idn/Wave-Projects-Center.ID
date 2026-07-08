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
            // Context injection: Fetch all available packages from DB to provide accurate recommendations
            const [pkgs]: any = await pool.query('SELECT name, `desc`, price, code FROM packages WHERE is_active = 1');
            let pkgsText = "Berikut adalah paket layanan Wave Projects Center beserta harga dan fiturnya:\n";
            if (pkgs && pkgs.length > 0) {
                pkgs.forEach((p: any) => {
                    let feats = [];
                    try { feats = Array.isArray(p.code) ? p.code : JSON.parse(p.code); } catch (e) { }
                    pkgsText += `- ${p.name}: Rp${Number(p.price).toLocaleString('id-ID')}\n  Deskripsi: ${p.desc}\n  Fitur: ${(feats || []).join(', ')}\n`;
                });
            } else {
                pkgsText = "Saat ini paket belum tersedia di sistem. (Namun Anda tetap bisa menanyakan kebutuhan secara kustom)";
            }

            const prompt = `Anda adalah AI Consultant di Wave Projects Center.ID. Nama Anda adalah "Nova". 
            Tugas Anda: merespons pertanyaan pelanggan, merekomendasikan layanan pembuatan software/web/aplikasi yang tersedia, dan memberitahu harga/paket yang sesuai kebutuhan mereka secara profesional.
            
            ${pkgsText}
            
            ATURAN PENTING:
            1. Jika pertanyaan atau permintaan pelanggan bisa diselesaikan dengan informasi paket di atas, jawablah dengan detail paket yang cocok (sebutkan nama paket dan harganya agar spesifik).
            2. JANGAN langsung menyuruh pelanggan menunggu admin kecuali mereka menanyakan hal spesifik/pembahasan teknis di luar paket atau secara langsung meminta bertemu admin.
            3. Tanggapi dengan bahasa Indonesia yang natural, ramah, meyakinkan, namun terstruktur (gunakan poin-poin/bullet point jika memberikan rincian).
            4. Pesan customer tidak selalu pertanyaan, kadang hanya salam (respon dengan salam balik dan tawaran paket).
            
            Pesan customer: "${message}" 
            Jawaban Anda:`;

            const result = await model.generateContent(prompt);
            aiText = result.response.text();

        } catch (genErr) {
            console.error("Gemini fallback triggered", genErr);
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
