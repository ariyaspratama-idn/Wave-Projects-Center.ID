import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get('order_id');

        if (!orderId) {
            return NextResponse.json({ success: false, error: 'order_id missing.' }, { status: 400 });
        }

        const payload = await req.json();

        // GitHub push event tracking
        // Usually contains `commits` array and `repository.name`

        // Let's protect against non-push events (like ping)
        if (payload.hook?.type === "Repository" || !payload.commits) {
            return NextResponse.json({ success: true, message: 'Ping received, not logged.' });
        }

        const repoName = payload.repository?.name || 'Unknown Repo';
        const latestCommit = payload.commits[0]; // grab the first commit

        if (!latestCommit) {
            return NextResponse.json({ success: true, message: 'No commits in push.' });
        }

        const message = `Commit: ${latestCommit.message} by ${latestCommit.author?.name}`;
        const url = latestCommit.url;

        await pool.query(
            "INSERT INTO project_deployments (order_id, platform, message, status, url) VALUES (?, 'GITHUB', ?, 'PUSHED', ?)",
            [Number(orderId), message, url]
        );

        return NextResponse.json({ success: true, message: 'GitHub commit logged.' });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
