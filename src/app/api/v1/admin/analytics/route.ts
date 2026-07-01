import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        // 1. Total Revenue
        const [revResult]: any = await pool.query('SELECT SUM(total_amount) as total FROM orders');
        const totalRevenue = revResult[0].total || 0;

        // 2. Total Orders
        const [ordResult]: any = await pool.query('SELECT COUNT(*) as count FROM orders');
        const totalOrders = ordResult[0].count || 0;

        // 3. Total Chat Sessions
        const [chatResult]: any = await pool.query('SELECT COUNT(*) as count FROM chat_sessions');
        const totalChats = chatResult[0].count || 0;

        // 4. Trendline (Revenue by Date for the LineChart)
        const [trendRows]: any = await pool.query(`
            SELECT DATE(created_at) as date, SUM(total_amount) as daily_revenue 
            FROM orders 
            GROUP BY DATE(created_at) 
            ORDER BY date ASC 
            LIMIT 7
        `);

        // 5. Popular Packages (PieChart)
        const [packageRows]: any = await pool.query(`
            SELECT p.name, COUNT(o.id) as value 
            FROM orders o 
            JOIN packages p ON o.package_id = p.id 
            GROUP BY p.name
        `);

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalRevenue,
                    totalOrders,
                    totalChats
                },
                trend: trendRows.map((r: any) => ({
                    date: new Date(r.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
                    revenue: r.daily_revenue || 0
                })),
                packagesDemand: packageRows.map((r: any) => ({
                    name: r.name,
                    value: r.value
                }))
            }
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 401 });
    }
}
