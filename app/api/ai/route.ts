import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { prompt, context, agent = 'generator' } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Use Gemini 2.0 Flash (Available in user's model list)
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        let systemPrompt = '';

        if (agent === 'teacher') {
            // --- AGENT: TEACHER ---
            systemPrompt = `
             You are a friendly vocabulary tutor helping an 8-year-old REMEMBER and UNDERSTAND a word.
             
             Word to explain: "${prompt}"
             ${context ? `Context: ${context}` : ''}
 
             Task:
             Provide a distinct explanation/clarification that is NOT just the definition. 
             Use analogies, mnemonics, or "Did you know?" style facts to make it stick.
             
             Required JSON Structure:
             {
                 "explanation": "string", 
                 "type": "analogy" | "mnemonic" | "fact",
                 "fun_fact": "string" 
             }
             `;
        } else {
            // --- AGENT: CONTENT GENERATOR (Default) ---
            systemPrompt = `
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
        }

        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text();
        const contentJson = JSON.parse(responseText);

        // Only generate image if we are in generator mode
        // Note: For now, we continue to use Pollinations for image generation 
        // to return a valid URL easily without needing image storage (Gemini returns base64).
        if (agent === 'generator') {
            // --- ARTIST ---
            const safeImagePrompt = encodeURIComponent(`${contentJson.visual_description} cartoon style children book illustration`);
            const imageUrl = `https://pollinations.ai/p/${safeImagePrompt}?width=800&height=600&seed=${Math.floor(Math.random() * 1000)}&nologo=true`;

            return NextResponse.json({
                text: JSON.stringify({
                    ...contentJson,
                    imageUrl: imageUrl
                })
            });
        } else {
            // For teacher agent, just return the text JSON
            return NextResponse.json({
                text: JSON.stringify(contentJson)
            });
        }

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

