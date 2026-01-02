import { NextRequest, NextResponse } from 'next/server';
import { TestQuestionGeneratorAgent } from '@/services/agents/TestQuestionGeneratorAgent';
import { StoryAgent } from '@/services/agents/StoryAgent';
import { AgeAppropriatenessEvaluatorAgent } from '@/services/agents/AgeAppropriatenessEvaluatorAgent';
import { AgentContext, TestMode } from '@/services/agents/types';

export async function POST(req: NextRequest) {
    try {
        const { mode, count, context } = await req.json(); // { mode: TestMode, count: number, context: AgentContext }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        const evaluator = new AgeAppropriatenessEvaluatorAgent(apiKey);

        let generatedContent;

        if (mode === 'story-learning') {
            const storyAgent = new StoryAgent(apiKey);
            generatedContent = await storyAgent.generateStory(count, context || {});
        } else {
            // Backend validation: Ensure count doesn't exceed target words if provided
            let safeCount = count;
            if (context?.targetWords && Array.isArray(context.targetWords) && context.targetWords.length > 0) {
                safeCount = Math.min(count, context.targetWords.length);
            }

            const generator = new TestQuestionGeneratorAgent(apiKey);
            generatedContent = await generator.generate(mode, safeCount, context || {});
        }

        // Validate Content
        const validation = await evaluator.validate(generatedContent, context || {});

        if (!validation.safe) {
            if (validation.rewritten) {
                return NextResponse.json({ questions: validation.rewritten });
            }
            return NextResponse.json({ error: 'Generated content was flagged as inappropriate. Please try again with different parameters.' }, { status: 400 });
        }

        return NextResponse.json({ questions: generatedContent });

    } catch (error: any) {
        console.error('Test Generation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
