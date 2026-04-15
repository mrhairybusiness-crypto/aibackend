const express = require('express');
const cors = require('cors');
const https = require('https');
require('dotenv').config({ path: './api.env' });

const app = express();

// Allow the specific origin to be safe
app.use(cors({
    origin: "https://aic.artificial-intelligence.workers.dev"
})); 
app.use(express.json());

const API_KEY = process.env.API_KEY;

app.post('/chat', (req, res) => {
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
            res.status(response.statusCode).set('Content-Type', 'application/json').send(body);
        });
    });

    request.on('error', (err) => {
        res.status(500).json({ error: "Connection to Groq failed" });
    });

    request.write(postData);
    request.end();
});

// FIX: Use process.env.PORT for Render deployment
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
