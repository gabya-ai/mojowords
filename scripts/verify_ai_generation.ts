
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function verifyAi() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ No API Key found');
        process.exit(1);
    }

    console.log('✅ API Key found');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: "application/json" } });

    console.log('🤖 Testing Gemini 1.5 Flash text generation...');
    try {
        const result = await model.generateContent('Define "Astronaut" for a child. Return specific JSON format.');
        const text = result.response.text();
        console.log('✅ Text Generation Success:', text.substring(0, 100) + '...');

        try {
            JSON.parse(text);
            console.log('✅ JSON Parsing Success');
        } catch (e) {
            console.error('❌ JSON Parsing Failed:', e);
        }

    } catch (error: any) {
        console.error('❌ Text Generation Failed:', error.message);
    }

    console.log('🎨 Testing Pollinations URL construction...');
    const funPrompt = "Cute astronaut cat";
    const encoded = encodeURIComponent(funPrompt);
    const url = `https://pollinations.ai/p/${encoded}?width=800&height=600&seed=123&nologo=true`;
    console.log('Generated URL:', url);

    // Optional: Check if URL works (simple fetch)
    try {
        const imgRes = await fetch(url);
        if (imgRes.ok) {
            console.log('✅ Image URL is reachable (Status:', imgRes.status, ')');
        } else {
            console.error('❌ Image URL unreachable:', imgRes.status);
        }
    } catch (e: any) {
        console.error('❌ Image Fetch Failed:', e.message);
    }
}

verifyAi();
