import { useState, useCallback, useEffect } from 'react';
import { TestQuestion, TestMode, AgentContext, EvaluationResult } from '@/services/agents/types';

export type SessionStatus = 'config' | 'loading' | 'active' | 'submitting' | 'results';

export interface TestSessionState {
    questions: TestQuestion[];
    currentIndex: number;
    userAnswers: Record<string, string>; // questionId -> answer
    results: Record<string, { result: EvaluationResult; explanation: string }>;
    status: SessionStatus;
    config: {
        mode: TestMode;
        count: number;
        context: AgentContext;
    } | null;
}

export const useTestSession = () => {
    const [state, setState] = useState<TestSessionState>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('test_session_state');
                if (saved) {
                    return JSON.parse(saved);
                }
            } catch (e) {
                console.error("Failed to load session", e);
            }
        }
        return {
            questions: [],
            currentIndex: 0,
            userAnswers: {},
            results: {},
            status: 'config',
            config: null,
        };
    });

    // Persist state changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('test_session_state', JSON.stringify(state));
        }
    }, [state]);

    const startSession = useCallback(async (mode: TestMode, count: number, context: AgentContext) => {
        setState(prev => ({ ...prev, status: 'loading', config: { mode, count, context } }));

        try {
            const response = await fetch('/api/ai/test/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode, count, context }),
            });
            const data = await response.json();

            if (data.error) throw new Error(data.error);

            setState(prev => ({
                ...prev,
                questions: data.questions,
                status: 'active',
                currentIndex: 0,
                userAnswers: {},
                results: {},
            }));
        } catch (error) {
            console.error("Failed to start session:", error);
            setState(prev => ({ ...prev, status: 'config' })); // Go back to config on error
            // Ideally show error toast
        }
    }, []);

    const setAnswer = useCallback((answer: string) => {
        setState(prev => {
            const currentQ = prev.questions[prev.currentIndex];
            if (!currentQ) return prev;
            return {
                ...prev,
                userAnswers: { ...prev.userAnswers, [currentQ.id]: answer }
            };
        });
    }, []);

    const nextQuestion = useCallback(() => {
        setState(prev => {
            if (prev.currentIndex < prev.questions.length - 1) {
                return { ...prev, currentIndex: prev.currentIndex + 1 };
            }
            return prev;
        });
    }, []);

    const prevQuestion = useCallback(() => {
        setState(prev => {
            if (prev.currentIndex > 0) {
                return { ...prev, currentIndex: prev.currentIndex - 1 };
            }
            return prev;
        });
    }, []);

    const goToQuestion = useCallback((index: number) => {
        setState(prev => ({ ...prev, currentIndex: index }));
    }, []);

    const submitSession = useCallback(async () => {
        setState(prev => ({ ...prev, status: 'submitting' }));

        const { questions, userAnswers, config } = state;
        const newResults: Record<string, { result: EvaluationResult; explanation: string }> = {};

        try {
            // Parallel evaluation
            await Promise.all(questions.map(async (q) => {
                const answer = userAnswers[q.id] || ""; // Handle skipped
                const response = await fetch('/api/ai/test/evaluate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        question: q,
                        userAnswer: answer,
                        context: config?.context
                    }),
                });
                const data = await response.json();
                newResults[q.id] = data;
            }));

            setState(prev => ({
                ...prev,
                results: newResults,
                status: 'results'
            }));

        } catch (error) {
            console.error("Submission failed:", error);
            setState(prev => ({ ...prev, status: 'active' })); // Revert to active on error
        }
    }, [state]);

    const resetSession = useCallback(() => {
        setState({
            questions: [],
            currentIndex: 0,
            userAnswers: {},
            results: {},
            status: 'config',
            config: null,
        });
    }, []);

    return {
        state,
        startSession,
        setAnswer,
        nextQuestion,
        prevQuestion,
        goToQuestion,
        submitSession,
        resetSession
    };
};
