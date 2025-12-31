
import { GoogleGenerativeAI } from '@google/generative-ai';
// import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually since we aren't in Next.js context
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = parseDotEnv(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ No GEMINI_API_KEY found in .env.local");
        process.exit(1);
    }

    console.log(`Checking models with API Key: ${apiKey.substring(0, 10)}... (hidden)`);

    try {
        // Unfortunately the Node SDK doesn't expose listModels easily on the main class 
        // in some versions, or requires a different manager.
        // But let's try the direct approach via fetch if the SDK method isn't obvious,
        // OR try to instantiate the model manager.

        // Actually, for this specific SDK version (@google/generative-ai), 
        // there isn't a direct "listModels" helper on the top-level class. 
        // We have to use the REST API to be sure, or just rely on documentation.
        // BUT, given the error message says "Call ListModels", let's try hitting the HTTP endpoint directly
        // to match what the server expects.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("\n✅ AVAILABLE MODELS:");
        // @ts-ignore
        data.models.forEach(m => {
            // Only show generateContent supported models
            if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                console.log(`- ${m.name} (Version: ${m.version})`);
            }
        });

    } catch (e: any) {
        console.error("❌ Failed to list models:", e.message);
    }
}

listModels();

// Simple dotenv parser
// Simple dotenv parser
function parseDotEnv(src: Buffer) {
    const obj: Record<string, string> = {};
    src.toString().split('\n').forEach(line => {
        const keyValueArr = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (keyValueArr != null) {
            const key = keyValueArr[1];
            let value = keyValueArr[2] || '';
            const len = value ? value.length : 0;
            if (len > 0 && value.charAt(0) === '"' && value.charAt(len - 1) === '"') {
                value = value.replace(/\\n/gm, '\n');
                value = value.replace(/\\r/gm, '\r');
                value = value.substring(1, len - 1);
            }
            obj[key] = value.trim();
        }
    });
    return obj;
}
