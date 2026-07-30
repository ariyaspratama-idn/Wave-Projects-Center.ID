import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';
import { sendEmail } from '@/lib/email';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const { id } = await params;
        const orderId = Number(id);

        // 1. Fetch order + package price
        const [orders]: any = await pool.query(
            `SELECT o.*, p.name as package_name, p.price as package_price 
             FROM orders o 
             LEFT JOIN packages p ON o.package_id = p.id 
             WHERE o.id = ?`, [orderId]
        );
        if (orders.length === 0) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });

        const order = orders[0];
        const clientEmail = order.client_email;
        const clientName = order.client_name || 'Klien';
        const packageName = order.package_name || 'Paket Kustom';
        const fullPrice = Number(order.package_price || order.total_amount);
        const invoiceNumber = `INV-${new Date().getFullYear()}-${orderId.toString().padStart(4, '0')}`;
        const isDP = order.payment_choice === 'DP_30';
        const currentPaymentStatus = order.payment_status;

        // ──── LOGIC: Determine what this validation means ────
        let newPaymentStatus: string;
        let newOrderStatus: string;
        let logNote: string;
        let emailSubject: string;
        let emailBody: string;
        let financeAmount = 0;
        let financeDesc = "";

        if (isDP && currentPaymentStatus !== 'dp_paid') {
            // ═══ CASE 1: DP 30% — First validation (DP received) ═══
            const dpAmount = Math.round(fullPrice * 0.3);
            const remainingAmount = fullPrice - dpAmount;

            newPaymentStatus = 'dp_paid';
            newOrderStatus = 'Development';
            logNote = `DP 30% sebesar Rp ${dpAmount.toLocaleString('id-ID')} telah diverifikasi. Sisa tagihan: Rp ${remainingAmount.toLocaleString('id-ID')}`;
            financeAmount = dpAmount;
            financeDesc = `Pembayaran DP 30% - Order #${orderId} (${clientName})`;

            emailSubject = `✅ DP Diterima — ${invoiceNumber} | Sisa Tagihan Rp ${remainingAmount.toLocaleString('id-ID')}`;
            emailBody = buildEmailHTML({
                clientName, invoiceNumber, packageName, orderId,
                bannerIcon: '✅',
                bannerTitle: 'DP 30% Berhasil Diterima!',
                bannerSubtitle: 'Pembayaran awal Anda telah kami konfirmasi.',
                bannerBg: '#ecfdf5', bannerBorder: '#a7f3d0', bannerTitleColor: '#065f46', bannerSubColor: '#047857',
                rows: [
                    { label: 'Metode Pembayaran', value: 'DP 30% (Bayar Bertahap)' },
                    { label: 'DP Dibayar', value: `Rp ${dpAmount.toLocaleString('id-ID')}`, highlight: true },
                    { label: 'Harga Paket Penuh', value: `Rp ${fullPrice.toLocaleString('id-ID')}` },
                ],
                totalLabel: 'SISA TAGIHAN',
                totalValue: `Rp ${remainingAmount.toLocaleString('id-ID')}`,
                totalColor: '#dc2626',
                nextStepTitle: '⚠️ Sisa Pembayaran',
                nextStepBody: `Sisa tagihan sebesar <strong>Rp ${remainingAmount.toLocaleString('id-ID')}</strong> wajib dilunasi sebelum proyek diserahkan. Tim kami akan menghubungi Anda saat proyek mendekati tahap Final. Pengerjaan proyek tetap berjalan dengan DP yang telah diterima.`,
                nextStepBg: '#fef3c7', nextStepBorder: '#fcd34d', nextStepTitleColor: '#92400e', nextStepBodyColor: '#b45309',
            });

        } else if (isDP && currentPaymentStatus === 'dp_paid') {
            // ═══ CASE 2: DP 30% — Second validation (Remaining 70% received = LUNAS) ═══
            const dpAmount = Math.round(fullPrice * 0.3);
            const remainingAmount = fullPrice - dpAmount;

            newPaymentStatus = 'paid';
            newOrderStatus = order.status; // Don't change current project stage
            logNote = `Pelunasan sisa 70% sebesar Rp ${remainingAmount.toLocaleString('id-ID')} telah diverifikasi. Status: LUNAS PENUH.`;
            financeAmount = remainingAmount;
            financeDesc = `Pelunasan 70% - Order #${orderId} (${clientName})`;

            emailSubject = `🎉 LUNAS — ${invoiceNumber} | Seluruh Pembayaran Telah Diterima`;
            emailBody = buildEmailHTML({
                clientName, invoiceNumber, packageName, orderId,
                bannerIcon: '🎉',
                bannerTitle: 'Pembayaran Telah Lunas Sepenuhnya!',
                bannerSubtitle: 'Seluruh tagihan Anda telah kami terima. Terima kasih!',
                bannerBg: '#ecfdf5', bannerBorder: '#a7f3d0', bannerTitleColor: '#065f46', bannerSubColor: '#047857',
                rows: [
                    { label: 'DP Awal (30%)', value: `Rp ${dpAmount.toLocaleString('id-ID')}` },
                    { label: 'Pelunasan (70%)', value: `Rp ${remainingAmount.toLocaleString('id-ID')}` },
                ],
                totalLabel: 'TOTAL LUNAS',
                totalValue: `Rp ${fullPrice.toLocaleString('id-ID')}`,
                totalColor: '#059669',
                nextStepTitle: '📋 Proyek Siap Diserahkan',
                nextStepBody: 'Karena seluruh pembayaran telah diterima, tim kami akan segera menyiapkan proses serah terima (handover) proyek Anda. Anda akan menerima notifikasi saat proyek siap diakses.',
                nextStepBg: '#eff6ff', nextStepBorder: '#bfdbfe', nextStepTitleColor: '#1e40af', nextStepBodyColor: '#3b82f6',
            });

        } else {
            // ═══ CASE 3: Full Payment — Single validation = LUNAS ═══
            newPaymentStatus = 'paid';
            newOrderStatus = 'Development';
            logNote = `Pembayaran penuh sebesar Rp ${fullPrice.toLocaleString('id-ID')} telah diverifikasi. Status: LUNAS.`;
            financeAmount = fullPrice;
            financeDesc = `Pembayaran Penuh - Order #${orderId} (${clientName})`;

            emailSubject = `✅ ${invoiceNumber} — Pembayaran Lunas Dikonfirmasi | Wave Projects`;
            emailBody = buildEmailHTML({
                clientName, invoiceNumber, packageName, orderId,
                bannerIcon: '✅',
                bannerTitle: 'Pembayaran Lunas Berhasil Diverifikasi!',
                bannerSubtitle: 'Dana Anda telah kami terima dan konfirmasi sepenuhnya.',
                bannerBg: '#ecfdf5', bannerBorder: '#a7f3d0', bannerTitleColor: '#065f46', bannerSubColor: '#047857',
                rows: [
                    { label: 'Metode Pembayaran', value: 'Bayar Penuh (Full Payment)' },
                ],
                totalLabel: 'TOTAL DIBAYAR',
                totalValue: `Rp ${fullPrice.toLocaleString('id-ID')}`,
                totalColor: '#059669',
                nextStepTitle: '📋 Apa Selanjutnya?',
                nextStepBody: 'Tim kami akan segera memulai pengerjaan proyek Anda. Dokumen PRD (Product Requirement Document) akan disiapkan oleh sistem AI kami dan dikirimkan kepada developer yang ditugaskan.',
                nextStepBg: '#eff6ff', nextStepBorder: '#bfdbfe', nextStepTitleColor: '#1e40af', nextStepBodyColor: '#3b82f6',
            });
        }

        // 2. Update DB
        await pool.query(
            "UPDATE orders SET payment_status = ?, status = ?, updated_at = NOW() WHERE id = ?",
            [newPaymentStatus, newOrderStatus, orderId]
        );

        // 3. Log
        await pool.query(
            "INSERT INTO order_status_logs (order_id, status, notes, created_at) VALUES (?, ?, ?, NOW())",
            [orderId, newOrderStatus, logNote]
        );

        // 3.5 Auto-record Finance
        await pool.query(
            "INSERT INTO finance_ledgers (order_id, type, category, description, amount, created_at) VALUES (?, 'INCOME', 'Pembayaran Klien', ?, ?, NOW())",
            [orderId, financeDesc, financeAmount]
        );

        // 4. Send Email
        if (clientEmail) {
            await sendEmail(clientEmail, clientName, emailSubject, emailBody)
                .catch(err => console.error('Brevo email failed:', err));
        }

        // 5. Auto-Trigger AI Kanban/PRD Generation (first payment only — DP or FULL)
        if (currentPaymentStatus !== 'dp_paid') {
            try {
                const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
                const [briefs]: any = await pool.query('SELECT * FROM client_briefs WHERE order_id = ?', [orderId]);
                const [existingTasks]: any = await pool.query('SELECT COUNT(*) as cnt FROM kanban_tasks WHERE order_id = ?', [orderId]);

                if (GEMINI_API_KEY && briefs.length > 0 && existingTasks[0].cnt === 0) {
                    const brief = briefs[0];
                    const geminiRes = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [{ parts: [{ text: `You are an expert System Architect. Break down this client project into actionable tasks for a Solo-Developer.\nProject: ${brief.project_name}\nBrief: ${brief.core_attributes}\nGithub: ${order.github_url || 'None'}\nOutput ONLY a raw JSON array like: [{"title": "...", "description": "..."}]. No markdown.` }] }],
                                generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
                                systemInstruction: { parts: [{ text: 'Output ONLY raw valid JSON arrays.' }] }
                            })
                        }
                    );
                    const gData = await geminiRes.json();
                    const rawText = gData?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
                    const tasks = JSON.parse(rawText.replace(/```json/gi, '').replace(/```/g, '').trim());
                    for (const t of tasks) {
                        await pool.query('INSERT INTO kanban_tasks (order_id, title, description, status) VALUES (?, ?, ?, "TODO")', [orderId, t.title || 'Untitled', t.description || '']);
                    }
                    console.log(`Auto-PRD: ${tasks.length} tasks generated for order ${orderId}`);
                }
            } catch (aiErr) {
                console.error('Auto-PRD generation failed (non-blocking):', aiErr);
            }

            // 6. AUTO-ASSIGN DEVELOPER ALGORITHM (Workload Balancer)
            try {
                const [developers]: any = await pool.query(`
                    SELECT u.id, u.name FROM users u 
                    INNER JOIN user_roles ur ON ur.user_id = u.id 
                    WHERE ur.role_id = 2 AND u.status = 'active'
                `);

                if (developers.length > 0) {
                    let bestDev = null;
                    let minScore = Infinity;

                    for (const dev of developers) {
                        let score = 0;
                        const [activeOrders]: any = await pool.query(`
                            SELECT o.id, COALESCE(p.price, o.total_amount) as package_price FROM orders o LEFT JOIN packages p ON o.package_id = p.id WHERE o.assigned_to = ? AND o.status NOT IN ('maintenance', 'completed', 'handover')
                        `, [dev.id]);

                        score += (activeOrders.length * 100);

                        for (const ao of activeOrders) {
                            score += (Number(ao.package_price) / 100000);
                            const [tasks]: any = await pool.query("SELECT status FROM kanban_tasks WHERE order_id = ?", [ao.id]);
                            for (const t of tasks) if (t.status === 'DOING') score += 10; else if (t.status === 'TODO') score += 5;
                        }

                        if (score < minScore) {
                            minScore = score;
                            bestDev = dev;
                        }
                    }

                    if (bestDev) {
                        await pool.query("UPDATE orders SET assigned_to = ? WHERE id = ?", [bestDev.id, orderId]);
                        await pool.query("INSERT INTO order_status_logs (order_id, status, notes, created_at) VALUES (?, ?, ?, NOW())", [orderId, 'Development', `System Auto-Pilot: Pesanan didelegasikan kepada ${bestDev.name} via AI Workload Balancer.`]);
                    }
                }
            } catch (balErr) {
                console.error('Auto-Assign Load Balancer failed (non-blocking):', balErr);
            }
        }

        const statusLabel = newPaymentStatus === 'paid' ? 'LUNAS' : 'DP DITERIMA';
        return NextResponse.json({
            success: true,
            message: `Pembayaran Order #${orderId} → ${statusLabel}.${clientEmail ? ' Email invoice dikirim ke ' + clientEmail : ' (Email klien kosong)'}`
        });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

