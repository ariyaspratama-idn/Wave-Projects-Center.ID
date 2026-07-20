import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        // Auto-migration for schema update
        try {
            await pool.query("ALTER TABLE chat_sessions ADD COLUMN needs_human BOOLEAN DEFAULT FALSE");
        } catch (migErr) {
            // Ignore if column already exists
        }

        const [rows]: any = await pool.query(`
            SELECT cs.*, 
                   (SELECT content FROM chat_messages cm WHERE cm.chat_session_id = cs.id ORDER BY created_at DESC LIMIT 1) as last_message,
                   (SELECT created_at FROM chat_messages cm WHERE cm.chat_session_id = cs.id ORDER BY created_at DESC LIMIT 1) as last_message_time
            FROM chat_sessions cs
            WHERE cs.needs_human = 1
            ORDER BY last_message_time DESC
        `);

        return NextResponse.json({ success: true, data: rows });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 401 });
    }
}
