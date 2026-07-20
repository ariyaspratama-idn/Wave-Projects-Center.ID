require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function test() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE || 'test',
        port: parseInt(process.env.DB_PORT || '4000', 10),
        ssl: { rejectUnauthorized: true },
    });

    try {
        const [rows] = await pool.query("DESCRIBE packages");
        console.log("SCHEMA PACKAGES:", rows);
    } catch (e) {
        console.error("ERROR:", e.message);
    }
    process.exit(0);
}
test();
