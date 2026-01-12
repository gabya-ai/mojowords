import { getAIClient } from '@/app/lib/ai';

export class WordEvaluationAgent {

    async evaluate(word: string): Promise<{ isValid: boolean; reason?: string }> {
        const aiClient = getAIClient();
        const prompt = `
        You are a strict vocabulary filter.
        Is "${word}" a valid, real English word that is safe and appropriate for an 8-year-old child?
        
        Rules:
        - "aaa", "asdf", "gjs" -> isValid: false
        - "Damn", "Hell" (profanity) -> isValid: false
        - "Apple", "Dinosaur", "Supercalifragilisticexpialidocious" -> isValid: true
        - "Run", "Jump" -> isValid: true
        
        Output JSON:
        { "isValid": boolean, "reason": "string" }
        `;

        try {
            const responseText = await aiClient.generateContent('gemini-2.0-flash-exp', prompt, { responseMimeType: "application/json" });
            const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const response = JSON.parse(cleanText);
            return {
                isValid: response.isValid,
                reason: response.reason
            };
        } catch (error) {
            console.error("WordEvaluationAgent error:", error);
            // Fail safe on error (or allow if strictness prevents us?)
            // For P0 stability, if we can't verify, we should probably fail safe as per Option A.
            return { isValid: false, reason: "Verification failed" };
        }
    }
}
