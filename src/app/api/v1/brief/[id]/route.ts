import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const orderId = Number(params.id);
        const [orders]: any = await pool.query(`
            SELECT o.id, o.status, p.name as package_name, u.name as client_name
            FROM orders o
            LEFT JOIN packages p ON o.package_id = p.id
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `, [orderId]);
        if (orders.length === 0) return NextResponse.json({ success: false, error: 'Order Not Found' }, { status: 404 });

        const [briefs]: any = await pool.query("SELECT * FROM client_briefs WHERE order_id = ?", [orderId]);

        return NextResponse.json({ success: true, data: { order: orders[0], existingBrief: briefs.length > 0 ? briefs[0] : null } });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const orderId = Number(params.id);
        const body = await req.json();

        await pool.query(
            "INSERT INTO client_briefs (order_id, project_name, core_attributes) VALUES (?, ?, ?)",
            [orderId, body.projectName, JSON.stringify(body)]
        );

        // Advance the tracker
        await pool.query("UPDATE orders SET status = 'Quotation' WHERE id = ?", [orderId]);
        await pool.query(
            "INSERT INTO order_status_logs (order_id, status, notes) VALUES (?, ?, ?)",
            [orderId, 'Quotation', 'Klien telah mengirimkan Form Briefing. Menunggu review & quotation dari Admin.']
        );

        return NextResponse.json({ success: true, message: 'Brief submitted' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
