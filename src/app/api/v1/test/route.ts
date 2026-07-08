import { NextResponse } from 'next/server';
import pool from '@/lib/db';
export async function GET() {
    try {
        const [cols]: any = await pool.query("SHOW COLUMNS FROM packages");
        return NextResponse.json({ success: true, columns: cols.map((c: any) => c.Field) });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
