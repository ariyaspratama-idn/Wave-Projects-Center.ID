require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function setupSettings() {
    console.log("Memulai setup tabel pengaturan...");

    // Konfigurasi koneksi (Bisa disesuaikan dengan .env.local jika pakai TiDB/MySQL)
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'wave_projects_center',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
    };

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Koneksi database berhasil!");

        // Default Company Contacts
        const defaultContacts = {
            whatsapp: "085156618435",
            email: "a.pramadhan.id@gmail.com",
            address: "Jakarta, Indonesia"
        };

        // Default Social Media
        const defaultSocials = {
            instagram: "https://instagram.com/waveprojects.id",
            facebook: "",
            linkedin: ""
        };

        const upsertQuery = `
            INSERT INTO system_settings (setting_key, setting_value, description)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            setting_value = VALUES(setting_value),
            description = VALUES(description)
        `;

        // 1. Insert Contact Info
        await connection.execute(upsertQuery, [
            'contact_info',
            JSON.stringify(defaultContacts),
            'Kontak perusahaan utama untuk AI handoff dan Info Footer'
        ]);
        console.log("✅ contact_info berhasil dibuat/diupdate.");

        // 2. Insert Social Media
        await connection.execute(upsertQuery, [
            'social_media',
            JSON.stringify(defaultSocials),
            'Link sosial media perusahaan'
        ]);
        console.log("✅ social_media berhasil dibuat/diupdate.");

        console.log("🚀 Setup pengaturan selesai!");
    } catch (error) {
        console.error("Gagal melakukan setup:", error);
    } finally {
        if (connection) {
            await connection.end();
        }
        process.exit();
    }
}

setupSettings();
