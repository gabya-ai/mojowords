
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    console.log("Testing Hybrid AI Client...");
    // Dynamic import to ensure env vars are loaded first
    const { getAIClient } = await import('../app/lib/ai');

    try {
        const client = getAIClient();

        // 1. Test Text Generation (Should use Vertex AI -> gemini-2.0-flash-exp)
        console.log("\n--- Testing Text Generation (Vertex AI) ---");
        const textResponse = await client.generateContent("gemini-2.0-flash-exp", "Say 'Vertex AI works!'");
        console.log("Text Response:", textResponse);

        // 2. Test Image Generation (Should use API Key -> imagen-3.0-generate-001)
        console.log("\n--- Testing Image Generation (API Key) ---");
        // Simple prompt to avoid safety filters
        const imageResponse = await client.generateImage("A simple red circle");

        if (imageResponse.startsWith('data:image')) {
            console.log("Image Response: Success! (Base64 data received)");
            console.log("Length:", imageResponse.length);
        } else {
            console.log("Image Response:", imageResponse);
        }

    } catch (error: any) {
        console.error("❌ Error:", error);
    }
}

main();
