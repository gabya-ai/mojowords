import { IExplanationAgent, EvaluationResult, TestQuestion } from './types';
import { getAIClient } from '@/app/lib/ai';

interface AIClient {
    generateContent(model: string, prompt: string, config?: any): Promise<string>;
}

export class ExplanationAgent implements IExplanationAgent {
    private client: AIClient;

    constructor(client: AIClient) {
        this.client = client;
    }

    async explain(question: TestQuestion, userAnswer: string, result: EvaluationResult): Promise<string> {
        const prompt = `
      Provide a simple, encouraging explanation for an 8-year-old student review.
      
      Question Type: ${question.type}
      Correct Answer: "${question.correctAnswer}"
      User Answer: "${userAnswer}"
      Was Correct: ${result.isCorrect}
      Target Word: "${question.targetWord}"

      Task:
      1. Explain why the correct answer is right.
      2. If the user was wrong, gently explain why their answer wasn't the best fit.
      3. Keep it under 2 sentences.

      Output JSON:
      {
        "explanation": "string"
      }
    `;

        try {
            const responseText = await this.client.generateContent(
                'gemini-2.0-flash-exp', // Use consistent strong model
                prompt,
                { responseMimeType: "application/json" }
            );
            const json = JSON.parse(responseText);
            return json.explanation;
        } catch (error) {
            console.error("Explanation Agent failed:", error);
            return `The correct answer was "${question.correctAnswer}".`;
        }
    }
}
