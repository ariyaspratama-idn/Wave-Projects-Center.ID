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
        const [tables] = await pool.query("SHOW TABLES");
        console.log("TABLES IN DB:");
        console.log(tables);
    } catch (e) {
        console.error(e.message);
    } finally {
        await pool.end();
        process.exit();
    }
}
run();
