const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();

// Enable CORS for your origin
app.use(cors({
    origin: "https://workers.dev"
})); 

app.use(express.json());

const API_KEY = "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";

app.post('/', (req, res) => {
    // 1. Log incoming request to debug
    console.log("Incoming Request Body:", JSON.stringify(req.body));

    const postData = JSON.stringify(req.body);

    const options = {
        hostname: 'api.groq.com',
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
            console.log("Groq Status:", response.statusCode);
            res.setHeader('Content-Type', 'application/json');
            res.status(response.statusCode).send(body);
        });
    });

    request.on('error', (err) => {
        console.error("CRITICAL BACKEND ERROR:", err.message);
        res.status(500).json({ error: "Backend failed to reach Groq", details: err.message });
    });

    request.write(postData);
    request.end();
});

// Use Render's dynamic port
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server live on port ${PORT}`);
});

