import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAnswerEvaluationAgent, EvaluationResult, TestQuestion, AgentContext } from './types';

export class AnswerEvaluationAgent implements IAnswerEvaluationAgent {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: "application/json" } });
    }

    async evaluate(question: TestQuestion, userAnswer: string, context: AgentContext): Promise<EvaluationResult> {
        // Quick check for exact match to save API call and time
        if (userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
            return {
                isCorrect: true,
                score: 1,
                feedback: "Correct!"
            };
        }

        // AI Evaluation for edge cases or helpful feedback
        const prompt = `
      Evaluate the user's answer for a vocabulary test.
      Target Word: "${question.targetWord}"
      Correct Answer: "${question.correctAnswer}"
      User Answer: "${userAnswer}"
      Question Type: ${question.type}
      Context: ${question.type === 'fill-in-blank' ? (question as any).sentence : (question as any).questionPrompt}

      Task:
      Determine if the answer is correct. 
      - If it's a minor typo (1-2 letters) for an 8-year-old, you might mark it correct or partially correct, but usually strict spelling is preferred for vocabulary. 
      - If it is a synonym that fits perfectly, check if strict mode is implied. Assume strict matching for "Test Mode" unless it's clearly a valid alternative.
      
      Output JSON:
      {
        "isCorrect": boolean,
        "score": number, // 0 to 1
        "feedback": "string", // Short feedback for the child
        "correctedAnswer": "string" // The correct spelling if they got it wrong
      }
    `;

        try {
            const result = await this.model.generateContent(prompt);
            const evalResult = JSON.parse(result.response.text()) as EvaluationResult;
            return evalResult;
        } catch (error) {
            console.error("AnswerEvaluationAgent error:", error);
            // Fallback to strict comparison
            const isCorrect = userAnswer.toLowerCase().trim() === question.targetWord.toLowerCase().trim();
            return {
                isCorrect,
                score: isCorrect ? 1 : 0,
                feedback: isCorrect ? "Correct!" : "Incorrect.",
                correctedAnswer: question.correctAnswer
            };
        }
    }
}
