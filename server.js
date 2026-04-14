const express = require('express');
const cors = require('cors');
const https = require('https');

// Load the key from your specific absolute path
require('dotenv').config({ path: './api.env' });

const app = express();

app.use(cors()); 
app.use(express.json());

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.error("❌ ERROR: API_KEY not found in api.env");
} else {
    console.log("✅ API Key Loaded. Server ready.");
}

app.post('/chat', (req, res) => {
    const postData = JSON.stringify(req.body);

    const options = {
        hostname: 'api.groq.com', // FIXED: Removed '://' and added 'api.'
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
        console.error("Groq API Error:", err.message);
        res.status(500).json({ error: "Connection to Groq failed" });
    });

    request.write(postData);
    request.end();
});

app.listen(3000, () => console.log('Backend running at http://localhost:3000'));
