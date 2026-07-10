import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const body = await req.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
        }

        // Migration for audit_logs
        await pool.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                action VARCHAR(100) NOT NULL,
                entity_type VARCHAR(100) NOT NULL,
                entity_id INT NOT NULL,
                new_value TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // LEAST ACTIVE WORKLOAD ALGORITHM
        // 1. Find all active users connected to the 'Developer' role.
        // 2. Count their active projects (status not live/maintenance).
        // 3. Order ascending by active load, limit 1.

        const algoQuery = `
            SELECT u.id as developer_id, u.name, 
                   (SELECT COUNT(*) FROM projects p 
                    WHERE p.developer_id = u.id 
                    AND p.status IN ('briefing', 'designing', 'development', 'testing')) as active_load
            FROM users u
            INNER JOIN user_roles ur ON u.id = ur.user_id
            INNER JOIN roles r ON ur.role_id = r.id
            WHERE r.name = 'Developer'
            ORDER BY active_load ASC, u.id ASC
            LIMIT 1
        `;

        const [devs]: any = await pool.query(algoQuery);

        if (!devs || devs.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Tidak ada Developer aktif yang tersedia di sistem.'
            }, { status: 404 });
        }

        const selectedDev = devs[0];

        // Assign the project using order_id
        // Upsert the project assigning it to developer
        await pool.query(`
            INSERT INTO projects (order_id, developer_id, status) 
            VALUES (?, ?, 'New Lead') 
            ON DUPLICATE KEY UPDATE developer_id = ?
        `, [orderId, selectedDev.developer_id, selectedDev.developer_id]);

        // Audit Log entry (Tracking Auto-Balancer assignment)
        await pool.query(
            "INSERT INTO audit_logs (action, entity_type, entity_id, new_value, created_at) VALUES (?, ?, ?, ?, NOW())",
            ['auto_assign', 'order', orderId, JSON.stringify({ assigned_to: selectedDev.name, workload: selectedDev.active_load })]
        );

        return NextResponse.json({
            success: true,
            message: 'Project successfully assigned via Least Active Workload Algorithm.',
            data: {
                developer_id: selectedDev.developer_id,
                developer_name: selectedDev.name,
                active_load: selectedDev.active_load
            }
        });

    } catch (e: any) {
        console.error("Auto Assign Error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
