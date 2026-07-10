import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const [rows]: any = await pool.query("SELECT setting_key, setting_value FROM system_settings");

        let settings: any = {
            agency_name: '',
            promo_banner_text: '',
            hero_subtitle: '',
            whatsapp_contact: ''
        };

        if (rows && rows.length > 0) {
            rows.forEach((row: any) => {
                const k = row.setting_key;
                if (settings[k] !== undefined) {
                    try {
                        settings[k] = typeof row.setting_value === 'string' ? JSON.parse(row.setting_value) : row.setting_value;
                    } catch (e) {
                        settings[k] = row.setting_value;
                    }
                }
            });
        }

        return NextResponse.json({ success: true, data: settings });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const settings = body.settings;

        if (settings) {
            const keys = ['agency_name', 'promo_banner_text', 'hero_subtitle', 'whatsapp_contact'];
            for (let k of keys) {
                if (settings[k] !== undefined) {
                    await pool.query(
                        `INSERT INTO system_settings (setting_key, setting_value) 
                         VALUES (?, ?) 
                         ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = NOW()`,
                        [k, JSON.stringify(settings[k]), JSON.stringify(settings[k])]
                    );
                }
            }
        }

        return NextResponse.json({ success: true, message: 'Settings updated successfully' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
