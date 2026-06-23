import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const idempotencyKey = request.headers.get('X-Idempotency-Key');

        // Simulate validation
        if (!body.client_name || !body.client_email || !body.package_id) {
            return NextResponse.json({
                success: false,
                message: 'Validation failed',
                errors: { client: 'Missing required fields' }
            }, { status: 422 });
        }

        // Mock response for Midtrans Snap Token
        const snapToken = `mock-snap-${Date.now()}`;
        const orderNumber = `WAVE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        return NextResponse.json({
            success: true,
            message: 'Order created successfully',
            data: {
                order_number: orderNumber,
                payment_status: 'pending',
                snap_token: snapToken,
                idempotency_key: idempotencyKey
            }
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
