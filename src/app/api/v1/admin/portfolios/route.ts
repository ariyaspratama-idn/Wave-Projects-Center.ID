import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function POST(req: Request) {
    try {
        // Simple JWT check
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
        }
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const body = await req.json();
        const { title, description, image_url, live_link } = body;

        const [result]: any = await pool.query(
            "INSERT INTO portfolios (title, description, image_url, live_link) VALUES (?, ?, ?, ?)",
            [title, description, image_url, live_link]
        );

        return NextResponse.json({ success: true, message: 'Project inserted', data: { id: result.insertId } });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: e.name === 'JsonWebTokenError' ? 401 : 500 });
    }
}
