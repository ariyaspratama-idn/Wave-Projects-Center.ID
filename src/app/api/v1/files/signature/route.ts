import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST() {
    try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const apiSecret = process.env.CLOUDINARY_API_SECRET || "MOCK-SECRET";
        const apiKey = process.env.CLOUDINARY_API_KEY || "MOCK-KEY";
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "wave-projects";
        const folder = 'wave-projects';

        const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

        return NextResponse.json({
            success: true,
            data: {
                signature: signature,
                timestamp: timestamp,
                api_key: apiKey,
                cloud_name: cloudName,
                folder: folder,
            }
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
