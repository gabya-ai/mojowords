import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
    try {
        const { prompt, context } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        // Mock response if no API key is present (Graceful degradation for development)
        if (!apiKey) {
            console.warn('GEMINI_API_KEY not found. Returning mock response.');
            return NextResponse.json({
                text: `[MOCK AI RESPONSE] You asked: "${prompt}". \n\n(To see real AI responses, please add GEMINI_API_KEY to your .env.local file.)`
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const fullPrompt = context
            ? `Context: ${context}\n\nQuestion: ${prompt}`
            : prompt;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ text });

    } catch (error) {
        console.error('Error generating AI content:', error);
        return NextResponse.json(
            { error: 'Failed to generate content' },
            { status: 500 }
        );
    }
}
