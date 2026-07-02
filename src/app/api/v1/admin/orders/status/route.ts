import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';
import { sendEmail } from '@/lib/email';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

// Branded email template builder
function buildEmailTemplate(clientName: string, orderNumber: string, status: string, statusLabel: string, message: string) {
    return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:auto;background:#0a0f1e;border-radius:16px;overflow:hidden;border:1px solid #1e293b;">
        <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:32px 24px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;">🌊 Wave Projects Center</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:13px;">Enterprise Agency ERP — Status Update</p>
        </div>
        <div style="padding:32px 24px;color:#e2e8f0;">
            <p style="font-size:15px;">Halo <strong>${clientName}</strong>,</p>
            <div style="background:#1e293b;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid #2563eb;">
                <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Order #${orderNumber}</p>
                <p style="margin:0;font-size:18px;font-weight:bold;color:#60a5fa;">${statusLabel}</p>
            </div>
            <p style="font-size:14px;line-height:1.7;color:#cbd5e1;">${message}</p>
            <hr style="border:none;border-top:1px solid #1e293b;margin:24px 0;">
            <p style="font-size:11px;color:#64748b;text-align:center;">Email ini dikirim secara otomatis oleh sistem Wave Projects Center.<br/>Jangan membalas email ini. Hubungi kami via WhatsApp jika ada pertanyaan.</p>
        </div>
    </div>`;
}

// Status to human label & message mapping
const STATUS_EMAIL_MAP: Record<string, { label: string; message: string }> = {
    'Down Payment': {
        label: '💰 Down Payment Diterima',
        message: 'Terima kasih! Pembayaran DP Anda telah kami terima dan diverifikasi. Tim kami akan segera memulai proses pengerjaan proyek Anda. Anda akan menerima notifikasi lagi saat proyek memasuki tahap Development.'
    },
    'Development': {
        label: '⚙️ Proyek Sedang Dikerjakan',
        message: 'Proyek Anda kini telah memasuki tahap pengerjaan aktif oleh tim developer kami. Anda dapat memantau progress secara real-time melalui link tracking yang telah diberikan sebelumnya.'
    },
    'Testing': {
        label: '🧪 Tahap Pengujian',
        message: 'Proyek Anda telah selesai dikoding dan sekarang memasuki fase Quality Assurance (QA). Tim kami sedang menguji semua fitur secara menyeluruh untuk memastikan kualitas terbaik.'
    },
    'Revision': {
        label: '🔄 Revisi Aktif',
        message: 'Berdasarkan hasil pengujian, kami sedang melakukan penyempurnaan pada beberapa bagian proyek Anda. Anda akan segera mendapatkan update setelah revisi selesai.'
    },
    'Final Payment': {
        label: '📋 Menunggu Pelunasan',
        message: 'Selamat! Proyek Anda telah melewati tahap pengujian dan revisi. Silakan melakukan pelunasan sisa pembayaran agar kami dapat melanjutkan ke tahap serah terima (handover).'
    },
    'Handover': {
        label: '🎉 Serah Terima Proyek',
        message: 'Proyek Anda telah SELESAI dan berhasil diserahterimakan! Semua akses, source code, dan dokumentasi telah dikirimkan. Terima kasih telah mempercayakan proyek Anda kepada Wave Projects Center. 🚀'
    }
};

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const body = await req.json();
        const { orderId, status, notes } = body;

        // 1. Update the main order status
        await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);

        // 2. Insert into the audit trail (order_status_logs)
        await pool.query(
            "INSERT INTO order_status_logs (order_id, status, notes) VALUES (?, ?, ?)",
            [orderId, status, notes || 'Updated via ERP Dashboard']
        );

        // 3. Brevo Auto-Email Trigger (fire & forget for key milestones)
        if (STATUS_EMAIL_MAP[status]) {
            try {
                const [orders]: any = await pool.query(
                    "SELECT client_name, client_email, order_number FROM orders WHERE id = ?", [orderId]
                );
                const order = orders[0];

                if (order?.client_email) {
                    const { label, message } = STATUS_EMAIL_MAP[status];
                    const html = buildEmailTemplate(
                        order.client_name || 'Klien',
                        order.order_number || String(orderId),
                        status,
                        label,
                        message
                    );
                    // Fire & forget — don't let email failure block the status update
                    sendEmail(order.client_email, order.client_name || 'Klien', `[Wave Projects] ${label}`, html)
                        .catch(err => console.error('Brevo send error (non-blocking):', err));
                }
            } catch (emailErr) {
                console.error('Email lookup error (non-blocking):', emailErr);
            }
        }

        return NextResponse.json({ success: true, message: 'Status tracked successfully' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
