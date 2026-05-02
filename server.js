const express = require('express');
const https = require('https');
const app = express();
require('dotenv').config();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(express.json());

// Put keys in an array for easy cycling
const KEYS = [
    process.env.API_KEY,
    process.env.API_KEYTWO,
    process.env.API_KEYTHREE,
    process.env.API_KEYFOUR
];

app.post('/', (req, res) => {
    const postData = JSON.stringify(req.body);

    // Helper function to try a specific key index
    const makeRequest = (keyIndex) => {
        if (keyIndex >= KEYS.length) {
            return res.status(500).json({ error: "All API keys failed or exhausted." });
        }

        const options = {
            hostname: 'api.groq.com',
            path: '/openai/v1/chat/completions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${KEYS[keyIndex]}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const request = https.request(options, (apiRes) => {
            let body = '';
            apiRes.on('data', (chunk) => body += chunk);
            apiRes.on('end', () => {
                // If API returns an error (like 401, 429, or 500), try the next key
                if (apiRes.statusCode !== 200) {
                    console.log(`Key ${keyIndex} failed (${apiRes.statusCode}). Trying next...`);
                    return makeRequest(keyIndex + 1);
                }
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(body);
            });
        });

        request.on('error', (e) => {
            console.error(`Connection Error with key ${keyIndex}:`, e.message);
            makeRequest(keyIndex + 1);
        });

        request.write(postData);
        request.end();
    };

    // Start with the first key
    makeRequest(0);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server live on ${PORT}`));
