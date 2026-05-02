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

// Grouping your keys into an array
const KEYS = [
    process.env.API_KEY,
    process.env.API_KEYTWO,
    process.env.API_KEYTHREE,
    process.env.API_KEYFOUR
];

// This pointer stays alive as long as the server is running
let currentKeyIndex = 0;

app.post('/', (req, res) => {
    const postData = JSON.stringify(req.body);
    let attempts = 0;

    const makeRequest = (targetIndex) => {
        // Stop if we have cycled through all keys and none worked
        if (attempts >= KEYS.length) {
            console.error("CRITICAL: All API keys exhausted or failing.");
            return res.status(500).json({ error: "All API keys failed." });
        }

        // The % (modulo) ensures that if targetIndex is 4, it loops back to 0
        const actualIndex = targetIndex % KEYS.length;
        attempts++;

        const options = {
            hostname: '://groq.com',
            path: '/openai/v1/chat/completions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${KEYS[actualIndex]}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const request = https.request(options, (apiRes) => {
            let body = '';
            apiRes.on('data', (chunk) => body += chunk);
            apiRes.on('end', () => {
                // If the API returns an error (401, 429, 500, etc.)
                if (apiRes.statusCode !== 200) {
                    console.warn(`Key ${actualIndex} failed with status ${apiRes.statusCode}. Rotating...`);
                    currentKeyIndex++; // Update global pointer
                    return makeRequest(currentKeyIndex); 
                }

                // Success!
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(body);
            });
        });

        request.on('error', (e) => {
            console.error(`Connection Error on Key ${actualIndex}:`, e.message);
            currentKeyIndex++; // Update global pointer
            makeRequest(currentKeyIndex);
        });

        request.write(postData);
        request.end();
    };

    // Start the attempt from the last known working key index
    makeRequest(currentKeyIndex);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server live on ${PORT} using ${KEYS.length} keys`));
