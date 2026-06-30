import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);

        const [rows]: any = await pool.query('SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1', [decoded.id]);
        const user = rows[0];

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: user
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, message: 'Token invalid or expired' }, { status: 401 });
    }
}
