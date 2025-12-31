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
        // Updated to use the lite model to avoid 429 Rate Limits
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

        const fullPrompt = context
            ? `Context: ${context}\n\nQuestion: ${prompt}`
            : prompt;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ text });

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
