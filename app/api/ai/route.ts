import { NextRequest, NextResponse } from 'next/server';
import { getAIClient } from '@/app/lib/ai';
import { validateWord } from '@/services/validation/sharedValidator';
import { WordEvaluationAgent } from '@/services/agents/WordEvaluationAgent';

// Helper to wrap promise with timeout
const withTimeout = <T>(promise: Promise<T>, ms: number, errorMessage = 'Operation timed out'): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMessage)), ms))
    ]);
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Support 'word' (new) or 'prompt' (legacy/curl)
        const { word, prompt, context, agent = 'generator', mode = 'full' } = body;
        const targetWord = word || prompt;

        // 1. SHARED VALIDATOR (Fail Fast - Zero Cost)
        // Check for empty, length, regex, garbage
        const validation = validateWord(targetWord);
        console.log(`[Route] Validate: "${targetWord}" ->`, validation);
        if (!validation.isValid) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        const aiClient = getAIClient();


        // --- MODE: IMAGE ONLY (Lazy Load) ---
        // --- MODE: IMAGE ONLY (Lazy Load) ---
        if (mode === 'image_only') {
            try {
                console.log("[Route] Generating Image Only for prompt: ", targetWord);
                // Use existing image generation logic (waiting for P0 Refactor to Async Job later if needed, 
                // but for now keeping it simple as per Minimal-Safe plan)
                // Enforcing 10s timeout for image gen
                const imageUrl = await withTimeout(
                    aiClient.generateImage(targetWord),
                    10000,
                    'Image generation timed out'
                );
                return NextResponse.json({ imageUrl });
            } catch (imgError: any) {
                console.error("[Route] Failed to generate AI image", imgError);
                return NextResponse.json({ error: 'Could not paint picture' }, { status: 500 });
            }
        }

        // --- MODE: TEXT GENERATION (Default) ---

        // 2. EVALUATION GATE (Server-Side Limit)
        // Strict 800ms timeout check
        if (agent !== 'teacher') { // Skip for teacher mode since it's "Explain More"
            try {
                const evalAgent = new WordEvaluationAgent(process.env.GEMINI_API_KEY || '');
                // Note: We use a short timeout. If it expires, we FAIL SAFE (Option A).
                const evalResult = await withTimeout(
                    evalAgent.evaluate(targetWord),
                    2500,
                    'Validation timeout'
                );

                if (!evalResult.isValid) {
                    return NextResponse.json({ error: evalResult.reason || "We couldn't check this word." }, { status: 400 });
                }
            } catch (e: any) {
                console.error(`[Route] Eval Gate failed for "${targetWord}":`, e.message);
                // Option A: Reject request if we can't verify
                // "We couldn't check this word — try again."
                return NextResponse.json({ error: "We couldn't check this word — try again." }, { status: 422 });
            }
        }

        let systemPrompt = '';

        if (agent === 'teacher') {
            systemPrompt = `
             You are a friendly vocabulary tutor helping an 8-year-old REMEMBER and UNDERSTAND a word.
             Word to explain: "${targetWord}"
             ${context ? `Context: ${context}` : ''}
             Task: Provide a distinct explanation (analogy, mnemonic, fact).
             Required JSON Structure: { "explanation": "string", "type": "analogy" | "mnemonic" | "fact", "fun_fact": "string" }
             Return ONLY valid JSON.
             `;
        } else {
            systemPrompt = `
             You are a helpful vocabulary tutor for an 8-year-old child.
             Word to define: "${targetWord}"
             Task: Define, Example, Visual Description.
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

        // 3. GENERATION with CIRCUIT BREAKER / TIMEOUT
        // 8s Timeout for Text
        const responseText = await withTimeout(
            aiClient.generateContent("gemini-2.0-flash-exp", systemPrompt, { responseMimeType: "application/json" }),
            8000,
            'Text generation timed out'
        );

        const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const contentJson = JSON.parse(cleanText);

        // 4. NON-BLOCKING PICTURE (Lazy Load)
        // Always return null imageUrl initially to be fast.
        // Frontend will see null and request image_only.

        return NextResponse.json({
            text: JSON.stringify({
                ...contentJson,
                imageUrl: null // Force Lazy Load
            })
        });

    } catch (error: any) {
        console.error('Error generating AI content:', error);
        const msg = error.message || '';
        if (msg.includes('429') || msg.includes('Quota')) {
            return NextResponse.json({ error: 'Busy Bee! 🐝 Try again in a minute.' }, { status: 429 });
        }
        return NextResponse.json({
            error: 'Failed to generate content',
            details: msg
        }, { status: 500 });
    }
}

