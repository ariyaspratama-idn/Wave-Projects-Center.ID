import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

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

        return NextResponse.json({ success: true, message: 'Status tracked successfully' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
