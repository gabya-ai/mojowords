import { NextRequest, NextResponse } from 'next/server';
import { AnswerEvaluationAgent } from '@/services/agents/AnswerEvaluationAgent';
import { ExplanationAgent } from '@/services/agents/ExplanationAgent';
import { getAIClient } from '@/app/lib/ai';

export async function POST(req: NextRequest) {
    try {
        const { question, userAnswer, context } = await req.json();

        // Use the Centralized AI Client (Standard/Vertex/Hybrid)
        const aiClient = getAIClient();

        // Evaluate
        // Note: AnswerEvaluationAgent logic is currently coupled to direct API Key usage. 
        // We probably need to refactor agents to accept 'AIClient' interface, 
        // OR temporarily extract the API Key from the client (less clean but faster).
        // Given we are in "Minimal Safe Change" mode:
        // We know getAIClient returns a client that *has* the credentials.
        // But the agents expect an apiKey string in constructor. 

        // BETTER PLAN: Update agents to use the AIClient interface instead of creating their own SDK instance.
        // But that's a larger refactor.
        // Quick Fix: Let's modify ExplanationAgent to take the AIClient.

        const evaluator = new AnswerEvaluationAgent(process.env.GEMINI_API_KEY!); // Keep strict key for now
        const explainer = new ExplanationAgent(aiClient);

        const result = await evaluator.evaluate(question, userAnswer, context || {});

        // Generate explanation
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
