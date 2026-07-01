import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const [rows]: any = await pool.query(
            "SELECT * FROM chat_messages WHERE chat_session_id = ? ORDER BY created_at ASC",
            [params.id]
        );

        return NextResponse.json({ success: true, data: rows });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 401 });
    }
}
