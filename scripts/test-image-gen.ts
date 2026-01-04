
import { VertexAI } from '@google-cloud/vertexai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testImageGen(modelName: string) {
    const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GCP_LOCATION || 'us-central1';
    const clientEmail = process.env.GCP_CLIENT_EMAIL;
    const privateKey = process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        console.error('Missing Vertex AI credentials in .env.local');
        return;
    }

    console.log(`Testing image generation with ${modelName}...`);

    try {
        const vertexAI = new VertexAI({
            project: projectId,
            location: location,
            googleAuthOptions: {
                credentials: {
                    client_email: clientEmail,
                    private_key: privateKey
                }
            }
        });

        const model = vertexAI.getGenerativeModel({ model: modelName });

        // Prompt for image generation
        const prompt = 'Draw a cute cartoon cat playing with a red ball of yarn.';

        const result = await model.generateContent(prompt);
        const response = await result.response;

        console.log('Response candidates:', JSON.stringify(response.candidates, null, 2));

    } catch (error: any) {
        console.error(`❌ Failed with ${modelName}:`, error.message);
    }
}

async function main() {
    console.log("Testing various Vertex AI Image Models...");

    // User requested model from screenshot
    await testImageGen('imagen-4.0-fast-generate');

    // Imagen 3 variations
    await testImageGen('imagen-3.0-generate-001');
    await testImageGen('imagen-3.0-fast-generate-001');

    // Legacy models (Imagen 2/1)
    await testImageGen('imagegeneration@006');
    await testImageGen('imagegeneration@005');
}

main();
