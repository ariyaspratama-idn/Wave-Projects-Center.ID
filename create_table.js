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
        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`projects\` (
                \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                \`uuid\` CHAR(36) UNIQUE,
                \`order_id\` BIGINT UNSIGNED NOT NULL,
                \`client_id\` BIGINT UNSIGNED,
                \`developer_id\` BIGINT UNSIGNED,
                \`project_name\` VARCHAR(255),
                \`domain_url\` VARCHAR(255),
                \`repository_url\` VARCHAR(255),
                \`status\` VARCHAR(50) DEFAULT 'briefing',
                \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE
            )
        `);
        console.log("Table projects created");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`order_status_logs\` (
                \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                \`order_id\` BIGINT UNSIGNED NOT NULL,
                \`status\` VARCHAR(100) NOT NULL,
                \`notes\` TEXT,
                \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE
            )
        `);
        console.log("Table order_status_logs created");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`internal_project_notes\` (
                \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                \`order_id\` BIGINT UNSIGNED NOT NULL,
                \`user_id\` BIGINT UNSIGNED NOT NULL,
                \`note\` TEXT NOT NULL,
                \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE
            )
        `);
        console.log("Table internal_project_notes created");

    } catch (err) {
        console.error("Error creating table:");
        console.error(err.message);
    } finally {
        await pool.end();
    }
}

run();
