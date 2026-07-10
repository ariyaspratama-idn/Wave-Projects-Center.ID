import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const revalidate = 0; // Disable static caching so changes appear instantly

export async function GET() {
    try {
        const [rows]: any = await pool.query('SELECT setting_key, setting_value FROM system_settings');

        // Convert array of pairs to a single object map
        const settingsMap: Record<string, any> = {};
        for (let r of rows) {
            try {
                settingsMap[r.setting_key] = typeof r.setting_value === 'string' ? JSON.parse(r.setting_value) : r.setting_value;
            } catch (e) {
                settingsMap[r.setting_key] = r.setting_value;
            }
        }

        return NextResponse.json({ success: true, data: settingsMap });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
