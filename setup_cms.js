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
        console.log("Creating agency_settings table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS agency_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(100) NOT NULL UNIQUE,
                setting_value TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Insert Default Settings if not exist
        const defaultSettings = [
            ['agency_name', 'Wave Projects Center.ID'],
            ['promo_banner_text', '🚀 DISKON 30% KHUSUS BULAN INI UNTUK PEMBUATAN APLIKASI KASIR UMKM!'],
            ['hero_subtitle', 'Platform all-in-one untuk konsultasi AI, pemesanan, pembayaran, hingga serah terima proyek web & aplikasi. Satu ekosistem. Tanpa ribet.'],
            ['whatsapp_contact', '+6281234567890']
        ];

        for (const [key, val] of defaultSettings) {
            await pool.query(
                "INSERT IGNORE INTO agency_settings (setting_key, setting_value) VALUES (?, ?)",
                [key, val]
            );
        }

        console.log("Agency Settings successfully seeded!");
    } catch (err) {
        console.error("Error migrating:", err);
    } finally {
        pool.end();
    }
}
run();
