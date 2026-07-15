import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { session_token, message, customer_name, customer_email, turnstile_token } = body;

        // Turnstile Validation
        if (process.env.TURNSTILE_SECRET) {
            if (!turnstile_token) {
                return NextResponse.json({ success: false, error: "Captcha verification required" }, { status: 403 });
            }
            const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET, response: turnstile_token })
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
                return NextResponse.json({ success: false, error: "Captcha verification failed" }, { status: 403 });
            }
        }

        let sessionId;
        let messageCount = 0;
        let chatHistoryDb: any[] = [];

        // 1. Check or Create session
        if (session_token) {
            const [rows]: any = await pool.query('SELECT id FROM chat_sessions WHERE session_token = ? LIMIT 1', [session_token]);
            if (rows.length > 0) {
                sessionId = rows[0].id;
                const [countRows]: any = await pool.query('SELECT COUNT(id) as count FROM chat_messages WHERE chat_session_id = ? AND sender = "customer"', [sessionId]);
                messageCount = countRows[0].count;

                const [historyRows]: any = await pool.query('SELECT sender, content FROM chat_messages WHERE chat_session_id = ? ORDER BY id ASC LIMIT 30', [sessionId]);
                chatHistoryDb = historyRows;
            }
        }

        if (messageCount >= 20) {
            return NextResponse.json({
                success: true,
                data: {
                    session_token: `CHAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    reply: "Wah, obrolan kita seru banget nih! Biar rancangan sistem kamu ini bisa langsung dieksekusi jadi PRD resmi dan masuk ke tahap penawaran harga, yuk langsung lanjutin obrolan ini via WhatsApp bareng mentor software kami di sini: https://wa.me/085156618435"
                }
            });
        }

        let activeToken = session_token;
        if (!sessionId) {
            activeToken = session_token || `CHAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const [result]: any = await pool.query(
                "INSERT INTO chat_sessions (session_token, customer_name) VALUES (?, ?)",
                [activeToken, customer_name || 'Guest']
            );
            sessionId = result.insertId;
        }

        // 2. Save User Message
        await pool.query(
            "INSERT INTO chat_messages (chat_session_id, sender, content) VALUES (?, ?, ?)",
            [sessionId, 'customer', message]
        );

        // 3. Generate AI Response
        let contactText = "WhatsApp: 085156618435 | Email: a.pramadhan.id@gmail.com";
        let aiText = "Terima kasih atas pesannya! Mohon tunggu sebentar, konsultan kami akan segera menganalisisnya.";
        try {
            // Context injection: Fetch all available packages from DB to provide accurate recommendations
            const [pkgs]: any = await pool.query("SELECT id, name, price, code FROM packages WHERE is_active = 1");
            let pkgsText = "Berikut adalah paket layanan Wave Projects Center beserta harga dan fiturnya:\n";
            if (pkgs && pkgs.length > 0) {
                pkgs.forEach((p: any) => {
                    let feats = [];
                    try { feats = Array.isArray(p.code) ? p.code : JSON.parse(p.code); } catch (e) { }
                    pkgsText += `- [ID_PAKET: ${p.id}] ${p.name}: Rp${Number(p.price).toLocaleString('id-ID')}\n  Fitur: ${(feats || []).join(', ')}\n`;
                });
            } else {
                pkgsText = "Saat ini paket belum tersedia di sistem. (Namun Anda tetap bisa menanyakan kebutuhan secara kustom)";
            }

            // Context injection 2: Fetch active RAG Knowledge Base rules
            let ragText = "";
            try {
                const [rules]: any = await pool.query('SELECT content FROM ai_knowledge_base WHERE is_active = 1');
                if (rules && rules.length > 0) {
                    ragText = "\n\nDOKUMEN SOP & BEST PRACTICES TERBARU (WAJIB DIPATUHI):\n";
                    rules.forEach((r: any, idx: number) => {
                        ragText += `${idx + 1}. ${r.content}\n`;
                    });
                }
            } catch (knowledgeErr) {
                console.error("Knowledge base table missing or error:", knowledgeErr);
            }

            // Context injection 3: Fetch dynamic company contacts
            try {
                const [settings]: any = await pool.query("SELECT setting_value FROM system_settings WHERE setting_key = 'contact_info'");
                if (settings && settings.length > 0) {
                    const parsed = typeof settings[0].setting_value === 'string' ? JSON.parse(settings[0].setting_value) : settings[0].setting_value;
                    if (parsed.whatsapp) contactText = `WhatsApp: wa.me/${parsed.whatsapp.replace(/[^0-9]/g, '')} | Email: ${parsed.email}`;
                }
            } catch (e) { }


            const systemPrompt = `Anda adalah AI Consultant bernama "Nova" di Wave Projects Center.ID. 
            Misi & Slogan Perusahaan: "Bangun Software Impian Anda. Platform all-in-one untuk konsultasi AI, pemesanan, pembayaran, hingga serah terima proyek web & aplikasi. Satu ekosistem. Tanpa ribet."
            
            Tugas Utama Anda: 
            1. Menyapa pelanggan dengan hangat sebagai representasi Wave Projects Center.
            2. Berdiskusi aktif menggali apa persisnya kebutuhan perangkat lunak atau website yang mereka inginkan.
            3. Mengarahkan pelanggan secara presisi ke salah satu paket layanan yang paling sesuai dengan kebutuhan mereka dari daftar di bawah.
            
            Daftar Layanan/Paket yang Wave Projects sediakan saat ini:
            ${pkgsText}
            ${ragText}

            ATURAN KETAT UNTUK NOVA (WAJIB DIPATUHI):
            1. ANTI-HALUSINASI: Jangan pernah mengarang, merekomendasikan, atau menjanjikan paket, fitur, maupun harga di luar "Daftar Layanan/Paket" di atas.
            2. JANGAN MUDAH MENYERAH: Jika klien bertanya tentang pembuatan web/aplikasi, analisis kebutuhan mereka, cocokkan dengan paket terbaik yang tersedia, dan tawarkan paket tersebut beserta harganya.
            3. KONTAK CS MANUAL: JIKA klien memiliki permintaan yang di luar nalar API sistem, atau Ingin Negosiasi / Menawar harga secara spesifik, ATAU AI merasa tidak sanggup memberikan jawaban akurat: KAMU WAJIB memberikan kontak asli tim admin/CS langsung secara jelas! 
               Berikan kontak ini ke klien: ${contactText} 
            4. INFO TEKNOLOGI & PEMBAYARAN: Jika klien menanyakan spesifikasi teknis, tekankan bahwa kita menggunakan arsitektur cloud modern (Serverless) yang canggih (Laravel, Next.js, Vercel, TiDB Cloud, Cloudinary). RAHASIA DAPUR: Dilarang keras menyebutkan bahwa platform yang kita pakai ini "gratis" atau "free-tier". Sebutkan sebagai infrastruktur mutakhir yang sangat terukur (scalable). Jika bertanya tentang Payment Gateway, jelaskan bahwa kita menyediakan sistem "Transfer Manual" secara default agar proses bisnis mereka terhindar dari potongan biaya admin pihak ketiga, namun kita siap mengintegrasikan gateway otomatis jika mereka memintanya.
            5. GAYA BAHASA: Natural, ramah, meyakinkan, terstruktur, tidak bertele-tele, dan selalu profesional.
            6. Jika pelanggan hanya menyapa (baru mulai percakapan), balaslah dengan ramah, selipkan inti dari slogan (Bantu bangun software ekosistem satu pintu), dan tanyakan project apa yang ingin mereka wujudkan.
            7. CHECKOUT TRIGGER (SUPER PENTING): Jika klien SUDAH SETUJU mengambil suatu paket dan bertanya cara membayarnya / langkah selanjutnya, kamu WAJIB menyertakan kode rahasia ini tepat di akhir teks balasanmu tanpa modifikasi apa pun: \`[CHECKOUT_TRIGGER:<ID_PAKET>]\`. Contoh: jika mereka ambil Paket Ultimate yang ID-nya 3, kamu balas: "Baik, silakan klik tombol di bawah ini: [CHECKOUT_TRIGGER:3]".`;

            // Restructure prompt history into OpenAI Messages format
            const messages: any[] = [{ role: "system", content: systemPrompt }];

            chatHistoryDb.forEach((msg: any) => {
                messages.push({
                    role: msg.sender === 'customer' ? 'user' : 'assistant',
                    content: msg.content
                });
            });
            messages.push({ role: "user", content: message });

            return NextResponse.json({
                success: true,
                data: {
                    session_token: activeToken,
                    session_id: sessionId,
                    messages: messages,
                    customer_name: customer_name,
                    contact_text: contactText
                }
            });

        } catch (outerGenErr: any) {
            console.error("Outer AI processing failed:", outerGenErr);
            return NextResponse.json({
                success: false,
                error: `Mohon maaf, sistem database kami sedang padat. Silakan hubungi admin.`
            }, { status: 500 });
        }

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
