const express = require('express');
const https = require('https');
const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(express.json());

const API_KEY = "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";

app.post('/', (req, res) => {
    const postData = JSON.stringify(req.body);

    const options = {
        hostname: 'api.groq.com', // FIXED: No :// and added api.
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const request = https.request(options, (apiRes) => {
        let body = '';
        apiRes.on('data', (chunk) => body += chunk);
        apiRes.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            res.status(apiRes.statusCode).send(body);
        });
    });

    request.on('error', (e) => {
        console.error("Connection Error:", e.message);
        res.status(500).json({ error: "API Failure", details: e.message });
    });

    request.write(postData);
    request.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server live on ${PORT}`));
