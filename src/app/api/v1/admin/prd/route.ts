import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
// @ts-ignore
import { createPRD } from '../../../../../../prd-generator/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const body = await req.json();
        const { rawCustomerRequest, projectName } = body;

        if (!rawCustomerRequest) {
            return NextResponse.json({ success: false, error: 'rawCustomerRequest required' }, { status: 400 });
        }

        // Call the absolute PRD generator module
        const { buffer } = await createPRD({ rawCustomerRequest, projectName: projectName || 'Wave Projects Client App' });

        return new NextResponse(buffer as unknown as BodyInit, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': 'attachment; filename="Draft_PRD.docx"'
            }
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
