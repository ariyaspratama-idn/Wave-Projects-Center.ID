const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
        port: 4000,
        user: "2qbhFjoVxRDEvRF.root",
        password: "ZKCQrJAeQz155qIc",
        database: "test",
        ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
    });

    try {
        console.log("Altering orders table...");
        await pool.query(`ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS client_name VARCHAR(150),
            ADD COLUMN IF NOT EXISTS client_email VARCHAR(150),
            ADD COLUMN IF NOT EXISTS client_whatsapp VARCHAR(20),
            ADD COLUMN IF NOT EXISTS project_purpose LONGTEXT,
            ADD COLUMN IF NOT EXISTS payment_choice VARCHAR(50),
            ADD COLUMN IF NOT EXISTS github_url VARCHAR(255),
            ADD COLUMN IF NOT EXISTS total_amount DECIMAL(15,2),
            ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'unpaid'
        `).catch(() => console.log('Columns likely exist or partial error'));

        console.log("Altering client_briefs table...");
        await pool.query(`ALTER TABLE client_briefs
            ADD COLUMN IF NOT EXISTS project_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS core_attributes JSON
        `).catch(() => console.log('Columns likely exist'));

        console.log("Migration complete!");

    } catch (e) {
        console.error("Migration fatal error:", e.message);
    } finally {
        await pool.end();
        process.exit();
    }
}
run();
