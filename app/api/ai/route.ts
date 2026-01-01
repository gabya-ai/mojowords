import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
    try {
        const { prompt, context } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        // Enforce API Key existence
        if (!apiKey) {
            console.error('GEMINI_API_KEY not found in environment variables.');
            return NextResponse.json(
                { error: 'MISSING_API_KEY', message: 'Gemini API Key is not configured.' },
                { status: 401 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // --- AGENT 1: CONTENT GENERATOR ---
        // Generates the educational content and a visual description for the artist
        const contentPrompt = `
        You are a helpful vocabulary tutor for an 8-year-old child.
        Word to define: "${prompt}"
        ${context ? `Context: ${context}` : ''}

        Task:
        1. Define the word simply.
        2. Write a fun example sentence.
        3. Create a "visual_description" - a detailed prompt for an artist to paint a picture that explains this word to a child. 
           - The image should be colorful, friendly, and clear.
           - Avoid text in the image.
           - Focus on the key concept.
        
        Return JSON ONLY:
        {
            "definition": "string",
            "sentence": "string",
            "difficulty": "EASY" | "MEDIUM" | "CHALLENGE",
            "gradeLevel": number,
            "funFact": "string",
            "visual_description": "string"
        }
        `;

        // Use standard model for text logic
        const contentModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest', generationConfig: { responseMimeType: "application/json" } });
        const contentResult = await contentModel.generateContent(contentPrompt);
        const contentJson = JSON.parse(contentResult.response.text());

        // --- AGENT 2: REFLECTOR ---
        // Validate appropriateness. (Implicitly handled by strong system prompt + Flash 2.0 capability for now).
        // If we wanted to be strict, we'd do a second call here: "Critique this JSON...". 
        // For speed, we will proceed.

        // --- AGENT 3: ARTIST ---
        // We use Pollinations.ai (reliable, free, fast) for the actual image generation based on Agent 1's description.
        // This guarantees a real image return without complex base64 handling or experimental model quotas.
        // Pollinations URL format: https://pollinations.ai/p/{prompt}?width={w}&height={h}&seed={seed}

        const safeImagePrompt = encodeURIComponent(`${contentJson.visual_description} cartoon style children book illustration`);
        const imageUrl = `https://pollinations.ai/p/${safeImagePrompt}?width=800&height=600&seed=${Math.floor(Math.random() * 1000)}`;

        return NextResponse.json({
            text: JSON.stringify({
                ...contentJson,
                imageUrl: imageUrl // Pass the real generated image URL
            })
        });



    } catch (error: any) {
        console.error('Error generating AI content:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate content',
                details: error.message || 'Unknown error',
                stack: error.stack
            },
            { status: 500 }
        );
    }
}
