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
        hostname: '://groq.com',
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        }
    };

    const request = https.request(options, (apiRes) => {
        let body = '';
        apiRes.on('data', (chunk) => body += chunk);
        apiRes.on('end', () => {
            // Log for your Render dashboard so you can see if the key is invalid
            if (apiRes.statusCode !== 200) console.log("Groq Error:", body);
            
            res.setHeader('Content-Type', 'application/json');
            res.status(apiRes.statusCode).send(body);
        });
    });

    request.on('error', (e) => {
        console.error(e);
        res.status(500).json({ error: "API Failure", details: e.message });
    });

    request.write(postData);
    request.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Live on ${PORT}`));
