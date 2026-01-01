import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('No API Key found');
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Available Models:');
        const models = data.models || [];
        models.forEach((m: any) => {
            if (m.name.includes('gemini') && m.supportedGenerationMethods.includes('generateContent')) {
                console.log(`- ${m.name}`);
            }
        });

        if (models.length === 0) {
            console.log("No models found.");
        }

    } catch (error) {
        console.error('Failed to fetch models:', error);
    }
}

listModels();
