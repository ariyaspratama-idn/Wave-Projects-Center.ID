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
        console.log("Altering orders table status column...");
        await pool.query("ALTER TABLE orders MODIFY COLUMN status VARCHAR(100) DEFAULT 'New Lead'");
        console.log("Orders status updated to VARCHAR.");

        console.log("Ensuring projects table exists...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                order_id BIGINT UNIQUE NOT NULL,
                developer_id BIGINT,
                status VARCHAR(100) DEFAULT 'New Lead',
                metadata JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log("Projects table initialized.");
    } catch (e) {
        console.error(e.message);
    } finally {
        await pool.end();
        process.exit();
    }
}
run();
