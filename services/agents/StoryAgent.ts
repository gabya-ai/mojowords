import { GoogleGenerativeAI } from '@google/generative-ai';
import { AgentContext, TestQuestion, StoryQuestion } from './types';

export interface IStoryAgent {
  generateStory(count: number, context: AgentContext): Promise<TestQuestion[]>;
}

export class StoryAgent implements IStoryAgent {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest', generationConfig: { responseMimeType: "application/json" } });
  }

  async generateStory(count: number, context: AgentContext): Promise<TestQuestion[]> {
    const simpleContext = `
      User Age: ${context.userAge || 8}
      Interests: ${context.userInterests?.join(', ') || 'General'}
      Target Words: ${context.targetWords?.join(', ') || 'Any age-appropriate words'}
      Difficulty: ${context.difficultyLevel || 'medium'}
      Theme: ${context.userInterests?.[0] || 'Adventure'}
    `;

    const prompt = `
      Generate a short story for a vocabulary test.
      The story should contain exactly ${count} target vocabulary words that are suitable for the user.
      
      Context: ${simpleContext}

      Task:
      1. Write a cohesive story.
      2. Identify ${count} sentences in the story that contain a target vocabulary word.
      3. For each sentence, create a question where the target word is blanked out or asked about.
      4. The 'storySegment' can be the surrounding paragraph or the sentence itself.

      Output JSON array of objects:
      [
        {
          "id": "uuid",
          "type": "story-learning",
          "targetWord": "targetword",
          "storySegment": "The full paragraph context...", // The text WITHOUT the blank, user sees context
          "questionPrompt": "Fill in the blank: The ____ jumped.", // The specific task
          "correctAnswer": "cow"
        }
      ]
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const questions = JSON.parse(text) as StoryQuestion[];

      return questions.map(q => ({
        ...q,
        id: crypto.randomUUID(),
        type: 'story-learning'
      }));

    } catch (error) {
      console.error("StoryAgent error:", error);
      throw new Error("Failed to generate story questions");
    }
  }
}
