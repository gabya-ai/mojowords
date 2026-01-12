
import * as dotenv from 'dotenv';
import { GoogleAuth } from 'google-auth-library';

dotenv.config({ path: '.env.local' });

const PROJECT_ID = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
const LOCATION = process.env.GCP_LOCATION || 'us-central1';
const CLIENT_EMAIL = process.env.GCP_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n');

async function verifyImagen() {
    if (!PROJECT_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
        console.error("Missing GCP Credentials in .env.local");
        return;
    }

    console.log(`Verifying Imagen 3 Fast on Project: ${PROJECT_ID} (${LOCATION})...`);

    try {
        const auth = new GoogleAuth({
            credentials: {
                client_email: CLIENT_EMAIL,
                private_key: PRIVATE_KEY,
            },
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();

        const modelId = "imagen-3.0-fast-generate-001";
        const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${modelId}:predict`;

        const requestBody = {
            instances: [
                { prompt: "A friendly robot gardening" }
            ],
            parameters: {
                sampleCount: 1,
                aspectRatio: "1:1"
            }
        };

        console.log(`Sending request to: ${endpoint}`);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log("Response received!");

        if (data.predictions && data.predictions[0]) {
            console.log("✅ Success! Image generated (base64 data present).");
        } else {
            console.log("⚠️ Response format unexpected:", JSON.stringify(data).slice(0, 100));
        }

    } catch (error: any) {
        console.error("❌ Verification Failed:");
        console.error(error.message);
    }
}

verifyImagen();
