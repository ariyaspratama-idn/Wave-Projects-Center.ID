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

    console.log("Migrating Phase 7: Team Automation & Payroll...");

    const executeSafe = async (query) => {
        try {
            await pool.query(query);
            console.log("✅ Success: " + query.substring(0, 50) + "...");
        } catch (e) {
            console.log("⚠️ Skipped/Error (already exists?): " + e.message);
        }
    };

    // 1. ALTER USERS
    await executeSafe("ALTER TABLE users ADD COLUMN github_username VARCHAR(255) NULL UNIQUE");
    await executeSafe("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true");

    // 2. ALTER ORDERS
    await executeSafe("ALTER TABLE orders ADD COLUMN assigned_to INT NULL");
    await executeSafe("ALTER TABLE orders ADD COLUMN github_repo VARCHAR(255) NULL");
    await executeSafe("ALTER TABLE orders ADD COLUMN vercel_preview_url VARCHAR(255) NULL");

    // Add foreign key constraint separately
    await executeSafe("ALTER TABLE orders ADD CONSTRAINT fk_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL");

    // 3. ALTER KANBAN_TASKS
    await executeSafe("ALTER TABLE kanban_tasks ADD COLUMN task_code VARCHAR(50) NULL UNIQUE");

    // Update existing tasks with a dummy task_code if they don't have one so unique constraint isn't violated by NULL/Empty if we wanted it strict.
    // We already added it nullable so it's fine. 
    await executeSafe("UPDATE kanban_tasks SET task_code = CONCAT('TASK-', order_id, '-', id) WHERE task_code IS NULL");

    // 4. CREATE PROJECT_PAYOUTS
    await executeSafe(`
        CREATE TABLE IF NOT EXISTS project_payouts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            user_id INT NOT NULL,
            amount DECIMAL(15, 2) NOT NULL,
            status ENUM('unpaid', 'paid') DEFAULT 'unpaid',
            paid_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    console.log("Done database structure updates!");
    pool.end();
}
run();
