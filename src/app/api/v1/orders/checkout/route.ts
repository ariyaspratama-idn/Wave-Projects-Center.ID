import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { package_id, client_name, client_email, client_whatsapp, project_purpose, payment_choice, github_url } = body;

        if (!package_id) return NextResponse.json({ success: false, message: 'Package ID required' }, { status: 400 });

        const [pkgs]: any = await pool.query('SELECT price FROM packages WHERE id = ?', [package_id]);
        if (!pkgs.length) return NextResponse.json({ success: false, message: 'Invalid package' }, { status: 400 });

        const price = pkgs[0].price;
        const totalAmount = payment_choice === 'DP_30' ? price * 0.3 : price;

        const orderNumber = `WAVE-${Date.now()}`;

        const [orderResult]: any = await pool.query(
            `INSERT INTO orders (package_id, client_name, client_email, client_whatsapp, project_purpose, payment_choice, github_url, order_number, status, total_amount, payment_status, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [package_id, client_name || '', client_email || '', client_whatsapp || '', project_purpose || '', payment_choice || 'FULL', github_url || '', orderNumber, 'pending', totalAmount, 'unpaid']
        );

        const orderId = orderResult.insertId;

        // Dispatch OneSignal Push Notification independently
        const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
        const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

        if (ONESIGNAL_APP_ID && ONESIGNAL_REST_API_KEY) {
            await fetch('https://onesignal.com/api/v1/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
                },
                body: JSON.stringify({
                    app_id: ONESIGNAL_APP_ID,
                    included_segments: ['Active Users', 'Admins'],
                    headings: { en: 'Pesanan Baru Masuk! 🚀' },
                    contents: { en: `Klien ${client_name || 'Tanpa Nama'} (${client_whatsapp}) telah memesan Paket #${package_id}.` }
                })
            }).catch(() => null);
        }

        return NextResponse.json({
            success: true,
            message: 'Order created successfully natively on Next.js',
            data: {
                order_number: orderNumber,
                snap_token: `mock_snap_${Math.random()}`,
                order_id: orderId,
            }
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
