import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        // Parse order_id from the querystring (e.g. ?order_id=5)
        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get('order_id');

        // Ensure webhooks have an order_id binding
        if (!orderId) {
            return NextResponse.json({ success: false, error: 'order_id query param missing.' }, { status: 400 });
        }

        const body = await req.json();

        // Vercel Webhook Schema mapping
        // Typical structure includes the payload inside 'body.payload' or root
        const type = body.type || 'deployment.created';
        const project = body.payload?.deployment?.name || 'Unknown Project';
        const url = body.payload?.deployment?.url || '';
        const state = body.payload?.deployment?.state || 'BUILDING'; // BUILDING, READY, ERROR
        const errMessage = body.payload?.deployment?.meta?.githubCommitMessage || '';

        let logMessage = `Vercel Deployment [${project}] status updated to: ${state}`;
        if (errMessage) logMessage += ` | ${errMessage}`;

        const finalStatus = state === 'READY' ? 'SUCCESS' : state === 'ERROR' ? 'FAILED' : 'PENDING';

        await pool.query(
            "INSERT INTO project_deployments (order_id, platform, message, status, url) VALUES (?, 'VERCEL', ?, ?, ?)",
            [Number(orderId), logMessage, finalStatus, url]
        );

        return NextResponse.json({ success: true, message: 'Vercel hook logged successfully.' });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
