require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');


const config = {
    endpoint_url: process.env.ENDPOINT_URL,
    firebase: {
        apiKey: process.env.API_KEY,
        authDomain: process.env.AUTH_DOMAIN,
        projectId: process.env.PROJECT_ID,
        storageBucket: process.env.STORAGE_BUCKET,
        messagingSenderId: process.env.MESSAGING_SENDER_ID,
        appId: process.env.APP_ID,
    }
}


const app = express();
const port = 8080;
const llmEndpoint = config.endpoint_url;

// Middleware
app.use(cors()); // Allow requests from our React frontend
app.use(express.json()); // Parse JSON bodies

// Endpoint to provide Firebase config to the frontend
app.get('/api/config/firebase', (req, res) => {
    if (config.firebase) {
        res.json(config.firebase);
    } else {
        res.status(500).json({ error: 'Firebase configuration is missing on the server.' });
    }
});

// Fetches the list of available models from the configured Ollama instance.
app.get('/api/models', async (req, res) => {
    try {
        const response = await fetch(`${llmEndpoint}/api/tags`);
        if (!response.ok) {
            throw new Error(`Ollama server responded with status: ${response.status}`);
        }
        const data = await response.json();
        
        const availableModels = data.models.map(model => ({
            id: model.name,
            name: model.name.split(':')[0] 
        }));
        
        res.json(availableModels);

    } catch (error) {
        console.error('Error fetching models from Ollama:', error.message);
        res.status(500).json({ error: 'Could not fetch model list from the Ollama node. Please check the configuration.' });
    }
});


app.post('/api/chat', async (req, res) => {
    try {
        const { model, prompt } = req.body;

        if (!model || !prompt) {
            return res.status(400).json({ error: 'Model and prompt are required.' });
        }
        if (!llmEndpoint) {
            return res.status(500).json({ error: 'LLM endpoint is not configured.' });
        }

        console.log(`Forwarding request for model [${model}] to: ${llmEndpoint}/api/chat`);

        const ollamaPayload = {
            model: model,
            messages: [{ role: 'user', content: prompt }],
            stream: false,
        };
        const ollamaResponse = await fetch(llmEndpoint + 'api/chat', {
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
    console.log(`Configured to connect to Ollama at: ${llmEndpoint}`);
}); 