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

        const [orders]: any = await pool.query(
            `SELECT o.*, p.name as package_name, p.price as package_price 
             FROM orders o LEFT JOIN packages p ON o.package_id = p.id 
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
        const dpAmount = Math.round(fullPrice * 0.3);
        const remainingAmount = fullPrice - dpAmount;

        if (!clientEmail) {
            return NextResponse.json({ success: false, error: 'Email klien kosong! Isi dulu via Edit Kontak di panel.' }, { status: 400 });
        }

        // Build email based on current payment status
        let subject: string;
        let html: string;

        if (order.payment_status === 'paid') {
            subject = `✅ Invoice ${invoiceNumber} — Pembayaran LUNAS | Wave Projects`;
            html = buildInvoiceEmail(clientName, invoiceNumber, packageName, orderId, fullPrice, 'LUNAS', isDP ? dpAmount : null, isDP ? remainingAmount : null);
        } else if (order.payment_status === 'dp_paid') {
            subject = `🟠 Invoice ${invoiceNumber} — DP 30% Diterima | Sisa: Rp ${remainingAmount.toLocaleString('id-ID')}`;
            html = buildDPEmail(clientName, invoiceNumber, packageName, orderId, dpAmount, remainingAmount, fullPrice);
        } else {
            subject = `📋 Invoice ${invoiceNumber} — Tagihan Pembayaran | Wave Projects`;
            html = buildInvoiceEmail(clientName, invoiceNumber, packageName, orderId, Number(order.total_amount), 'BELUM BAYAR', null, null);
        }

        const result = await sendEmail(clientEmail, clientName, subject, html);

        if (result.success) {
            return NextResponse.json({ success: true, message: `Invoice berhasil dikirim ulang ke ${clientEmail}` });
        } else {
            return NextResponse.json({ success: false, error: `Brevo gagal: ${result.error}` }, { status: 500 });
        }

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

function buildInvoiceEmail(name: string, inv: string, pkg: string, oid: number, amount: number, status: string, dp: number | null, sisa: number | null): string {
    const rows = dp !== null ? `
        <tr style="background:#f1f5f9;"><td style="padding:12px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;">DP Awal (30%)</td><td style="padding:12px;font-size:13px;font-weight:bold;text-align:right;border-bottom:1px solid #e2e8f0;">Rp ${dp!.toLocaleString('id-ID')}</td></tr>
        <tr><td style="padding:12px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;">Pelunasan (70%)</td><td style="padding:12px;font-size:13px;font-weight:bold;text-align:right;border-bottom:1px solid #e2e8f0;">Rp ${sisa!.toLocaleString('id-ID')}</td></tr>
    ` : '';
    return `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;">
        <div style="background:linear-gradient(135deg,#1e3a5f,#0f172a);padding:32px;text-align:center;">
            <h1 style="color:#60a5fa;font-size:28px;margin:0;">WAVE PROJECTS</h1>
            <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">Digital Product Development Agency</p>
        </div>
        <div style="padding:32px;background:white;">
            <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:16px;text-align:center;margin-bottom:24px;">
                <span style="font-size:32px;">${status === 'LUNAS' ? '✅' : '📋'}</span>
                <h2 style="color:#065f46;margin:8px 0 4px;font-size:18px;">${status === 'LUNAS' ? 'Pembayaran LUNAS!' : 'Invoice Tagihan'}</h2>
            </div>
            <p style="color:#374151;font-size:14px;">Halo <strong>${name}</strong>,</p>
            <table style="width:100%;border-collapse:collapse;margin:24px 0;">
                <tr style="background:#f1f5f9;"><td style="padding:12px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;">No. Invoice</td><td style="padding:12px;font-size:13px;font-weight:bold;text-align:right;border-bottom:1px solid #e2e8f0;">${inv}</td></tr>
                <tr><td style="padding:12px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;">Paket</td><td style="padding:12px;font-size:13px;font-weight:bold;text-align:right;border-bottom:1px solid #e2e8f0;">${pkg}</td></tr>
                <tr style="background:#f1f5f9;"><td style="padding:12px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;">Order ID</td><td style="padding:12px;font-size:13px;font-weight:bold;text-align:right;border-bottom:1px solid #e2e8f0;">#${oid.toString().padStart(4, '0')}</td></tr>
                ${rows}
                <tr><td style="padding:16px 12px;font-size:15px;font-weight:bold;color:#1e3a5f;">TOTAL</td><td style="padding:16px 12px;font-size:18px;font-weight:bold;color:${status === 'LUNAS' ? '#059669' : '#dc2626'};text-align:right;">Rp ${amount.toLocaleString('id-ID')}</td></tr>
            </table>
            <p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:32px;">Dokumen ini digenerate otomatis oleh Wave Projects Center.ID</p>
        </div>
        <div style="background:#0f172a;padding:20px;text-align:center;"><p style="color:#64748b;font-size:11px;margin:0;">© ${new Date().getFullYear()} Wave Projects Center.ID</p></div>
    </div>`;
}

function buildDPEmail(name: string, inv: string, pkg: string, oid: number, dp: number, sisa: number, full: number): string {
    return `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;">
        <div style="background:linear-gradient(135deg,#1e3a5f,#0f172a);padding:32px;text-align:center;">
            <h1 style="color:#60a5fa;font-size:28px;margin:0;">WAVE PROJECTS</h1>
            <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">Digital Product Development Agency</p>
        </div>
        <div style="padding:32px;background:white;">
            <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:16px;text-align:center;margin-bottom:24px;">
                <span style="font-size:32px;">✅</span>
                <h2 style="color:#065f46;margin:8px 0 4px;font-size:18px;">DP 30% Berhasil Diterima!</h2>
            </div>
            <p style="color:#374151;font-size:14px;">Halo <strong>${name}</strong>,</p>
            <table style="width:100%;border-collapse:collapse;margin:24px 0;">
                <tr style="background:#f1f5f9;"><td style="padding:12px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;">No. Invoice</td><td style="padding:12px;font-size:13px;font-weight:bold;text-align:right;border-bottom:1px solid #e2e8f0;">${inv}</td></tr>
                <tr><td style="padding:12px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;">Paket</td><td style="padding:12px;font-size:13px;font-weight:bold;text-align:right;border-bottom:1px solid #e2e8f0;">${pkg}</td></tr>
                <tr style="background:#f1f5f9;"><td style="padding:12px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;">DP Dibayar (30%)</td><td style="padding:12px;font-size:13px;font-weight:bold;text-align:right;border-bottom:1px solid #e2e8f0;color:#059669;">Rp ${dp.toLocaleString('id-ID')}</td></tr>
                <tr><td style="padding:12px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;">Harga Paket Penuh</td><td style="padding:12px;font-size:13px;font-weight:bold;text-align:right;border-bottom:1px solid #e2e8f0;">Rp ${full.toLocaleString('id-ID')}</td></tr>
                <tr style="background:#fef3c7;"><td style="padding:16px 12px;font-size:15px;font-weight:bold;color:#92400e;">SISA TAGIHAN</td><td style="padding:16px 12px;font-size:18px;font-weight:bold;color:#dc2626;text-align:right;">Rp ${sisa.toLocaleString('id-ID')}</td></tr>
            </table>
            <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin:24px 0;">
                <p style="color:#92400e;font-size:13px;margin:0;font-weight:bold;">⚠️ Sisa Pembayaran</p>
                <p style="color:#b45309;font-size:12px;margin:8px 0 0;line-height:1.6;">Sisa tagihan sebesar <strong>Rp ${sisa.toLocaleString('id-ID')}</strong> wajib dilunasi sebelum proyek diserahkan.</p>
            </div>
            <p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:32px;">Dokumen ini digenerate otomatis oleh Wave Projects Center.ID</p>
        </div>
        <div style="background:#0f172a;padding:20px;text-align:center;"><p style="color:#64748b;font-size:11px;margin:0;">© ${new Date().getFullYear()} Wave Projects Center.ID</p></div>
    </div>`;
}
