import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const [rows]: any = await pool.query('SELECT * FROM financial_ledger ORDER BY created_at DESC');

        // Calculate Profit/Loss
        let totalIncome = 0;
        let totalExpense = 0;
        rows.forEach((r: any) => {
            if (r.type === 'INCOME') totalIncome += Number(r.amount);
            if (r.type === 'EXPENSE') totalExpense += Number(r.amount);
        });
        const profit = totalIncome - totalExpense;

        return NextResponse.json({
            success: true,
            data: { ledger: rows, summary: { totalIncome, totalExpense, profit } }
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
        const { orderId, type, amount, category, description } = body;

        if (!type || !amount || !category) {
            return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
        }

        await pool.query(
            "INSERT INTO financial_ledger (order_id, type, amount, category, description) VALUES (?, ?, ?, ?, ?)",
            [orderId || null, type, amount, category, description || '']
        );

        return NextResponse.json({ success: true, message: 'Ledger entry saved' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
