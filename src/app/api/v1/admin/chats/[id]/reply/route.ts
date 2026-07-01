import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const body = await req.json();
        const { message } = body;

        await pool.query(
            "INSERT INTO chat_messages (chat_session_id, sender, content) VALUES (?, ?, ?)",
            [params.id, 'admin', message]
        );

        return NextResponse.json({ success: true, message: 'Reply sent' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 401 });
    }
}
