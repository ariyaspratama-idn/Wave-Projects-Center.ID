import * as SibApiV3Sdk from 'sib-api-v3-sdk';

export const sendEmail = async (toEmail: string, toName: string, subject: string, htmlContent: string) => {
    try {
        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        const apiKey = defaultClient.authentications['api-key'];
        apiKey.apiKey = process.env.BREVO_API_KEY;

        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = htmlContent;
        sendSmtpEmail.sender = { "name": "Wave Projects Center", "email": "admin@waveprojects.id" };
        sendSmtpEmail.to = [{ "email": toEmail, "name": toName }];

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log("Email Sent Successfully. Message ID: ", data.messageId);
        return { success: true, messageId: data.messageId };
    } catch (error: any) {
        console.error("Brevo Email Error:", error);
        return { success: false, error: error.message };
    }
};
