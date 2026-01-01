import { GoogleGenerativeAI } from '@google/generative-ai';
import { IExplanationAgent, EvaluationResult, TestQuestion } from './types';

export class ExplanationAgent implements IExplanationAgent {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: "application/json" } });
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
            const chatResult = await this.model.generateContent(prompt);
            const json = JSON.parse(chatResult.response.text());
            return json.explanation;
        } catch (error) {
            return `The correct answer was "${question.correctAnswer}".`;
        }
    }
}
