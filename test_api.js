(async () => {
    try {
        const res2 = await fetch("http://localhost:3000/api/v1/chat/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "saya budget mepet ingin nego harga custom web bisa chat kemana?" })
        });
        const data2 = await res2.json();
        console.log("CHAT Response:", data2);
    } catch (e) {
        console.log("CHAT Fetch Error:", e);
    }
})();
