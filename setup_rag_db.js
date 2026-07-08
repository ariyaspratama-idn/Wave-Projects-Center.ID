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
        console.log("Migrating AI Knowledge Base (RAG) Table...");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS ai_knowledge_base (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                rule_category VARCHAR(50) DEFAULT 'sop',
                content TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log("RAG Table Successfully Created!");
    } catch (err) {
        console.error("Error migrating RAG tables:", err);
    } finally {
        pool.end();
    }
}
run();
