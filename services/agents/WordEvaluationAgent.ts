import { GoogleGenerativeAI } from '@google/generative-ai';

export class WordEvaluationAgent {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        // Use flash model for speed
        this.model = this.genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: { responseMimeType: "application/json" }
        });
    }

    async evaluate(word: string): Promise<{ isValid: boolean; reason?: string }> {
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
            const result = await this.model.generateContent(prompt);
            const response = JSON.parse(result.response.text());
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
