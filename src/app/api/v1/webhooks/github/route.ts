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

        // Cek jika Push Webhook GitHub mengandung perintah khusus Stage Pipeline
        const lcMessage = latestCommit.message.toLowerCase();
        let statusBumpLog = '';
        let newOrderStatus = '';

        if (lcMessage.includes('begin testing') || lcMessage.includes('deploy test')) {
            newOrderStatus = 'Testing';
            statusBumpLog = 'Memulai fase Testing berdasarkan instruksi Commit.';
        } else if (lcMessage.includes('need revision') || lcMessage.includes('fix:')) {
            newOrderStatus = 'Revision';
            statusBumpLog = 'Mengembalikan ke fase Revision akibat perbaikan kode.';
        } else if (lcMessage.includes('final payment') || lcMessage.includes('deploy prod')) {
            newOrderStatus = 'Final Payment';
            statusBumpLog = 'Peluncuran produksi dimulai. Menunggu Final Payment dari klien.';
        } else if (lcMessage.includes('release v') || lcMessage.includes('handover')) {
            newOrderStatus = 'Handover';
            statusBumpLog = 'Versi final dirilis. Serah terima sistem (Handover).';
        } else if (lcMessage.includes('chore:') || lcMessage.includes('maintenance')) {
            newOrderStatus = 'Maintenance';
            statusBumpLog = 'Memasuki fase Maintenance pasca-peluncuran.';
        }

        if (newOrderStatus !== '') {
            await pool.query("UPDATE orders SET status = ? WHERE id = ?", [newOrderStatus, orderId]);
            await pool.query("INSERT INTO order_status_logs (order_id, status, notes, created_at) VALUES (?, ?, ?, NOW())", [orderId, newOrderStatus, `GitHub Bot: ${statusBumpLog}`]);
            message += ` | Webhook Auto-Pilot: Memajukan Order ke fase [${newOrderStatus}].`;
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
