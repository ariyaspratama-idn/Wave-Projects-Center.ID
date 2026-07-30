import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const revalidate = 0;

export async function GET() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS portfolios (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                image_url VARCHAR(500),
                live_link VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        const [rows]: any = await pool.query('SELECT * FROM portfolios ORDER BY created_at DESC');
        return NextResponse.json({ success: true, data: rows });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
