import { GoogleGenerativeAI } from '@google/generative-ai';
import { VertexAI, GenerativeModel } from '@google-cloud/vertexai';

/**
 * Unified AI Client
 * Automatically switches between Standard API (API Key) and Vertex AI (Application Default Credentials)
 */

const PROJECT_ID = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
const LOCATION = process.env.GCP_LOCATION || 'us-central1';
const API_KEY = process.env.GEMINI_API_KEY;

// Credentials for Serverless/Vercel (Avoiding JSON file upload issues)
const CLIENT_EMAIL = process.env.GCP_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Handle newlines in env vars

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
        // Try to use a valid model for API key based image generation
        // Note: GoogleGenerativeAI SDK interaction for Imagen might vary, 
        // effectively treating it as 'generateContent' but handling the image response.
        // We will try 'gemini-2.5-flash-image' which is available on the API Key
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });
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
            throw new Error("No image data found in response");
        } catch (e) {
            console.error("StandardAIClient Image Gen Error:", e);
            throw e;
        }
    }
}

class VertexAIClientWrapper implements AIClient {
    private vertexAI: VertexAI;

    constructor(projectId: string, location: string) {
        // If specific credentials are provided (e.g. Vercel), use them.
        // Otherwise, fallback to Application Default Credentials (Local gcloud)
        const authOptions = (CLIENT_EMAIL && PRIVATE_KEY) ? {
            credentials: {
                client_email: CLIENT_EMAIL,
                private_key: PRIVATE_KEY
            }
        } : undefined;

        this.vertexAI = new VertexAI({
            project: projectId,
            location: location,
            googleAuthOptions: authOptions
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
        throw new Error("Vertex AI Image Generation is quota-limited. Use Hybrid client.");
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
        // use Vertex for Text (Reliable, Verified Quota)
        return this.vertexClient.generateContent(model, prompt, config);
    }

    async generateImage(prompt: string): Promise<string> {
        // use Standard (API Key) for Image (70/day Free Quota)
        return this.stdClient.generateImage(prompt);
    }
}

// Initializer
export function getAIClient(): AIClient {
    const hasVertex = !!PROJECT_ID;
    const hasApiKey = !!API_KEY;

    if (hasVertex && hasApiKey) {
        console.log(`[AI] Using HBIRD Client: Vertex (Text) + Standard (Image)`);
        const v = new VertexAIClientWrapper(PROJECT_ID!, LOCATION);
        const s = new StandardAIClient(API_KEY!);
        return new HybridAIClient(v, s);
    } else if (hasVertex) {
        console.log(`[AI] Using Vertex AI Only`);
        return new VertexAIClientWrapper(PROJECT_ID!, LOCATION);
    } else if (hasApiKey) {
        console.log(`[AI] Using Standard Google Generative AI (API Key) Only`);
        return new StandardAIClient(API_KEY!);
    } else {
        throw new Error("Missing AI Credentials. Set GEMINI_API_KEY or GCP_PROJECT_ID.");
    }
}
