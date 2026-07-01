import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const body = await req.json(); // { settings: { hero_subtitle: "...", ... } }
        const { settings } = body;

        if (!settings || typeof settings !== 'object') {
            return NextResponse.json({ success: false, error: 'Invalid settings payload' }, { status: 400 });
        }

        // Mass update or insert
        for (const [key, value] of Object.entries(settings)) {
            await pool.query(
                "INSERT INTO agency_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
                [key, value, value]
            );
        }

        return NextResponse.json({ success: true, message: 'Settings saved successfully' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
