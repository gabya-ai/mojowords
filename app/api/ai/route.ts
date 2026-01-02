import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { prompt, context, agent = 'generator' } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        let systemPrompt = '';

        if (agent === 'teacher') {
            // --- AGENT: TEACHER ---
            // Focuses on clarification, memorization, and simple explanations.
            systemPrompt = `
             You are a friendly vocabulary tutor helping an 8-year-old REMEMBER and UNDERSTAND a word.
             Return ONLY valid JSON.
             
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
            // Generates the initial educational content and a visual description
            systemPrompt = `
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
        }

        // Call Pollinations.ai Text API
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
                model: 'openai',
                seed: Math.floor(Math.random() * 1000)
            }),
        });

        if (!response.ok) {
            throw new Error(`Pollinations API error: ${response.statusText}`);
        }

        const responseText = await response.text();

        // Sanitize output
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

        // Only generate image if we are in generator mode
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
