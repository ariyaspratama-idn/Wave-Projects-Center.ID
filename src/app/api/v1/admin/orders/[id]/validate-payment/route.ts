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

        // 1. Fetch the order details
        const [orders]: any = await pool.query(
            `SELECT o.*, p.name as package_name 
             FROM orders o 
             LEFT JOIN packages p ON o.package_id = p.id 
             WHERE o.id = ?`, [orderId]
        );
        if (orders.length === 0) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });

        const order = orders[0];

        // 2. Mark payment as PAID
        await pool.query("UPDATE orders SET payment_status = 'paid', status = 'Down Payment', updated_at = NOW() WHERE id = ?", [orderId]);

        // 3. Log status change
        await pool.query(
            "INSERT INTO order_status_logs (order_id, status, notes, created_at) VALUES (?, ?, ?, NOW())",
            [orderId, 'Down Payment', 'Pembayaran telah diverifikasi dan disetujui oleh Super Admin.']
        );

        // 4. Send Invoice Email via Brevo
        const clientEmail = order.client_email;
        const clientName = order.client_name || 'Klien';
        const packageName = order.package_name || 'Paket Kustom';
        const totalAmount = Number(order.total_amount).toLocaleString('id-ID');
        const invoiceNumber = `INV-${new Date().getFullYear()}-${orderId.toString().padStart(4, '0')}`;

        if (clientEmail) {
            const htmlContent = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
                <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); padding: 32px; text-align: center;">
                    <h1 style="color: #60a5fa; font-size: 28px; margin: 0;">WAVE PROJECTS</h1>
                    <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0;">Digital Product Development Agency</p>
                </div>
                
                <div style="padding: 32px; background: white;">
                    <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
                        <span style="font-size: 32px;">✅</span>
                        <h2 style="color: #065f46; margin: 8px 0 4px; font-size: 18px;">Pembayaran Berhasil Diverifikasi!</h2>
                        <p style="color: #047857; margin: 0; font-size: 13px;">Dana Anda telah kami terima dan konfirmasi.</p>
                    </div>

                    <p style="color: #374151; font-size: 14px;">Halo <strong>${clientName}</strong>,</p>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                        Terima kasih telah mempercayakan proyek Anda kepada Wave Projects Center. 
                        Pembayaran Anda telah berhasil diverifikasi oleh tim kami. Berikut adalah rincian faktur resmi Anda:
                    </p>

                    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
                        <tr style="background: #f1f5f9;">
                            <td style="padding: 12px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">No. Invoice</td>
                            <td style="padding: 12px; font-size: 13px; font-weight: bold; text-align: right; border-bottom: 1px solid #e2e8f0;">${invoiceNumber}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Paket Layanan</td>
                            <td style="padding: 12px; font-size: 13px; font-weight: bold; text-align: right; border-bottom: 1px solid #e2e8f0;">${packageName}</td>
                        </tr>
                        <tr style="background: #f1f5f9;">
                            <td style="padding: 12px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Order ID</td>
                            <td style="padding: 12px; font-size: 13px; font-weight: bold; text-align: right; border-bottom: 1px solid #e2e8f0;">#${orderId.toString().padStart(4, '0')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 16px 12px; font-size: 15px; font-weight: bold; color: #1e3a5f;">TOTAL DIBAYAR</td>
                            <td style="padding: 16px 12px; font-size: 18px; font-weight: bold; color: #059669; text-align: right;">Rp ${totalAmount}</td>
                        </tr>
                    </table>

                    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 24px 0;">
                        <p style="color: #1e40af; font-size: 13px; margin: 0; font-weight: bold;">📋 Apa Selanjutnya?</p>
                        <p style="color: #3b82f6; font-size: 12px; margin: 8px 0 0; line-height: 1.6;">
                            Tim kami akan segera memulai pengerjaan proyek Anda. Dokumen PRD (Product Requirement Document) 
                            akan segera disiapkan oleh sistem AI kami dan dikirimkan kepada developer yang ditugaskan.
                        </p>
                    </div>

                    <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 32px;">
                        Dokumen ini digenerate secara otomatis oleh sistem Wave Projects Center.ID<br/>
                        Valid tanpa tanda tangan fisik.
                    </p>
                </div>

                <div style="background: #0f172a; padding: 20px; text-align: center;">
                    <p style="color: #64748b; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Wave Projects Center.ID — All Rights Reserved</p>
                </div>
            </div>`;

            await sendEmail(
                clientEmail,
                clientName,
                `✅ Invoice ${invoiceNumber} — Pembayaran Anda Telah Dikonfirmasi | Wave Projects`,
                htmlContent
            ).catch(err => console.error('Brevo email failed:', err));
        }

        return NextResponse.json({
            success: true,
            message: `Pembayaran untuk Order #${orderId} telah divalidasi.${clientEmail ? ' Invoice telah dikirim ke ' + clientEmail : ' (Email klien kosong, invoice tidak terkirim)'}`
        });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
