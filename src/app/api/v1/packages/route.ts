import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const revalidate = 0;

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT * FROM packages WHERE is_active = 1 ORDER BY price ASC');

        const formatted = Array.isArray(rows) ? rows.map((r: any) => ({
            ...r,
            features: typeof r.code === 'string' ? JSON.parse(r.code) : (r.code || [])
        })) : [];

        return NextResponse.json({
            success: true,
            data: formatted
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
