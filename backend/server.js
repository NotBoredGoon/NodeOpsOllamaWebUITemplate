const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

let config;
try {
    const configFile = fs.readFileSync(path.join(__dirname, 'config.yaml'), 'utf8');
    config = yaml.load(configFile);
} catch (e) {
    console.error("FATAL: Could not load config.yaml. Please ensure it exists and is valid by copying config.example.yaml.", e);
    process.exit(1); // Exit if config is missing
}

const app = express();
const port = config.backend.port || 8080;
const llmEndpoint = config.llm.endpoint_url;

// Middleware
app.use(cors()); // Allow requests from our React frontend
app.use(express.json()); // Parse JSON bodies

// --- GEMINI API Configuration (for simulation) ---
// IMPORTANT: You should use an environment variable for your API key in a real app.
// Create a .env file in this directory with: GEMINI_API_KEY=your_key_here
// and run with `node -r dotenv/config server.js` after `npm install dotenv`
require('dotenv').config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

// --- API Endpoints ---

// Endpoint to provide Firebase config to the frontend
app.get('/api/config/firebase', (req, res) => {
    if (config.firebase) {
        res.json(config.firebase);
    } else {
        res.status(500).json({ error: 'Firebase configuration is missing on the server.' });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { model, prompt } = req.body;
        
        if (!model || !prompt) {
            return res.status(400).json({ error: 'Model and prompt are required.' });
        }
        if (!llmEndpoint) {
            return res.status(500).json({ error: 'LLM endpoint is not configured in config.yaml.' });
        }

        console.log(`Forwarding request for model [${model}] to: ${llmEndpoint}`);

        const ollamaPayload = {
            model: model,
            messages: [{ role: 'user', content: prompt }],
            stream: false,
        };
        const ollamaResponse = await fetch(llmEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ollamaPayload),
        });

        if (!ollamaResponse.ok) {
            const errorBody = await ollamaResponse.text();
            console.error('Ollama API Error:', errorBody);
            throw new Error(`Ollama API responded with status ${ollamaResponse.status}`);
        }
        
        const ollamaData = await ollamaResponse.json();
        const responseText = ollamaData?.message?.content || "Sorry, I couldn't get a response from Ollama.";

        res.json({ response: responseText });

    } catch (error) {
        console.error('Error in /api/chat:', error.message);
        res.status(500).json({ error: 'Failed to get a response from the AI model.' });
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
}); 