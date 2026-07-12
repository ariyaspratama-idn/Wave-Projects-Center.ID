import fs from 'fs';

async function run() {
    const token = fs.readFileSync('token.txt', 'utf8');
    try {
        const res = await fetch('https://wave-projects-center-id.vercel.app/api/v1/admin/orders/6000002/kanban-ai', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}
run();
