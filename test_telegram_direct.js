const https = require('https');

const token = "8515147673:AAGqSbTqWKKN3ZuXcrfa4N0IC6Q_8soZYSE";
const chatId = "7827577842";
const text = encodeURIComponent("🤖 *Sistem Diagnostik Backend*\n\nHalo Bos! Jika pesan ini masuk, artinya jalur API Telegram 100% normal dan tidak ada masalah!");

const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${text}&parse_mode=Markdown`;

https.get(url, (res) => {
    let raw = '';
    res.on('data', (d) => { raw += d; });
    res.on('end', () => {
        console.log("Response from Telegram API:", raw);
    });
}).on('error', (e) => {
    console.error("Error connecting to Telegram:", e);
});
