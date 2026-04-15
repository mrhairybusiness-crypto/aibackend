const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();

// FIX: Allow EVERYTHING to stop the CORS block once and for all
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const request = https.request(options, (response) => {
        let body = '';
        response.on('data', (chunk) => { body += chunk; });
        response.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            res.status(response.statusCode).send(body);
        });
    });

    request.on('error', (err) => {
        res.status(500).json({ error: "Failed to connect to Groq" });
    });

    request.write(postData);
    request.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on ${PORT}`));

