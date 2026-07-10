import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS finance_ledgers (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                order_id BIGINT UNSIGNED NULL,
                type ENUM('INCOME', 'EXPENSE') NOT NULL,
                category VARCHAR(150),
                description TEXT,
                amount DECIMAL(15,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
            )
        `);

        // Get ledger
        const [ledger]: any = await pool.query("SELECT * FROM finance_ledgers ORDER BY created_at DESC");

        // Calculate summary
        let totalIncome = 0;
        let totalExpense = 0;
        ledger.forEach((l: any) => {
            const amt = Number(l.amount);
            if (l.type === 'INCOME') totalIncome += amt;
            else if (l.type === 'EXPENSE') totalExpense += amt;
        });
        const profit = totalIncome - totalExpense;

        return NextResponse.json({
            success: true,
            data: {
                summary: { totalIncome, totalExpense, profit },
                ledger
            }
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const body = await req.json();
        const { type, amount, category, description, orderId } = body;

        const _orderId = orderId ? Number(orderId) : null;

        await pool.query(
            "INSERT INTO finance_ledgers (order_id, type, category, description, amount) VALUES (?, ?, ?, ?, ?)",
            [_orderId, type, category, description, amount]
        );

        return NextResponse.json({ success: true, message: 'Transaction saved' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
