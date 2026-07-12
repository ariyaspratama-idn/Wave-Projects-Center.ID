import pool from './src/lib/db.js';

async function testFetch() {
    try {
        const [att]: any = await pool.query("DESCRIBE attachments");
        console.log("attachments:", att.map((a: any) => a.Field));

        const [dep]: any = await pool.query("DESCRIBE project_deployments");
        console.log("project_deployments:", dep.map((a: any) => a.Field));
    } catch (e: any) {
        console.error("SQL ERROR:", e.message);
    } finally {
        pool.end();
    }
}
testFetch();
