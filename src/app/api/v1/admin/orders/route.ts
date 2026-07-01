import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const decoded: any = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        let query = `
            SELECT o.*, u.name as user_name, u.email as user_email, p.name as package_name 
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN packages p ON o.package_id = p.id
        `;
        let params: any[] = [];

        // If customer, only fetch their own orders
        if (decoded.roles && decoded.roles[0].name === 'Customer') {
            query += ` WHERE o.user_id = ? ORDER BY o.created_at DESC`;
            params.push(decoded.userId);
        } else {
            query += ` ORDER BY o.created_at DESC`;
        }

        const [orders]: any = await pool.query(query, params);

        // For ERP, we also want the internal notes and status logs
        // This is inefficient via N+1 queries if there are 1000 orders, but fine for now.
        for (let order of orders) {
            const [logs]: any = await pool.query("SELECT * FROM order_status_logs WHERE order_id = ? ORDER BY created_at ASC", [order.id]);
            order.status_logs = logs;

            // Internal notes (only internal staff can see them, not customers)
            if (decoded.roles && decoded.roles[0].name !== 'Customer') {
                const [notes]: any = await pool.query(`
                    SELECT n.*, u.name as author 
                    FROM internal_project_notes n
                    JOIN users u ON n.user_id = u.id
                    WHERE n.order_id = ? 
                    ORDER BY n.created_at DESC
                 `, [order.id]);
                order.internal_notes = notes;
            } else {
                order.internal_notes = [];
            }
        }

        return NextResponse.json({ success: true, data: orders });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
