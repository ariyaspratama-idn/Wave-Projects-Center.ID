import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { interpretCustomerRequest } from '../../../../../../../prd-generator/aiClient';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const body = await req.json();
        const { rawCustomerRequest, projectName, part, prevContext } = body;

        if (!rawCustomerRequest) {
            return NextResponse.json({ success: false, error: 'rawCustomerRequest required' }, { status: 400 });
        }

        const rawRequestStr = typeof rawCustomerRequest === 'object' ? JSON.stringify(rawCustomerRequest, null, 2) : String(rawCustomerRequest);

        const baseContext = {
            projectName: projectName || "Wave Projects Client App",
            clientName: "Client",
            projectType: "Custom Development",
            priority: "Tinggi",
            rawCustomerRequest: rawRequestStr,
            part: part || 1,
            prevContext: prevContext || {}
        };

        const chunkData = await interpretCustomerRequest(baseContext);

        return NextResponse.json({
            success: true,
            data: chunkData
        });

    } catch (e: any) {
        console.error(`PRD chunk generation crash (Part ${e.part}):`, e);
        return NextResponse.json({ success: false, error: e.message || 'Fatal PRD generation error' }, { status: 500 });
    }
}
