import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const { id } = await params;
        const orderId = Number(id);

        const [orderRows]: any = await pool.query("SELECT * FROM orders WHERE id = ?", [orderId]);
        if (orderRows.length === 0) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });

        const [developers]: any = await pool.query(`
            SELECT u.id, u.name, u.telegram_id 
            FROM users u 
            INNER JOIN user_roles ur ON ur.user_id = u.id 
            WHERE ur.role_id = 2
        `);

        if (developers.length === 0) {
            return NextResponse.json({ success: false, error: 'Tidak ada developer yang terdaftar di basis data Anda.' }, { status: 400 });
        }

        let bestDev = null;
        let minScore = Infinity;
        let scoreLog = [];

        for (const dev of developers) {
            let score = 0;

            const [activeOrders]: any = await pool.query(`
                SELECT o.id, COALESCE(p.price, o.total_amount) as package_price
                FROM orders o
                LEFT JOIN packages p ON o.package_id = p.id
                WHERE o.assigned_to = ? AND o.status NOT IN ('maintenance', 'completed', 'handover')
            `, [dev.id]);

            score += (activeOrders.length * 100);

            for (const ao of activeOrders) {
                score += (Number(ao.package_price) / 100000);
                const [tasks]: any = await pool.query("SELECT status FROM kanban_tasks WHERE order_id = ?", [ao.id]);
                for (const t of tasks) {
                    if (t.status === 'DOING') score += 10;
                    if (t.status === 'TODO') score += 5;
                }
            }

            scoreLog.push({ name: dev.name, score: score.toFixed(1) });

            if (score < minScore) {
                minScore = score;
                bestDev = dev;
            }
        }

        if (!bestDev) {
            return NextResponse.json({ success: false, error: 'Gagal menganalisis workload developer.' }, { status: 500 });
        }

        await pool.query("UPDATE orders SET assigned_to = ? WHERE id = ?", [bestDev.id, orderId]);

        return NextResponse.json({
            success: true,
            message: `Order Otomatis Ditransfer ke [${bestDev.name}] dengan Beban Terkecil!`,
            data: { assignedDeveloper: bestDev.name, logs: scoreLog }
        });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
