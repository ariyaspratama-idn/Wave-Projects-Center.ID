import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const body = await req.json();
        let { id, name, desc, price, tag, code, popular, active } = body;

        let isPopular = popular ? 1 : 0;
        let isActive = active === false ? 0 : 1;

        // Ensure features array is stringified to fit in the 'code' column mapped in our schema
        let codeStr = typeof code === 'string' ? code : JSON.stringify(code || []);

        if (id) {
            // Update existing
            await pool.query(
                "UPDATE packages SET name=?, `desc`=?, price=?, tag=?, code=?, popular=?, is_active=? WHERE id=?",
                [name, desc, price, tag, codeStr, isPopular, isActive, id]
            );
        } else {
            // Insert new
            await pool.query(
                "INSERT INTO packages (name, `desc`, price, tag, code, popular, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [name, desc, price, tag, codeStr, isPopular, isActive]
            );
        }

        return NextResponse.json({ success: true, message: 'Package saved successfully' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
