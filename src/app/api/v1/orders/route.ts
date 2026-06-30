import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET); // Will throw if invalid

        // Get orders natively
        const [rows]: any = await pool.query(`
            SELECT 
                orders.*, 
                packages.name as package_name 
            FROM orders 
            LEFT JOIN packages ON orders.package_id = packages.id 
            ORDER BY orders.created_at DESC
        `);

        // Format according to dashboard expected keys
        const formattedOrders = rows.map((r: any) => ({
            id: r.id,
            title: r.project_purpose || r.package_name || 'Project Request',
            order_number: r.order_number,
            status: r.status,
            package_id: r.package_id,
            payment_type: r.payment_choice === 'DP_30' ? 'dp' : 'full',
            client_name: r.client_name,
            whatsapp: r.client_whatsapp,
            total_amount: r.total_amount
        }));

        return NextResponse.json({
            success: true,
            data: formattedOrders
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, message: 'Unauthorized or DB error', error: e.message }, { status: 401 });
    }
}
