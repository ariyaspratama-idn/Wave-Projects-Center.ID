import pool from './src/lib/db';

async function queryDB() {
    try {
        const [users]: any = await pool.query("DESCRIBE users");
        console.log("Users Table Columns:", users.map((u: any) => u.Field));

        // Add if not exists
        const hasGithub = users.some((u: any) => u.Field === 'github_username');
        if (!hasGithub) {
            console.log("Adding github_username column...");
            await pool.query("ALTER TABLE users ADD COLUMN github_username VARCHAR(100) DEFAULT NULL");
            console.log("Column added.");
        }
    } catch (e) {
        console.error("error:", e);
    } finally {
        pool.end();
    }
}

queryDB();
