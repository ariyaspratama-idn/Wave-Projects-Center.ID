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
        console.log("Migrating Automation Tables...");

        // 1. Client Briefs Table (Form Intakes)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS client_briefs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                project_name VARCHAR(255) NOT NULL,
                core_attributes JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Kanban Tasks Table (AI Generated)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS kanban_tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                status ENUM('TODO', 'DOING', 'DONE') DEFAULT 'TODO',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Project Deployments (CI/CD Webhooks)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS project_deployments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NULL,
                platform VARCHAR(50) NOT NULL,
                message TEXT,
                status VARCHAR(50),
                url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("Automation Tables Successfully Created!");
    } catch (err) {
        console.error("Error migrating Automation tables:", err);
    } finally {
        pool.end();
    }
}
run();
