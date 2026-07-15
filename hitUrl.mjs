fetch("http://localhost:3000/api/v1/chat/stream", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: "test" }] })
}).then(async r => {
    console.log("STATUS:", r.status);
    console.log("BODY:", await r.text());
}).catch(console.error);
