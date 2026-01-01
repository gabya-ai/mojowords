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
            const generator = new TestQuestionGeneratorAgent(apiKey);
            generatedContent = await generator.generate(mode, count, context || {});
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
