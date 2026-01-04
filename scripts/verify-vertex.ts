
import { VertexAI } from '@google-cloud/vertexai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkModel(modelName: string) {
    const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GCP_LOCATION || 'us-central1';
    const clientEmail = process.env.GCP_CLIENT_EMAIL;
    const privateKey = process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        console.error('Missing Vertex AI credentials in .env.local');
        return;
    }

    console.log(`Checking model ${modelName} in project ${projectId} (${location})...`);

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
        const result = await model.generateContent('Hello, are you there?');
        const response = await result.response;
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

        console.log(`✅ Success with ${modelName}: ${text?.substring(0, 50)}...`);
        return true;
    } catch (error: any) {
        console.error(`❌ Failed with ${modelName}:`, error.message);
        return false;
    }
}

async function main() {
    console.log('Starting Vertex AI Verification...');
    // User requested models
    await checkModel('gemini-3-flash-preview');
    await checkModel('gemini-2.5-flash-image');

    // Fallbacks / Standard models
    await checkModel('gemini-1.5-flash');
    await checkModel('gemini-1.5-pro');
    await checkModel('gemini-2.0-flash-exp');
    await checkModel('imagen-3.0-generate-001');
}

main();
