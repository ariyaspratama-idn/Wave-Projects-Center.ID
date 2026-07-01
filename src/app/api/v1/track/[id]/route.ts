import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const orderId = Number(params.id);
        if (!orderId || isNaN(orderId)) return NextResponse.json({ success: false, error: 'Invalid Token' }, { status: 400 });

        const [orders]: any = await pool.query(`
            SELECT o.id, o.status, o.total_amount, p.name as package_name, u.name as client_name
            FROM orders o
            LEFT JOIN packages p ON o.package_id = p.id
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `, [orderId]);

        if (orders.length === 0) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });

        const [logs]: any = await pool.query("SELECT status, notes, created_at FROM order_status_logs WHERE order_id = ? ORDER BY created_at ASC", [orderId]);

        return NextResponse.json({
            success: true,
            data: { ...orders[0], logs }
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: 'System Error' }, { status: 500 });
    }
}
