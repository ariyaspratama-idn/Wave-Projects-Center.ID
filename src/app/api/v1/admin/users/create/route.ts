import { NextResponse } from 'next/server';
import pool from '@/lib/db';
export async function POST(req: Request) {
    const { name, email, phone, password, role, github_username } = await req.json();

    // Very basic validation
    if (!name || !email || !phone || !password || !role) {
        return NextResponse.json({ success: false, message: 'Harap isi semua kolom' }, { status: 400 });
    }

    // Insert direct password
    // Determine role ID based on the string
    let roleId = 1;
    if (role === 'Super Admin') roleId = 1;
    if (role === 'Developer') roleId = 2;
    if (role === 'Customer Service') roleId = 3;
    if (role === 'Admin') roleId = 4;

    await pool.query(
        "INSERT INTO users (name, email, whatsapp, password, role_id, github_username) VALUES (?, ?, ?, ?, ?, ?)",
        [name, email, phone, password, roleId, github_username || null]
    );

    return NextResponse.json({ success: true, message: 'User berhasil dibuat.' });
}
