import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { order_id, receipt_url, receipt_public_id } = body;

        if (!order_id || !receipt_url) {
            return NextResponse.json({ success: false, message: 'Missing required parameters' }, { status: 400 });
        }

        // 1. Update the order payment_status to 'waiting_verification'
        await pool.query(
            "UPDATE orders SET payment_status = 'waiting_verification', updated_at = NOW() WHERE id = ?",
            [order_id]
        );

        // 2. Insert into the audit trail (order_status_logs)
        await pool.query(
            "INSERT INTO order_status_logs (order_id, status, notes) VALUES (?, ?, ?)",
            [order_id, 'Waiting Verification', 'Klien telah mengunggah bukti pembayaran transfer bank.']
        );

        // 3. Insert attachment reference into database for Super Admin to see
        await pool.query(
            "INSERT INTO attachments (order_id, cloudinary_public_id, file_name, secure_url) VALUES (?, ?, ?, ?)",
            [order_id, receipt_public_id || 'payment_receipt', 'Bukti_Pembayaran', receipt_url]
        );

        return NextResponse.json({ success: true, message: 'Payment receipt uploaded successfully' });
    } catch (e: any) {
        return NextResponse.json({ success: false, message: e.message, error: e.message }, { status: 500 });
    }
}
