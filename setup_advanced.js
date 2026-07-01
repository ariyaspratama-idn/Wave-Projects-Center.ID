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
        console.log("Creating Portfolios table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS portfolios (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NULL,
                image_url VARCHAR(255) NULL,
                live_link VARCHAR(255) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log("Creating Chat Sessions table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                session_token VARCHAR(255) NOT NULL UNIQUE,
                customer_name VARCHAR(255) NULL,
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log("Creating Chat Messages table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                chat_session_id BIGINT UNSIGNED NOT NULL,
                sender VARCHAR(50) NOT NULL COMMENT 'user, ai, admin',
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (chat_session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
            )
        `);

        // Inserting dummy portfolio
        const [portRows] = await pool.query("SELECT * FROM portfolios");
        if (portRows.length === 0) {
            await pool.query(
                "INSERT INTO portfolios (title, description, image_url, live_link) VALUES (?, ?, ?, ?)",
                ['PonPes Darel Azhar App', 'Aplikasi PPDB Native Android untuk pendaftaran santri baru.', 'https://res.cloudinary.com/drhlep6sx/image/upload/v1700000000/sample.jpg', 'https://darelazhar.com']
            );
        }

        console.log("Success building advanced schemas!");
    } catch (err) {
        console.error("Error migrating:", err);
    } finally {
        pool.end();
    }
}
run();
