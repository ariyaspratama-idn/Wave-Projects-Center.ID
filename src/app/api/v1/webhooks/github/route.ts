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

        let message = `Commit: ${latestCommit.message} by ${latestCommit.author?.username || latestCommit.author?.name}`;
        const url = latestCommit.url;

        // Trace the Regex
        const githubUsername = latestCommit.author?.username || latestCommit.author?.name;
        const taskRegex = /TASK-\d+-\d+/i;
        const match = taskRegex.exec(latestCommit.message);

        if (match && githubUsername) {
            const taskCode = match[0].toUpperCase();

            // Check Authorization Database 
            const [tasks]: any = await pool.query(`
                SELECT k.id 
                FROM kanban_tasks k 
                JOIN orders o ON o.id = k.order_id 
                JOIN users u ON u.id = o.assigned_to 
                WHERE k.task_code = ? AND u.github_username = ?
            `, [taskCode, githubUsername]);

            if (tasks.length > 0) {
                // Terminate The Task
                await pool.query("UPDATE kanban_tasks SET status = 'DONE' WHERE id = ?", [tasks[0].id]);
                message += ` | Webhook Auto-Pilot: Berhasil menutup tiket ${taskCode} secara otomatis!`;
            } else {
                message += ` | Webhook Warning: Tiket ${taskCode} ditemukan di commit, namun user @${githubUsername} tidak punya otorisasi memutasinya.`;
            }
        }

        await pool.query(
            "INSERT INTO project_deployments (order_id, platform, message, status, url) VALUES (?, 'GITHUB', ?, 'PUSHED', ?)",
            [Number(orderId), message, url]
        );

        return NextResponse.json({ success: true, message: 'GitHub commit logged.' });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
