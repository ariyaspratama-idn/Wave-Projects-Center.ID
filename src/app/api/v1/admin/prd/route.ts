import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { renderPRDToDocx } from '../../../../../../prd-generator/prdDocxRenderer';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const body = await req.json();
        const { fullPrdData, projectName } = body;

        if (!fullPrdData) {
            return NextResponse.json({ success: false, error: 'fullPrdData (hasil chunk) required' }, { status: 400 });
        }

        const prdData = fullPrdData;

        prdData.projectName = projectName || "Wave Projects Client App";
        prdData.clientName = prdData.clientName || "Client";
        prdData.prdId = `PRD-CUSTOM-${Date.now()}`;

        // Render to Word Document buffer
        const docxBuffer = await renderPRDToDocx(prdData);

        return new NextResponse(docxBuffer as unknown as BodyInit, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="Draft_PRD_${Date.now()}.docx"`
            }
        });

    } catch (e: any) {
        console.error("PRD generation crash:", e);
        return NextResponse.json({ success: false, error: e.message || 'Fatal PRD generation error' }, { status: 500 });
    }
}
