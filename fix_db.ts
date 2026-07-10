import pool from './src/lib/db';

async function fixDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                action VARCHAR(100) NOT NULL,
                entity_type VARCHAR(100) NOT NULL,
                entity_id INT NOT NULL,
                new_value TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("audit_logs table created successfully.");
    } catch (e) {
        console.error("DB fix fail:", e);
    } finally {
        pool.end();
    }
}

fixDB();
