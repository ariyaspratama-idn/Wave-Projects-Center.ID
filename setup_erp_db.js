const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
        user: '2qbhFjoVxRDEvRF.root',
        password: 'ZKCQrJAeQz155qIc',
        database: 'test',
        port: 4000,
        ssl: { rejectUnauthorized: true }
    });

    try {
        console.log("Migrating ERP Tables...");

        // 1. Convert Orders status ENUM safely
        // TiDB ALTER TABLE with ENUM can be tricky. We might just alter it to VARCHAR to be safe and enforce in code,
        // or just use a wide VARCHAR. Let's use VARCHAR(50) to prevent existing rows from failing if they had 'pending'.
        await pool.query(`ALTER TABLE orders MODIFY COLUMN status VARCHAR(50) DEFAULT 'New Lead'`);

        // 2. Order Status Logs (Audit Trail for Bottlenecks)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS order_status_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                status VARCHAR(50) NOT NULL,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Internal Project Notes
        await pool.query(`
            CREATE TABLE IF NOT EXISTS internal_project_notes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                user_id INT NOT NULL,
                note TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 4. Financial Ledger (Cashbook)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS financial_ledger (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NULL,
                type ENUM('INCOME', 'EXPENSE') NOT NULL,
                amount DECIMAL(15,2) NOT NULL,
                category VARCHAR(100) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("ERP Tables Successfully Created!");
    } catch (err) {
        console.error("Error migrating ERP:", err);
    } finally {
        pool.end();
    }
}
run();
