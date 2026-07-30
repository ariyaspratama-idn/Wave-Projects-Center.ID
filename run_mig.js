const pool = require('./src/lib/db');

async function migrate() {
    try {
        console.log("Adding status column...");
        await pool.default.query("ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'active'");
    } catch (e) {
        console.log("status column exists or error:", e.message);
    }

    try {
        console.log("Adding telegram_id column...");
        await pool.default.query("ALTER TABLE users ADD COLUMN telegram_id VARCHAR(255) NULL");
    } catch (e) {
        console.log("telegram_id exist or error:", e.message);
    }

    console.log("Migration complete.");
    process.exit(0);
}

migrate();
