import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const { id } = await params;
        const orderId = Number(id);

        // Fail-safe migrations for tables queried here
        await pool.query(`
            CREATE TABLE IF NOT EXISTS client_briefs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                project_name VARCHAR(255),
                core_attributes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS kanban_tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                task_code VARCHAR(100),
                title VARCHAR(255) NOT NULL,
                description TEXT,
                status ENUM('TODO', 'DOING', 'DONE') DEFAULT 'TODO',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS project_deployments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                platform VARCHAR(50),
                message TEXT,
                status VARCHAR(50),
                url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Fetch Order Data Details
        const [orders]: any = await pool.query(`
            SELECT o.*, COALESCE(o.client_name, u.name) as client_name, p.name as package_name, p.price as master_package_price 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            LEFT JOIN packages p ON p.id = o.package_id 
            WHERE o.id = ?
        `, [orderId]);
        if (orders.length === 0) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

        // Fetch Client Briefs
        const [briefs]: any = await pool.query("SELECT * FROM client_briefs WHERE order_id = ?", [orderId]);

        // Fetch Kanban Tasks
        const [tasks]: any = await pool.query("SELECT * FROM kanban_tasks WHERE order_id = ? ORDER BY id ASC", [orderId]);

        // Fetch Webhooks Deployments
        const [deployments]: any = await pool.query("SELECT * FROM project_deployments WHERE order_id = ? ORDER BY id DESC", [orderId]);

        // Fetch Developers for Assignment
        const [developers]: any = await pool.query(`
            SELECT u.id, u.name 
            FROM users u 
            INNER JOIN user_roles ur ON ur.user_id = u.id 
            WHERE ur.role_id = 2
        `);

        // Fetch Attachments (Payment Proofs)
        const [attachments]: any = await pool.query("SELECT * FROM attachments WHERE order_id = ? ORDER BY id DESC", [orderId]);

        return NextResponse.json({
            success: true,
            data: {
                order: orders[0],
                brief: briefs[0] || null,
                kanban: tasks,
                deployments: deployments,
                developers: developers,
                attachments: attachments
            }
        });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

// PATCH: Update order client contact details
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const { id } = await params;
        const orderId = Number(id);

        const body = await req.json();
        const { client_name, client_email, client_whatsapp, payment_status } = body;

        const updates: string[] = [];
        const values: any[] = [];

        if (client_name !== undefined) { updates.push('client_name = ?'); values.push(client_name); }
        if (client_email !== undefined) { updates.push('client_email = ?'); values.push(client_email); }
        if (client_whatsapp !== undefined) { updates.push('client_whatsapp = ?'); values.push(client_whatsapp); }
        if (payment_status !== undefined) { updates.push('payment_status = ?'); values.push(payment_status); }

        if (updates.length === 0) {
            return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
        }

        values.push(orderId);
        await pool.query(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, values);

        return NextResponse.json({ success: true, message: 'Contact details updated' });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
