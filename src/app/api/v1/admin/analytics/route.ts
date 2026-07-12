import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        // 1. Revenue Summary
        const [revResult]: any = await pool.query('SELECT SUM(total_amount) as total FROM orders');
        const totalRevenue = revResult[0].total || 0;

        // 2. Paid Revenue (only confirmed)
        const [paidResult]: any = await pool.query("SELECT SUM(total_amount) as total FROM orders WHERE payment_status = 'paid'");
        const paidRevenue = paidResult[0].total || 0;

        // 3. Pending Revenue (unpaid + dp_paid + waiting)
        const pendingRevenue = totalRevenue - paidRevenue;

        // 4. Total Orders
        const [ordResult]: any = await pool.query('SELECT COUNT(*) as count FROM orders');
        const totalOrders = ordResult[0].count || 0;

        // 5. Payment Status Breakdown
        const [payStatusRows]: any = await pool.query(`
            SELECT payment_status, COUNT(*) as count, SUM(total_amount) as amount
            FROM orders GROUP BY payment_status
        `);

        // 6. Order Status Breakdown
        const [ordStatusRows]: any = await pool.query(`
            SELECT status, COUNT(*) as count
            FROM orders GROUP BY status
        `);

        // 7. Total Chat Sessions
        const [chatResult]: any = await pool.query('SELECT COUNT(*) as count FROM chat_sessions');
        const totalChats = chatResult[0].count || 0;

        // 8. Revenue Trend (Last 14 days)
        const [trendRows]: any = await pool.query(`
            SELECT DATE(created_at) as date, SUM(total_amount) as daily_revenue, COUNT(*) as daily_orders
            FROM orders
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
            GROUP BY DATE(created_at) ORDER BY date ASC
        `);

        // 9. Package Demand
        const [packageRows]: any = await pool.query(`
            SELECT p.name, COUNT(o.id) as count, SUM(o.total_amount) as revenue
            FROM orders o JOIN packages p ON o.package_id = p.id GROUP BY p.name ORDER BY count DESC
        `);

        // 10. Recent Orders (last 5)
        const [recentOrders]: any = await pool.query(`
            SELECT o.id, COALESCE(NULLIF(o.client_name, ''), u.name, 'Guest') as client_name,
                p.name as package_name, o.status, o.payment_status, o.payment_choice,
                o.total_amount, o.created_at
            FROM orders o
            LEFT JOIN packages p ON o.package_id = p.id
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.id DESC LIMIT 5
        `);

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalRevenue,
                    paidRevenue,
                    pendingRevenue,
                    totalOrders,
                    totalChats
                },
                paymentBreakdown: payStatusRows.map((r: any) => ({
                    status: r.payment_status || 'unknown',
                    count: r.count,
                    amount: r.amount || 0
                })),
                orderStatusBreakdown: ordStatusRows.map((r: any) => ({
                    status: r.status || 'unknown',
                    count: r.count
                })),
                trend: trendRows.map((r: any) => ({
                    date: new Date(r.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
                    revenue: r.daily_revenue || 0,
                    orders: r.daily_orders || 0
                })),
                packagesDemand: packageRows.map((r: any) => ({
                    name: r.name,
                    count: r.count,
                    revenue: r.revenue || 0
                })),
                recentOrders: recentOrders.map((r: any) => ({
                    id: r.id,
                    client: r.client_name,
                    package: r.package_name,
                    status: r.status,
                    paymentStatus: r.payment_status,
                    paymentChoice: r.payment_choice,
                    amount: r.total_amount,
                    date: new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                }))
            }
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 401 });
    }
}
