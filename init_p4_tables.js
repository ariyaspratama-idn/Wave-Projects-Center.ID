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
        console.log("Creating roles and user_roles tables...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                description TEXT
            )
        `);
        // Insert default roles if missing
        await pool.query("INSERT IGNORE INTO roles (id, name, description) VALUES (1, 'Super Admin', 'Full Access'), (2, 'Developer', 'Development Team'), (3, 'Marketing', 'Marketing Team'), (4, 'Customer', 'Client')");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_roles (
                user_id BIGINT NOT NULL,
                role_id BIGINT NOT NULL,
                PRIMARY KEY (user_id, role_id)
            )
        `);

        console.log("Creating Executive Panel tables...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS client_briefs (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                order_id BIGINT UNIQUE NOT NULL,
                prd_content LONGTEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS kanban_tasks (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                order_id BIGINT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                status VARCHAR(50) DEFAULT 'todo',
                assignee VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS project_deployments (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                order_id BIGINT NOT NULL,
                domain_url VARCHAR(255),
                vercel_id VARCHAR(100),
                status VARCHAR(50) DEFAULT 'deploying',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Check if users table needs github_username
        try {
            await pool.query("ALTER TABLE users ADD COLUMN github_username VARCHAR(100)");
        } catch (e) {
            // Might already exist, ignore
        }

    } catch (e) {
        console.error("Migration error:", e.message);
    } finally {
        await pool.end();
        process.exit();
    }
}
run();
