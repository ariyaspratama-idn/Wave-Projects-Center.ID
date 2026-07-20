import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function POST(req: Request) {
    try {
        // Simple JWT check
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
        }
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const formData = await req.formData();
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const live_link = formData.get('live_link') as string;
        const imageFile = formData.get('image') as File | null;
        const screenshotUrl = formData.get('screenshot_url') as string | null;

        let image_url = '';

        if (imageFile && imageFile.size > 0) {
            // Buffer strategy bypassing local FS entirely for Vercel Edge Serverless
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const dataUri = `data:${imageFile.type};base64,${buffer.toString('base64')}`;

            // Upload directly to memory
            const uploadResponse = await cloudinary.uploader.upload(dataUri, {
                folder: 'wave_portfolios',
            });
            image_url = uploadResponse.secure_url;
        }
        else if (screenshotUrl) {
            // Remote fetch using Cloudinary
            const uploadResponse = await cloudinary.uploader.upload(screenshotUrl, {
                folder: 'wave_portfolios',
            });
            image_url = uploadResponse.secure_url;
        }

        const [result]: any = await pool.query(
            "INSERT INTO portfolios (title, description, image_url, live_link) VALUES (?, ?, ?, ?)",
            [title, description, image_url, live_link]
        );

        return NextResponse.json({ success: true, message: 'Project inserted', data: { id: result.insertId } });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: e.name === 'JsonWebTokenError' ? 401 : 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
        }
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });

        await pool.query("DELETE FROM portfolios WHERE id = ?", [id]);

        return NextResponse.json({ success: true, message: 'Project deleted' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: e.name === 'JsonWebTokenError' ? 401 : 500 });
    }
}
