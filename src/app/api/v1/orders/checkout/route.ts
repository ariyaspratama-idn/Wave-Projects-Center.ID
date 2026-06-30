import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { package_id, agency_name, agency_type, request_note, user_id } = body;

        if (!package_id) return NextResponse.json({ success: false, message: 'Package ID required' }, { status: 400 });

        const [pkgs]: any = await pool.query('SELECT price FROM packages WHERE id = ?', [package_id]);
        if (!pkgs.length) return NextResponse.json({ success: false, message: 'Invalid package' }, { status: 400 });

        const price = pkgs[0].price;
        const totalAmount = price * 0.3; // 30% Down Payment logic preserved

        const [orderResult]: any = await pool.query(
            `INSERT INTO orders (user_id, package_id, agency_name, agency_type, request_note, status, total_amount, payment_status, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [user_id || 1, package_id, agency_name || '', agency_type || '', request_note || '', 'pending', totalAmount, 'unpaid']
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
                    headings: { en: 'New Order Received! 🚀' },
                    contents: { en: `Agency ${agency_name || 'Client'} has checked out Package #${package_id}.` }
                })
            }).catch(() => null);
        }

        return NextResponse.json({
            success: true,
            message: 'Order created successfully natively on Next.js',
            data: {
                payment_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/mock_${Math.random()}`,
                order_id: orderId,
                total_dp: totalAmount
            }
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
