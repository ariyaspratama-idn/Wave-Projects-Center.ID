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
        // Get the first user (usually the Super Admin/Owner)
        const [users] = await pool.query("SELECT id FROM users ORDER BY id ASC LIMIT 1");
        if (users.length > 0) {
            const ownerId = users[0].id;
            console.log(`Setting up Solo Agency Owner (User ID: ${ownerId})`);

            // Fetch all roles
            const [roles] = await pool.query("SELECT id, name FROM roles");

            // Map the user to all roles
            for (const role of roles) {
                await pool.query(
                    "INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)",
                    [ownerId, role.id]
                );
                console.log(`Granted role: ${role.name}`);
            }
            console.log("Solo agency roles have been fully mapped!");
        } else {
            console.log("No users found in database.");
        }
    } catch (e) {
        console.error("Migration error:", e.message);
    } finally {
        await pool.end();
        process.exit();
    }
}
run();
