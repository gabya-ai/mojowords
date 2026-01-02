import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { prompt, context } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // --- AGENT 1: CONTENT GENERATOR ---
        // Generates the educational content and a visual description for the artist
        // NOTE: We are using Pollinations.ai (OpenAI layout) which doesn't support responseMimeType: "application/json" natively consistently.
        // We must prompt engineer for strict JSON.
        const systemPrompt = `
        You are a helpful vocabulary tutor for an 8-year-old child.
        Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json ... \`\`\`.
        
        Word to define: "${prompt}"
        ${context ? `Context: ${context}` : ''}

        Task:
        1. Define the word simply.
        2. Write a fun example sentence.
        3. Create a "visual_description" - a detailed prompt for an artist to paint a picture that explains this word to a child. 
           - The image should be colorful, friendly, and clear.
           - Avoid text in the image.
           - Focus on the key concept.
        
        Required JSON Structure:
        {
            "definition": "string",
            "sentence": "string",
            "difficulty": "EASY" | "MEDIUM" | "CHALLENGE",
            "gradeLevel": number,
            "funFact": "string",
            "visual_description": "string"
        }
        `;

        // Call Pollinations.ai Text API
        // It accepts a simple POST with the prompt or OpenAI format. We'll use the simplest effective method.
        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: 'You are a JSON-only API. You must return raw JSON without any markdown or explanatory text.' },
                    { role: 'user', content: systemPrompt }
                ],
                model: 'openai', // Pollinations specific
                seed: Math.floor(Math.random() * 1000) // randomness
            }),
        });

        if (!response.ok) {
            throw new Error(`Pollinations API error: ${response.statusText}`);
        }

        const responseText = await response.text();

        // Sanitize output in case the model returns markdown code blocks despite instructions
        let cleanText = responseText.trim();
        if (cleanText.startsWith('```json')) {
            cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        let contentJson;
        try {
            contentJson = JSON.parse(cleanText);
        } catch (e) {
            console.error('Failed to parse JSON from AI:', cleanText);
            throw new Error('AI returned invalid JSON');
        }

        // --- AGENT 3: ARTIST ---
        // Pollinations URL format: https://pollinations.ai/p/{prompt}?width={w}&height={h}&seed={seed}
        const safeImagePrompt = encodeURIComponent(`${contentJson.visual_description} cartoon style children book illustration`);
        // Use nologo=true to avoid watermarks if possible, and ensure consistent size
        const imageUrl = `https://pollinations.ai/p/${safeImagePrompt}?width=800&height=600&seed=${Math.floor(Math.random() * 1000)}&nologo=true`;

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
