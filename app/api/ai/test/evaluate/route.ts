import { NextRequest, NextResponse } from 'next/server';
import { AnswerEvaluationAgent } from '@/services/agents/AnswerEvaluationAgent';
import { ExplanationAgent } from '@/services/agents/ExplanationAgent';

export async function POST(req: NextRequest) {
    try {
        const { question, userAnswer, context } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        const evaluator = new AnswerEvaluationAgent(apiKey);
        const explainer = new ExplanationAgent(apiKey);

        const result = await evaluator.evaluate(question, userAnswer, context || {});

        // Generate explanation immediately or later? 
        // The UX Flow says: "Results page... See AI explanation". 
        // We can generate it now and store it.

        const explanation = await explainer.explain(question, userAnswer, result);

        return NextResponse.json({
            result,
            explanation
        });

    } catch (error: any) {
        console.error('Test Evaluation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
