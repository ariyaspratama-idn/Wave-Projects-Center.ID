import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

async function ensureTableExists() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS ai_knowledge_base (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            content TEXT NOT NULL,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);
}

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        await ensureTableExists();

        // Custom SOP rules
        const [rows]: any = await pool.query('SELECT * FROM ai_knowledge_base ORDER BY id ASC');

        // Live package data the AI auto-learns
        let packages: any[] = [];
        try {
            const [pkgRows]: any = await pool.query("SELECT id, name, price, description, features, status FROM packages ORDER BY id ASC");
            packages = pkgRows;
        } catch (e) { }

        // Stats
        let stats = { totalChats: 0, totalMessages: 0, totalOrders: 0, totalPackages: 0 };
        try {
            const [chatCount]: any = await pool.query("SELECT COUNT(*) as c FROM chat_sessions");
            stats.totalChats = chatCount[0].c || 0;
        } catch (e) { }
        try {
            const [msgCount]: any = await pool.query("SELECT COUNT(*) as c FROM chat_messages");
            stats.totalMessages = msgCount[0].c || 0;
        } catch (e) { }
        try {
            const [ordCount]: any = await pool.query("SELECT COUNT(*) as c FROM orders");
            stats.totalOrders = ordCount[0].c || 0;
        } catch (e) { }
        stats.totalPackages = packages.length;

        return NextResponse.json({
            success: true,
            data: rows,
            packages,
            stats
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
        const { id, content, is_active } = body;

        await ensureTableExists();

        if (id) {
            await pool.query(
                "UPDATE ai_knowledge_base SET content = ?, is_active = ? WHERE id = ?",
                [content, is_active ? 1 : 0, id]
            );
        } else {
            if (!content) return NextResponse.json({ success: false, error: 'Content required' }, { status: 400 });
            await pool.query(
                "INSERT INTO ai_knowledge_base (content, is_active) VALUES (?, ?)",
                [content, is_active === undefined ? 1 : (is_active ? 1 : 0)]
            );
        }

        return NextResponse.json({ success: true, message: 'Aturan AI berhasil disimpan' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

        await pool.query("DELETE FROM ai_knowledge_base WHERE id = ?", [id]);

        return NextResponse.json({ success: true, message: 'Aturan dihapus' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
