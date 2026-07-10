import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { package_id, client_name, client_email, client_whatsapp, project_purpose, payment_choice, github_url } = body;

        if (!package_id) return NextResponse.json({ success: false, message: 'Package ID required' }, { status: 400 });

        const [pkgs]: any = await pool.query('SELECT name, price FROM packages WHERE id = ?', [package_id]);
        if (!pkgs.length) return NextResponse.json({ success: false, message: 'Invalid package' }, { status: 400 });

        const price = pkgs[0].price;
        const packageName = pkgs[0].name;
        const totalAmount = payment_choice === 'DP_30' ? price * 0.3 : price;

        // 1. AI Package Validator Layer
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (GEMINI_API_KEY && (project_purpose || github_url)) {
            const [allPkgs]: any = await pool.query('SELECT id, name, price FROM packages WHERE is_active = 1');
            const pkgsList = allPkgs.map((p: any) => `ID ${p.id}: ${p.name} (Rp ${p.price})`).join("\n");

            const prompt = `Anda adalah validator teknis (Sistem AI) di Wave Projects Center. Klien baru saja "membeli" paket: [${packageName}].
Kebutuhan klien: "${project_purpose}"
Referensi Github: "${github_url || 'Tidak disertakan'}"

Tugas Anda: Evaluasi apakah kebutuhan & kompleksitas klien COCOK/MASUK AKAL dengan paket [${packageName}]!
Jika COCOK atau dapat ditolerir, kembalikan MAKSIMAL 3 KARAKTER persis: "OK".
Jika SANGAT TIDAK COCOK (Misal: Klien minta bikin E-commerce Tokopedia raksasa / integrasi AI tapi milih Paket murah Web Profile), kembalikan penolakan super ramah dalam 2 kalimat bahasa Indonesia. Di dalam kalimat itu, REKOMENDASIKAN package yang lebih tepat dari daftar ini:
${pkgsList}
Jika menolak, gunakan format teks AWALAN: "REJECT: <pesan ramah Anda di sini>"`;

            const geminiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.1 }
                    })
                }
            );

            const geminiData = await geminiRes.json();
            const evaluation = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'OK';

            if (evaluation.startsWith('REJECT:')) {
                const rejectMsg = evaluation.replace('REJECT:', '').trim();
                return NextResponse.json({ success: false, message: `🤖 Peringatan AI Consultant:\n${rejectMsg}` }, { status: 400 });
            }
        }

        const orderNumber = `WAVE-${Date.now()}`;

        const [orderResult]: any = await pool.query(
            `INSERT INTO orders (package_id, client_name, client_email, client_whatsapp, project_purpose, payment_choice, github_url, order_number, status, total_amount, payment_status, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [package_id, client_name || '', client_email || '', client_whatsapp || '', project_purpose || '', payment_choice || 'FULL', github_url || '', orderNumber, 'pending', totalAmount, 'unpaid']
        );

        const orderId = orderResult.insertId;

        // 2. Auto-Bridge Chat History & Repo to PRD Generator
        let chatHistoryText = `Project Purpose Form: ${project_purpose}\nGithub Reference Repo: ${github_url || 'N/A'}`;

        if (body.chat_session) {
            const [sessionRows]: any = await pool.query("SELECT id FROM chat_sessions WHERE session_token = ?", [body.chat_session]);
            if (sessionRows.length > 0) {
                const sessionId = sessionRows[0].id;
                const [chatRows]: any = await pool.query("SELECT sender, content FROM chat_messages WHERE chat_session_id = ? ORDER BY id ASC", [sessionId]);
                if (chatRows.length > 0) {
                    const mappedChat = chatRows.map((m: any) => `${m.sender === 'customer' ? 'Klien' : 'AI Consultant'}: ${m.content}`).join('\n\n');
                    chatHistoryText += `\n\n=== RIWAYAT OBROLAN PRA-PEMESANAN ===\n${mappedChat}`;
                }
            }
        }

        // Silent Injection to client_briefs so Admin kanban-ai button works instantly
        await pool.query(
            "INSERT INTO client_briefs (order_id, project_name, core_attributes, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
            [orderId, project_purpose.slice(0, 50) || 'Proyek Pesanan Baru', chatHistoryText]
        );

        // Dispatch OneSignal Push Notification independently
        const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
        const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

        if (ONESIGNAL_APP_ID && ONESIGNAL_REST_API_KEY) {
            await fetch('https://onesignal.com/api/v1/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
                },
                body: JSON.stringify({
                    app_id: ONESIGNAL_APP_ID,
                    included_segments: ['Active Users', 'Admins'],
                    headings: { en: 'Pesanan Baru Masuk! 🚀' },
                    contents: { en: `Klien ${client_name || 'Tanpa Nama'} (${client_whatsapp}) telah memesan Paket #${package_id}.` }
                })
            }).catch(() => null);
        }

        if (client_whatsapp) {
            import('@/lib/whatsapp').then(({ sendClientFollowUp }) => {
                sendClientFollowUp(client_whatsapp, client_name || client_whatsapp, packageName, orderNumber).catch(e => console.error(e));
            }).catch(e => console.error('Gagal meload whatsapp service', e));
        }

        return NextResponse.json({
            success: true,
            message: 'Order created successfully natively on Next.js',
            data: {
                order_number: orderNumber,
                snap_token: `mock_snap_${Math.random()}`,
                order_id: orderId,
            }
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
