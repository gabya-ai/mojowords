import { NextRequest, NextResponse } from 'next/server';
import { getAIClient } from '@/app/lib/ai';

export async function POST(req: NextRequest) {
    try {
        const { prompt, context, agent = 'generator', mode = 'full' } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const aiClient = getAIClient();

        // --- MODE: IMAGE ONLY ---
        if (mode === 'image_only') {
            try {
                console.log("[Route] Generating Image Only for prompt: ", prompt);
                const imageUrl = await aiClient.generateImage(prompt);
                return NextResponse.json({ imageUrl });
            } catch (imgError: any) {
                console.error("[Route] Failed to generate AI image", imgError);
                // Fallback to Pollinations
                const safeImagePrompt = encodeURIComponent(`${prompt} cartoon style children book illustration`);
                const imageUrl = `https://pollinations.ai/p/${safeImagePrompt}?width=512&height=512&seed=${Math.floor(Math.random() * 1000)}&nologo=true`;
                return NextResponse.json({ imageUrl });
            }
        }

        // --- MODE: TEXT GENERATION (Default / Text Only) ---
        let systemPrompt = '';

        if (agent === 'teacher') {
            // ... (Teacher Prompt - Unchanged) ...
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
             Return ONLY valid JSON.
             `;
        } else {
            // ... (Generator Prompt - Unchanged) ...
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
             Return ONLY valid JSON.
             `;
        }

        // Use unified client to generate content
        // Using gemini-2.0-flash-exp for text
        const responseText = await aiClient.generateContent("gemini-2.0-flash-exp", systemPrompt, {
            responseMimeType: "application/json"
        });

        // Clean potentially markdown-wrapped JSON
        const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const contentJson = JSON.parse(cleanText);

        // --- MODE: TEXT ONLY ---
        if (mode === 'text_only') {
            // Return text immediately, skip image generation
            return NextResponse.json({
                text: JSON.stringify({
                    ...contentJson,
                    imageUrl: null // Explicitly null to indicate no image yet
                })
            });
        }

        // --- MODE: FULL (Legacy/Default) ---
        // Only generate image if we are in generator mode
        if (agent === 'generator') {
            // --- ARTIST ---
            let imageUrl = '';
            try {
                console.log("[Route] Generating Image for visual description: ", contentJson.visual_description);
                // Use the Hybrid client's image generation (Standard/API Key)
                imageUrl = await aiClient.generateImage(contentJson.visual_description);
            } catch (imgError) {
                console.error("[Route] Failed to generate AI image, falling back to pollinations", imgError);
                // Fallback to Pollinations
                const safeImagePrompt = encodeURIComponent(`${contentJson.visual_description} cartoon style children book illustration`);
                imageUrl = `https://pollinations.ai/p/${safeImagePrompt}?width=800&height=600&seed=${Math.floor(Math.random() * 1000)}&nologo=true`;
            }

            return NextResponse.json({
                text: JSON.stringify({
                    ...contentJson,
                    imageUrl: imageUrl
                })
            });
        } else {
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

