
import { GoogleGenerativeAI } from '@google/generative-ai';
import { VertexAI, GenerativeModel } from '@google-cloud/vertexai';
import { GoogleAuth } from 'google-auth-library';

import fs from 'fs';
import path from 'path';

/**
 * Unified AI Client
 * Automatically switches between Standard API (API Key) and Vertex AI (Application Default Credentials)
 */

// Helper to load credentials
const getCredentials = () => {
    // 1. Try Environment Variables
    let projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    let clientEmail = process.env.GCP_CLIENT_EMAIL;
    let privateKey = process.env.GCP_PRIVATE_KEY;

    // 2. Try Fallback JSON (for local dev issues)
    if (!projectId) {
        try {
            const jsonPath = path.join(process.cwd(), 'vertex-credentials.json');
            if (fs.existsSync(jsonPath)) {
                const creds = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
                console.log('[AI Config] Loaded credentials from vertex-credentials.json');
                projectId = creds.GCP_PROJECT_ID;
                clientEmail = creds.GCP_CLIENT_EMAIL;
                privateKey = creds.GCP_PRIVATE_KEY;
            }
        } catch (e) {
            console.warn('[AI Config] Failed to load vertex-credentials.json', e);
        }
    }

    return {
        PROJECT_ID: projectId,
        LOCATION: process.env.GCP_LOCATION || 'us-central1',
        API_KEY: process.env.GEMINI_API_KEY,
        CLIENT_EMAIL: clientEmail,
        PRIVATE_KEY: privateKey?.replace(/\\n/g, '\n')
    };
};

// Credentials loaded inside getAIClient() to avoid build-time/init issues
// const { PROJECT_ID, LOCATION, API_KEY, CLIENT_EMAIL, PRIVATE_KEY } = getCredentials();

// DEBUG: Check credentials load
// console.log('[AI Config] GCP_PROJECT_ID:', PROJECT_ID ? 'Set' : 'Missing');
// console.log('[AI Config] GCP_CLIENT_EMAIL:', CLIENT_EMAIL ? 'Set' : 'Missing');

type GenerationConfig = {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
};

interface AIClient {
    generateContent(model: string, prompt: string, config?: GenerationConfig): Promise<string>;
    generateImage(prompt: string): Promise<string>; // Returns Base64 string or URL
}

class StandardAIClient implements AIClient {
    private genAI: GoogleGenerativeAI;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async generateContent(modelName: string, prompt: string, config?: GenerationConfig): Promise<string> {
        const model = this.genAI.getGenerativeModel({
            model: modelName,
            generationConfig: config
        });

        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    async generateImage(prompt: string): Promise<string> {
        console.log('[AI] StandardAIClient.generateImage called');
        // Try to use a valid model for API key based image generation
        // Note: GoogleGenerativeAI SDK interaction for Imagen might vary, 
        // effectively treating it as 'generateContent' but handling the image response.
        // We will try 'gemini-2.0-flash-exp' which is available on the API Key
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
            const result = await model.generateContent(prompt);
            const response = await result.response;

            // Check for inline data (images)
            // @ts-ignore - Types might still be catching up for exact image structure in some versions
            const parts = response.candidates?.[0]?.content?.parts;
            if (parts) {
                for (const part of parts) {
                    if (part.inlineData && part.inlineData.mimeType.startsWith('image')) {
                        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    }
                }
            }
            console.warn("StandardAIClient: No inline image data found. Response parts:", parts);
            throw new Error("No image data found in response. Note: Image generation might require Vertex AI.");
        } catch (e) {
            console.error("StandardAIClient Image Gen Error:", e);
            throw e;
        }
    }
}

class VertexAIClientWrapper implements AIClient {
    private vertexAI: VertexAI;
    private projectId: string;
    private location: string;
    private auth: GoogleAuth;

    constructor(projectId: string, location: string, clientEmail?: string, privateKey?: string) {
        this.projectId = projectId;
        this.location = location;

        // If specific credentials are provided (e.g. Vercel), use them.
        // Otherwise, fallback to Application Default Credentials (Local gcloud)
        // Ensure private key has correct line breaks
        const formattedKey = privateKey ? privateKey.replace(/\\n/g, '\n') : undefined;

        const credentials = (clientEmail && formattedKey) ? {
            client_email: clientEmail,
            private_key: formattedKey
        } : undefined;

        this.auth = new GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        this.vertexAI = new VertexAI({
            project: projectId,
            location: location,
            googleAuthOptions: credentials ? { credentials } : undefined
        });
    }

