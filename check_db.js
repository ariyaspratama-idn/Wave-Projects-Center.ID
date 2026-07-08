require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function checkCols() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
        });

        const [cols] = await pool.query("SHOW COLUMNS FROM packages");
        console.log("COLUMNS:");
        cols.forEach(c => console.log(c.Field));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkCols();
