export type TestMode = 'fill-in-blank' | 'multiple-choice' | 'story-learning';

export interface AgentContext {
    userAge?: number;
    userInterests?: string[];
    targetWords?: string[];
    difficultyLevel?: 'easy' | 'medium' | 'hard';
}

export interface QuestionBase {
    id: string;
    type: TestMode;
    targetWord: string;
}

export interface FillInBlankQuestion extends QuestionBase {
    type: 'fill-in-blank';
    sentence: string; // The sentence with the blank
    correctAnswer: string;
    explanation: string;
}

export interface MultipleChoiceQuestion extends QuestionBase {
    type: 'multiple-choice';
    questionStem: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

export interface StoryQuestion extends QuestionBase {
    type: 'story-learning';
    storySegment: string; // The part of the story relevant to this question (or full story if small)
    questionPrompt: string;
    correctAnswer: string; // Could be the word itself found in the text
}

export type TestQuestion = FillInBlankQuestion | MultipleChoiceQuestion | StoryQuestion;

export interface EvaluationResult {
    isCorrect: boolean;
    score: number; // 0 to 1, or points
    feedback: string;
    correctedAnswer?: string;
}

export interface ITestQuestionGeneratorAgent {
    generate(mode: TestMode, count: number, context: AgentContext): Promise<TestQuestion[]>;
}

export interface IAnswerEvaluationAgent {
    evaluate(question: TestQuestion, userAnswer: string, context: AgentContext): Promise<EvaluationResult>;
}

export interface IExplanationAgent {
    explain(question: TestQuestion, userAnswer: string, result: EvaluationResult): Promise<string>;
}