    async generateContent(modelName: string, prompt: string, config?: GenerationConfig): Promise<string> {
        const model = this.vertexAI.getGenerativeModel({
            model: modelName,
            generationConfig: config
        });

        const result = await model.generateContent(prompt);
        // Vertex AI response structure
        const response = await result.response;

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("No candidates returned from Vertex AI");
        }

        const candidate = response.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
            return candidate.content.parts[0].text || '';
        }

        return '';
    }

    async generateImage(prompt: string): Promise<string> {
        // Using REST API for Imagen 3 Fast on Vertex AI
        // This avoids SDK complexity for pure image generation endpoint
        try {
            const client = await this.auth.getClient();
            const accessToken = await client.getAccessToken();

            const modelId = "imagen-3.0-fast-generate-001";
            const endpoint = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${modelId}:predict`;

            const requestBody = {
                instances: [
                    { prompt: prompt }
                ],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: "1:1"
                }
            };

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
                throw new Error(`Vertex AI Image Gen Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            // @ts-ignore
            if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
                // @ts-ignore
                return `data:${data.predictions[0].mimeType || 'image/png'};base64,${data.predictions[0].bytesBase64Encoded}`;
            }

            throw new Error("No image data found in Vertex AI response");
        } catch (error) {
            console.error("VertexAIClientWrapper Image Gen Error:", error);
            throw error;
        }
    }
}

class HybridAIClient implements AIClient {
    private vertexClient: VertexAIClientWrapper;
    private stdClient: StandardAIClient;

    constructor(vertexClient: VertexAIClientWrapper, stdClient: StandardAIClient) {
        this.vertexClient = vertexClient;
        this.stdClient = stdClient;
    }

    async generateContent(model: string, prompt: string, config?: GenerationConfig): Promise<string> {
        // Use Standard Client (API Key) for Text
        // This ensures access to experimental models (gemini-2.0-flash-exp) and simplifies quota management 
        // as the user verified API Key text gen works well.
        return this.stdClient.generateContent(model, prompt, config);
    }

    async generateImage(prompt: string): Promise<string> {
        console.log('[AI] HybridAIClient.generateImage called -> Delegating to Vertex');
        // Switch to Vertex AI for Image Generation (Imagen 3 Fast)
        // This solves the 429 Limit: 0 issue with the Key-based API
        return this.vertexClient.generateImage(prompt);
    }
}

// Initializer
// Global cache for the AI Client to prevent re-initialization (and re-auth) on every request
let cachedClient: AIClient | null = null;

// Initializer
export function getAIClient(): AIClient {
    // Return cached client if available (Singleton Pattern)
    if (cachedClient) {
        return cachedClient;
    }

    // Load credentials at runtime to ensure process.env is populated
    const { PROJECT_ID, LOCATION, API_KEY, CLIENT_EMAIL, PRIVATE_KEY } = getCredentials();

    console.log('[AI Config] Loading Client...');
    console.log('[AI Config] GCP_PROJECT_ID:', PROJECT_ID ? 'Set' : 'Missing');

    const hasVertex = !!PROJECT_ID;
    const hasApiKey = !!API_KEY;

    let client: AIClient;

    if (hasVertex && hasApiKey) {
        console.log(`[AI] Using HBIRD Client: Vertex (Text + Image)`);
        const v = new VertexAIClientWrapper(PROJECT_ID!, LOCATION, CLIENT_EMAIL, PRIVATE_KEY);
        const s = new StandardAIClient(API_KEY!);
        client = new HybridAIClient(v, s);
    } else if (hasVertex) {
        console.log(`[AI] Using Vertex AI Only`);
        client = new VertexAIClientWrapper(PROJECT_ID!, LOCATION, CLIENT_EMAIL, PRIVATE_KEY);
    } else if (hasApiKey) {
        console.log(`[AI] Using Standard Google Generative AI (API Key) Only`);
        client = new StandardAIClient(API_KEY!);
    } else {
        throw new Error("Missing AI Credentials. Set GEMINI_API_KEY or GCP_PROJECT_ID.");
    }

    // Cache the client for future use
    cachedClient = client;
    return client;
}

