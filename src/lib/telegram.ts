export async function sendTelegramAlert(message: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_ID || '7827577842';

    if (!token) return;

    try {
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });
    } catch (e) {
        console.error("Failed to send telegram message", e);
    }
}

export async function sendTelegramDocumentBase64(base64: string, filename: string, caption: string, developerChatId?: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.TELEGRAM_ADMIN_ID || '7827577842';

    if (!token) return;

    // Send to developer if exists, otherwise send to Admin
    const targetIds = developerChatId ? [developerChatId, adminChatId] : [adminChatId];
    // Remove duplicates if Dev is somehow the Admin
    const uniqueTargets = [...new Set(targetIds)];

    try {
        const buffer = Buffer.from(base64, 'base64');

        for (const chatId of uniqueTargets) {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('document', blob, filename);
            formData.append('caption', caption + (chatId === adminChatId && developerChatId ? "\n\n*(CC ke Monitor Admin)*" : ""));

            await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
                method: 'POST',
                body: formData
            }).catch(e => console.error("Failed to send telegram doc to", chatId, e));
        }
    } catch (e) {
        console.error("Failed to process telegram document", e);
    }
}

