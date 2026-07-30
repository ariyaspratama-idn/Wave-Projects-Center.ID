import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        // Lazy migration for new columns just in case they don't exist
        try {
            await pool.query("ALTER TABLE packages ADD COLUMN tag VARCHAR(100) DEFAULT ''");
            await pool.query("ALTER TABLE packages ADD COLUMN `desc` TEXT");
            await pool.query("ALTER TABLE packages ADD COLUMN popular BOOLEAN DEFAULT FALSE");
            await pool.query("ALTER TABLE packages ADD COLUMN estimated_days INT DEFAULT 0");
        } catch (e) { }

        const [rows] = await pool.query('SELECT * FROM packages ORDER BY price ASC');

        const formatted = Array.isArray(rows) ? rows.map((r: any) => ({
            ...r,
            features: typeof r.code === 'string' ? JSON.parse(r.code) : (r.code || [])
        })) : [];

        return NextResponse.json({ success: true, data: formatted });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        // Lazy migration for POST to ensure we don't crash when adding from dashboard immediately
        try {
            await pool.query("ALTER TABLE packages ADD COLUMN tag VARCHAR(100) DEFAULT ''");
            await pool.query("ALTER TABLE packages ADD COLUMN `desc` TEXT");
            await pool.query("ALTER TABLE packages ADD COLUMN popular BOOLEAN DEFAULT FALSE");
            await pool.query("ALTER TABLE packages ADD COLUMN estimated_days INT DEFAULT 0");
        } catch (e) { }

        const body = await req.json();
        let { id, name, desc, price, estimated_days, tag, code, popular, active } = body;

        let isPopular = popular ? 1 : 0;
        let isActive = active === false ? 0 : 1;

        // Ensure features array is stringified to fit in the 'code' column mapped in our schema
        let codeStr = typeof code === 'string' ? code : JSON.stringify(code || []);

        if (id) {
            // Update existing
            await pool.query(
                "UPDATE packages SET name=?, `desc`=?, price=?, estimated_days=?, tag=?, code=?, popular=?, is_active=? WHERE id=?",
                [name, desc, price, estimated_days || 0, tag, codeStr, isPopular, isActive, id]
            );
        } else {
            // Insert new
            await pool.query(
                "INSERT INTO packages (name, `desc`, price, estimated_days, tag, code, popular, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [name, desc, price, estimated_days || 0, tag, codeStr, isPopular, isActive]
            );
        }

        return NextResponse.json({ success: true, message: 'Package saved successfully' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
