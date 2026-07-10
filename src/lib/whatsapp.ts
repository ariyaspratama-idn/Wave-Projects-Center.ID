export const sendAdminAlert = async (clientName: string, packageIntent: string, sessionId: string) => {
    // Nomor admin yang telah ditentukan oleh user
    const adminPhone = "085156618435";

    // Pesan yang diminta oleh user
    const message = `Sam, ada paus masuk... tapi ada pesanan yang perlu diskusi langsung dengan pemilik agency. Klien bernama ${clientName || 'Guest'} baru saja menyelesaikan sesi konsultasi dengan Nova. Dia tertarik dengan proyek ${packageIntent}. Segera cek dashboard Next.js lu buat generate PRD-nya, cok! Tautan: https://waveprojects.id/admin/proyek/${sessionId}`;

    console.log(`[WhatsApp API Dummy] MENGIRIM PESAN KE ADMIN (${adminPhone}):\n${message}`);

    // Di sini asumsi user menggunakan environment variable untuk provider WA mereka.
    if (process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_KEY) {
        try {
            await fetch(process.env.WHATSAPP_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`
                },
                body: JSON.stringify({
                    phone: adminPhone,
                    message: message
                })
            });
        } catch (e) {
            console.error("Gagal mengirim WA (Admin):", e);
        }
    }
};

export const sendClientFollowUp = async (clientPhone: string, clientName: string, packageIntent: string, sessionId: string) => {
    const message = `Halo Kak ${clientName || 'Klien'}, Terima kasih telah berkonsultasi dengan Nova dari Wave Projects Center.ID. Kami telah mencatat kebutuhan sistem ${packageIntent} Anda. Tim teknis (Sam) kami sedang mematangkan berkas dokumen spesifikasi (PRD). Kakak bisa memantau perkembangan proyek atau mengunduh rangkuman awal melalui tautan resmi berikut: https://waveprojects.id/status/${sessionId}`;

    console.log(`[WhatsApp API Dummy] MENGIRIM PESAN KE KLIEN (${clientPhone}):\n${message}`);

    if (process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_KEY) {
        try {
            await fetch(process.env.WHATSAPP_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`
                },
                body: JSON.stringify({
                    phone: clientPhone,
                    message: message
                })
            });
        } catch (e) {
            console.error("Gagal mengirim WA (Klien):", e);
        }
    }
};
