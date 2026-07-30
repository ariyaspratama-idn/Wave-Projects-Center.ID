import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        let decoded: any;
        try {
            decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        if (!decoded.roles || !decoded.roles.some((r: any) => r.name === 'Super Admin')) {
            return NextResponse.json({ success: false, message: 'Forbidden. Super Admin only.' }, { status: 403 });
        }

        // Fail-safe migration: add new columns if not exist
        const migrations = [
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS github_username VARCHAR(100) NULL",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100) NULL",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50) NULL",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(150) NULL",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_email VARCHAR(150) NULL",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id VARCHAR(50) NULL",
        ];
        for (const sql of migrations) {
            await pool.query(sql).catch(() => null); // Ignore if already exists
        }

        const body = await req.json();
        const {
            name, email, phone, password, role,
            github_username, bank_name, bank_account_number, bank_account_name, notification_email, telegram_id
        } = body;

        // Check if exists
        const [existing]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return NextResponse.json({ success: false, message: 'Email sudah terdaftar.' }, { status: 400 });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const uuid = crypto.randomUUID();

        const [result]: any = await pool.query(
            `INSERT INTO users (uuid, name, email, password, phone, github_username, bank_name, bank_account_number, bank_account_name, notification_email, telegram_id, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [uuid, name, email, hash, phone || null, github_username || null, bank_name || null, bank_account_number || null, bank_account_name || null, notification_email || null, telegram_id || null]
        );
        const newUserId = result.insertId;

        // Assign role
        const [roleRows]: any = await pool.query("SELECT id FROM roles WHERE name = ?", [role]);
        if (roleRows.length > 0) {
            await pool.query("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", [newUserId, roleRows[0].id]);
        }

        return NextResponse.json({ success: true, message: `Akun ${name} (${role}) berhasil dibuat!` });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
