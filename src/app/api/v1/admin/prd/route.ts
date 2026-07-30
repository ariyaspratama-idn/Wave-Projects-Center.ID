import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { renderPRDToDocx } from '../../../../../../prd-generator/prdDocxRenderer';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'waveprojects_super_secret_key_123!';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);

        const body = await req.json();
        const { fullPrdData, projectName, orderId } = body;

        if (!fullPrdData) {
            return NextResponse.json({ success: false, error: 'fullPrdData (hasil chunk) required' }, { status: 400 });
        }

        const prdData = fullPrdData;

        prdData.projectName = projectName || "Wave Projects Client App";
        prdData.clientName = prdData.clientName || "Client";
        prdData.prdId = `PRD-CUSTOM-${Date.now()}`;

        // Render to Word Document buffer
        const docxBuffer = await renderPRDToDocx(prdData);

        let developerChatId = undefined;
        if (orderId) {
            try {
                const [devData]: any = await pool.query("SELECT u.telegram_id FROM orders o JOIN users u ON o.assigned_to = u.id WHERE o.id = ?", [orderId]);
                if (devData.length > 0 && devData[0].telegram_id) {
                    developerChatId = devData[0].telegram_id;
                }
            } catch (err: any) {
                console.warn("[PRD] Fallback. Column telegram_id may not exist on prod deployment yet:", err.message);
                // will fallback to main admin telegram bot if undefined
            }
        }

        const base64Docx = Buffer.isBuffer(docxBuffer) ? docxBuffer.toString('base64') : Buffer.from(docxBuffer).toString('base64');
        import('@/lib/telegram').then(({ sendTelegramDocumentBase64 }) => {
            sendTelegramDocumentBase64(base64Docx, `${prdData.prdId}.docx`, `📁 <b>DOKUMEN PRD PENGEMBANGAN!</b>\n\n<b>Project:</b> ${prdData.projectName}\n<b>Client:</b> ${prdData.clientName}\n\nSilakan buka file referensi .docx ini dan segera lakukan eksekusi pengembangan sistem.`, developerChatId);
        }).catch(e => console.error(e));


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
