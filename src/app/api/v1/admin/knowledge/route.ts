import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const [rows]: any = await pool.query("SELECT * FROM ai_knowledge_base ORDER BY id DESC");
        return NextResponse.json({ success: true, data: rows });
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
        const { rule_category = 'sop', content, is_active = true } = body;

        const [result]: any = await pool.query(
            "INSERT INTO ai_knowledge_base (rule_category, content, is_active, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
            [rule_category, content, is_active ? 1 : 0]
        );

        return NextResponse.json({ success: true, message: 'Knowledge created successfully', id: result.insertId });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