// ──── Email HTML Builder ────
function buildEmailHTML(opts: {
    clientName: string; invoiceNumber: string; packageName: string; orderId: number;
    bannerIcon: string; bannerTitle: string; bannerSubtitle: string;
    bannerBg: string; bannerBorder: string; bannerTitleColor: string; bannerSubColor: string;
    rows: { label: string; value: string; highlight?: boolean }[];
    totalLabel: string; totalValue: string; totalColor: string;
    nextStepTitle: string; nextStepBody: string;
    nextStepBg: string; nextStepBorder: string; nextStepTitleColor: string; nextStepBodyColor: string;
    trackingUrl?: string;
}): string {
    const rowsHTML = [
        { label: 'No. Invoice', value: opts.invoiceNumber },
        { label: 'Paket Layanan', value: opts.packageName },
        { label: 'Order ID', value: `#${opts.orderId.toString().padStart(4, '0')}` },
        ...opts.rows,
    ].map((r, i) => `
        <tr style="background: ${i % 2 === 0 ? '#f1f5f9' : 'white'};">
            <td style="padding: 12px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">${r.label}</td>
            <td style="padding: 12px; font-size: 13px; font-weight: bold; text-align: right; border-bottom: 1px solid #e2e8f0; ${(r as any).highlight ? 'color: #059669;' : ''}">${r.value}</td>
        </tr>
    `).join('');

    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); padding: 32px; text-align: center;">
            <h1 style="color: #60a5fa; font-size: 28px; margin: 0;">WAVE PROJECTS</h1>
            <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0;">Digital Product Development Agency</p>
        </div>
        <div style="padding: 32px; background: white;">
            <div style="background: ${opts.bannerBg}; border: 1px solid ${opts.bannerBorder}; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 32px;">${opts.bannerIcon}</span>
                <h2 style="color: ${opts.bannerTitleColor}; margin: 8px 0 4px; font-size: 18px;">${opts.bannerTitle}</h2>
                <p style="color: ${opts.bannerSubColor}; margin: 0; font-size: 13px;">${opts.bannerSubtitle}</p>
            </div>
            <p style="color: #374151; font-size: 14px;">Halo <strong>${opts.clientName}</strong>,</p>
            <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
                ${rowsHTML}
                <tr>
                    <td style="padding: 16px 12px; font-size: 15px; font-weight: bold; color: #1e3a5f;">${opts.totalLabel}</td>
                    <td style="padding: 16px 12px; font-size: 18px; font-weight: bold; color: ${opts.totalColor}; text-align: right;">${opts.totalValue}</td>
                </tr>
            </table>
            <div style="background: ${opts.nextStepBg}; border: 1px solid ${opts.nextStepBorder}; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="color: ${opts.nextStepTitleColor}; font-size: 13px; margin: 0; font-weight: bold;">${opts.nextStepTitle}</p>
                <p style="color: ${opts.nextStepBodyColor}; font-size: 12px; margin: 8px 0 0; line-height: 1.6;">${opts.nextStepBody}</p>
            </div>
            <div style="text-align: center; margin: 24px 0;">
                <a href="https://wave-projects-center-id.vercel.app/track/${opts.orderId}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">🔍 Lacak Status Proyek Anda</a>
            </div>
            <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 32px;">
                Dokumen ini digenerate otomatis oleh sistem Wave Projects Center.ID<br/>Valid tanpa tanda tangan fisik.
            </p>
        </div>
        <div style="background: #0f172a; padding: 20px; text-align: center;">
            <p style="color: #64748b; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Wave Projects Center.ID — All Rights Reserved</p>
        </div>
    </div>`;
}
