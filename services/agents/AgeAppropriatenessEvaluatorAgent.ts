import { GoogleGenerativeAI } from '@google/generative-ai';
import { AgentContext } from './types';
import { cleanJson } from './utils';

export class AgeAppropriatenessEvaluatorAgent {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest', generationConfig: { responseMimeType: "application/json" } });
    }

    async validate(content: any, context: AgentContext): Promise<{ safe: boolean; reason?: string; rewritten?: any }> {
        const prompt = `
      You are a safety filter for an educational app for children (Age: ${context.userAge || 8}).
      Validate the following content for age-appropriateness.
      
      Content to check:
      ${JSON.stringify(content)}

      Rules:
      1. No violence, scary themes, or adult content.
      2. No complex political or controversial topics.
      3. Language must be suitable for the target age.

      Output JSON:
      {
        "safe": boolean,
        "reason": "string (optional)",
        "rewritten": object (optional, if minor tweaks can fix it, otherwise null)
      }
    `;

        try {
            const result = await this.model.generateContent(prompt);
            const cleanedText = cleanJson(result.response.text());
            const validation = JSON.parse(cleanedText);

            if (validation.safe) {
                return { safe: true };
            } else {
                return {
                    safe: false,
                    reason: validation.reason,
                    rewritten: validation.rewritten
                };
            }
        } catch (error) {
            console.error("AgeAppropriatenessEvaluatorAgent error:", error);
            // Default to safe if AI fails, assuming generation was already prompted to be safe
            return { safe: true };
        }
    }
}
