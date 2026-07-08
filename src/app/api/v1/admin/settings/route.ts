import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(100) UNIQUE NOT NULL,
                setting_value JSON NOT NULL,
                description TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        const [rows]: any = await pool.query("SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ('contact_info', 'social_media')");

        let settings: any = {
            contact_info: { whatsapp: '085156618435', email: 'a.pramadhan.id@gmail.com', address: '' },
            social_media: { instagram: '', facebook: '', linkedin: '' }
        };

        if (rows && rows.length > 0) {
            rows.forEach((row: any) => {
                try {
                    const parsed = typeof row.setting_value === 'string' ? JSON.parse(row.setting_value) : row.setting_value;
                    if (row.setting_key === 'contact_info') {
                        settings.contact_info = { ...settings.contact_info, ...parsed };
                    } else if (row.setting_key === 'social_media') {
                        settings.social_media = { ...settings.social_media, ...parsed };
                    }
                } catch (e) { }
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

        if (body.contact_info) {
            await pool.query(
                `INSERT INTO system_settings (setting_key, setting_value, description) 
                 VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = NOW()`,
                ['contact_info', JSON.stringify(body.contact_info), 'Kontak utama perusahaan', JSON.stringify(body.contact_info)]
            );
        }

        if (body.social_media) {
            await pool.query(
                `INSERT INTO system_settings (setting_key, setting_value, description) 
                 VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = NOW()`,
                ['social_media', JSON.stringify(body.social_media), 'Media sosial perusahaan', JSON.stringify(body.social_media)]
            );
        }

        return NextResponse.json({ success: true, message: 'Settings updated successfully' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
