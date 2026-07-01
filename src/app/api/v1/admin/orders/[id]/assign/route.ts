import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const orderId = Number(params.id);
        const { assignedTo } = await req.json();

        // Ensure user belongs to the Database and isn't falsified
        if (assignedTo) {
            const [users]: any = await pool.query("SELECT id FROM users WHERE id = ? AND role_id = 2", [assignedTo]);
            if (users.length === 0) return NextResponse.json({ success: false, error: 'Developer Invalid' }, { status: 400 });
        }

        await pool.query(
            "UPDATE orders SET assigned_to = ? WHERE id = ?",
            [assignedTo || null, orderId]
        );

        return NextResponse.json({ success: true, message: 'Assignasi Developer berhasil diubah.' });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
