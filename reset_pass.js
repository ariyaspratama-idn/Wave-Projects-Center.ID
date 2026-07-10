const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function reset() {
    const pool = mysql.createPool({
        host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
        port: 4000,
        user: "2qbhFjoVxRDEvRF.root",
        password: "ZKCQrJAeQz155qIc",
        database: "test",
        ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
    });

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('admin123', salt);
        await pool.query("UPDATE users SET password = ? WHERE email = 'admin@waveprojects.id'", [hash]);
        console.log("Password reset successfully for admin@waveprojects.id to admin123");
    } catch (e) {
        console.error("Error resetting password:", e);
    } finally {
        await pool.end();
    }
}

reset();
