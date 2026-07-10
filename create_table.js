const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
        port: 4000,
        user: "2qbhFjoVxRDEvRF.root",
        password: "ZKCQrJAeQz155qIc",
        database: "test",
        ssl: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
        }
    });

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`attachments\` (
                \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                \`order_id\` BIGINT UNSIGNED NOT NULL,
                \`cloudinary_public_id\` VARCHAR(255) NOT NULL,
                \`file_name\` VARCHAR(255) NOT NULL,
                \`file_size\` BIGINT,
                \`file_type\` VARCHAR(50),
                \`secure_url\` TEXT NOT NULL,
                INDEX \`idx_order\` (\`order_id\`),
                INDEX \`idx_file_type\` (\`file_type\`),
                FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE
            )
        `);
        console.log("Table 'attachments' created successfully!");
    } catch (err) {
        console.error("Error creating table:");
        console.error(err.message);
    } finally {
        await pool.end();
    }
}

run();
