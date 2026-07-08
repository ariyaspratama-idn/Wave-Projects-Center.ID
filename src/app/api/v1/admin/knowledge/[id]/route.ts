import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const body = await req.json();
        const { rule_category, content, is_active } = body;

        await pool.query(
            "UPDATE ai_knowledge_base SET rule_category=?, content=?, is_active=?, updated_at=NOW() WHERE id=?",
            [rule_category, content, is_active ? 1 : 0, params.id]
        );

        return NextResponse.json({ success: true, message: 'Knowledge updated successfully' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        await pool.query("DELETE FROM ai_knowledge_base WHERE id=?", [params.id]);
        return NextResponse.json({ success: true, message: 'Knowledge deleted successfully' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
