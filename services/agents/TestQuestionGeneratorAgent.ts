import { GoogleGenerativeAI } from '@google/generative-ai';
import { ITestQuestionGeneratorAgent, TestMode, AgentContext, TestQuestion } from './types';

export class TestQuestionGeneratorAgent implements ITestQuestionGeneratorAgent {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: "application/json" } });
  }

  async generate(mode: TestMode, count: number, context: AgentContext): Promise<TestQuestion[]> {
    if (mode === 'story-learning') {
      throw new Error("Use StoryAgent for story-learning mode");
    }

    const simpleContext = `
      User Age: ${context.userAge || 8}
      Interests: ${context.userInterests?.join(', ') || 'General'}
      Target Words: ${context.targetWords?.join(', ') || 'Any age-appropriate words'}
      Difficulty: ${context.difficultyLevel || 'medium'}
    `;

    let prompt = "";

    if (mode === 'fill-in-blank') {
      prompt = `
        Generate ${count} fill-in-the-blank questions for a vocabulary test.
        Context: ${simpleContext}
        
        For each question:
        1. create a sentence with a missing word (the target word).
        2. ensure the sentence helps deduce the word.
        3. provide the correct answer and a simple explanation.

        Output JSON array:
        [
          {
            "id": "unique-id-1",
            "type": "fill-in-blank",
            "targetWord": "word",
            "sentence": "The ____ jumped over the moon.",
            "correctAnswer": "cow",
            "explanation": "Because cows are often in nursery rhymes jumping over moons."
          }
        ]
      `;
    } else if (mode === 'multiple-choice') {
      prompt = `
        Generate ${count} multiple-choice questions for a vocabulary test.
        Context: ${simpleContext}

        For each question:
        1. create a question stem asking for a definition or synonym/usage.
        2. provide 1 correct answer and 3 plausible distractors.
        3. distractors must be age-appropriate.

        Output JSON array:
        [
          {
            "id": "unique-id-1",
            "type": "multiple-choice",
            "targetWord": "word",
            "questionStem": "What does 'enormous' mean?",
            "options": ["Very small", "Very big", "Red", "Sleepy"],
            "correctAnswer": "Very big",
            "explanation": "Enormous means something usually large."
          }
        ]
      `;
    }

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const questions = JSON.parse(text) as TestQuestion[];

      // Post-processing to ensure IDs are unique if AI fails to do so (or just assign UUIDs here)
      return questions.map((q, idx) => ({
        ...q,
        id: crypto.randomUUID(), // overwrite with real UUID
        type: mode === 'fill-in-blank' ? 'fill-in-blank' : 'multiple-choice'
      })) as TestQuestion[];

    } catch (error) {
      console.error("TestQuestionGeneratorAgent error:", error);
      throw new Error("Failed to generate questions");
    }
  }
}
