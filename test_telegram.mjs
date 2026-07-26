import https from 'https';

const token = '8515147673:AAGqSbTqWKKN3ZuXcrfa4N0IC6Q_8soZYSE';
const url = `https://api.telegram.org/bot${token}/getMe`;

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log("Telegram Token Status:");
        console.log(data);
    });
}).on('error', err => {
    console.log("Error:", err.message);
});
