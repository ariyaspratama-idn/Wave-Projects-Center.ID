import pool from './src/lib/db.js';

async function testFetch() {
    try {
        const orderId = 6000002;

        console.log("Fetching orders");
        await pool.query(`SELECT o.*, u.name as client_name, p.name as package_name FROM orders o LEFT JOIN users u ON o.user_id = u.id LEFT JOIN packages p ON p.id = o.package_id WHERE o.id = ?`, [orderId]);

        console.log("Fetching briefs");
        await pool.query("SELECT * FROM client_briefs WHERE order_id = ?", [orderId]);

        console.log("Fetching tasks");
        await pool.query("SELECT * FROM kanban_tasks WHERE order_id = ? ORDER BY id ASC", [orderId]);

        console.log("Fetching deployments");
        await pool.query("SELECT * FROM project_deployments WHERE order_id = ? ORDER BY created_at DESC", [orderId]);

        console.log("Fetching developers");
        await pool.query(`SELECT u.id, u.name FROM users u INNER JOIN user_roles ur ON ur.user_id = u.id WHERE ur.role_id = 2`);

        console.log("Fetching attachments");
        await pool.query("SELECT * FROM attachments WHERE order_id = ? ORDER BY created_at DESC", [orderId]);

        console.log("ALL QUERIES SUCCESSFUL");
    } catch (e: any) {
        console.error("SQL ERROR:", e.message);
    } finally {
        pool.end();
    }
}
testFetch();
