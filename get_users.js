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
        const [users] = await pool.query("SELECT id, name, email FROM users");
        console.log("Users in DB:");
        console.log(users);

        const [roles] = await pool.query("SELECT * FROM roles");
        console.log("Roles in DB:");
        console.log(roles);

    } catch (e) {
        console.error(e.message);
    } finally {
        await pool.end();
        process.exit();
    }
}
run();
