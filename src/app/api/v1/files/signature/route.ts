import { NextResponse } from 'next/server';

export async function POST() {
    try {
        // Return dummy signature URL for frontend progression
        return NextResponse.json({
            success: true,
            data: {
                url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
            }
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
