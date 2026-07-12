export const sendEmail = async (toEmail: string, toName: string, subject: string, htmlContent: string) => {
    try {
        const apiKey = process.env.BREVO_API_KEY;

        if (!apiKey) {
            throw new Error("BREVO_API_KEY is not defined");
        }

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: "Wave Projects Center", email: process.env.BREVO_SENDER_EMAIL || "apramadhan.id@gmail.com" },
                to: [{ email: toEmail, name: toName }],
                subject: subject,
                htmlContent: htmlContent
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to send email via Brevo REST API");
        }

        console.log("Email Sent Successfully. Message ID: ", data.messageId);
        return { success: true, messageId: data.messageId };
    } catch (error: any) {
        console.error("Brevo Email Error:", error);
        return { success: false, error: error.message };
    }
};
