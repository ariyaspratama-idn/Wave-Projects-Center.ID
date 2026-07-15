fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=DUMMY', { method: 'POST', body: '{}' })
    .then(r => r.json())
    .then(console.log);

fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:streamGenerateContent?alt=sse&key=DUMMY', { method: 'POST', body: '{}' })
    .then(r => r.json())
    .then(console.log);
