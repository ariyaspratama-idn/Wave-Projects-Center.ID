import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ success: false, message: 'Email and password required' }, { status: 400 });
        }

        const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
        const user = rows[0];

        if (!user) {
            return NextResponse.json({ success: false, message: 'Kredensial tidak valid' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json({ success: false, message: 'Kredensial tidak valid' }, { status: 401 });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return NextResponse.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    roles: [{ name: user.role === 'super_admin' ? 'Super Admin' : user.role }]
                }
            }
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, message: 'Server error', error: e.message }, { status: 500 });
    }
}
