import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Embedded cleanJson
function cleanJson(text: string): string {
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstOpen = cleaned.indexOf('{');
    const firstArray = cleaned.indexOf('[');
    if (firstOpen !== -1 || firstArray !== -1) {
        const start = firstOpen !== -1 && (firstArray === -1 || firstOpen < firstArray) ? firstOpen : firstArray;
        const lastClose = cleaned.lastIndexOf(start === firstOpen ? '}' : ']');
        if (lastClose !== -1 && lastClose > start) {
            cleaned = cleaned.substring(start, lastClose + 1);
        }
    }
    return cleaned;
}

async function verifyBackend() {
    console.log("Starting backend verification...");

    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ ERROR: GEMINI_API_KEY is missing");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
        model: 'gemini-flash-latest',
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
        Generate 3 fill-in-the-blank questions for a vocabulary test.
        User Age: 8
        Interests: Dinosaurs
        
        Output JSON array of objects with id, type, targetWord, sentence, correctAnswer, options, explanation.
    `;

    console.log("Generating content...");
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log("--- RAW OUTPUT ---");
        console.log(text);
        console.log("------------------");

        const cleaned = cleanJson(text);
        console.log("--- CLEANED OUTPUT ---");
        console.log(cleaned);
        console.log("----------------------");

        const questions = JSON.parse(cleaned);
        console.log("✅ Parsing successful!");
        console.log("Count:", questions.length);
    } catch (error: any) {
        console.error("❌ FAILURE:", error);
    }
}

verifyBackend();
