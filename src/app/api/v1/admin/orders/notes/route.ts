import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        const decoded: any = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const body = await req.json();
        const { orderId, note } = body;

        await pool.query(
            "INSERT INTO internal_project_notes (order_id, user_id, note) VALUES (?, ?, ?)",
            [orderId, decoded.userId, note]
        );

        return NextResponse.json({ success: true, message: 'Note added' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
