'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTestContext } from '@/context/TestContext';
import { LocalSavedQuestionRepo } from '@/services/savedQuestionRepo';

export default function TestResultsPage() {
    const router = useRouter();
    const {
        state: { questions, userAnswers, results, status },
        resetSession
    } = useTestContext();

    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
    const repo = new LocalSavedQuestionRepo();

    useEffect(() => {
        if (status !== 'results' && status !== 'submitting') {
            router.replace('/test');
        }
    }, [status, router]);

    if (status === 'submitting') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-600">Evaluating your answers...</p>
            </div>
        );
    }

    // Calculate score
    const totalQuestions = questions.length;
    const correctCount = Object.values(results).filter(r => r.result.isCorrect).length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    const handleSave = async (id: string, q: any) => {
        await repo.save(q);
        setSavedIds(prev => new Set(prev).add(id));
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Complete!</h1>
                <div className="text-6xl font-bold text-indigo-600 my-6">{scorePercentage}%</div>
                <p className="text-gray-500 mb-6">
                    You got {correctCount} out of {totalQuestions} correct.
                    {scorePercentage === 100 ? " Perfect score! 🎉" : scorePercentage > 70 ? " Great job! 👏" : " Keep practicing! 💪"}
                </p>
                <button
                    onClick={() => { resetSession(); router.push('/test'); }}
                    className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800"
                >
                    Back to Menu
                </button>
            </div>

            <h2 className="text-xl font-bold text-gray-800 px-2">Review Answers</h2>

            <div className="space-y-4">
                {questions.map((q, idx) => {
                    const res = results[q.id];
                    const isCorrect = res?.result.isCorrect;
                    const userAnswer = userAnswers[q.id];

                    return (
                        <div key={q.id} className={`bg-white p-6 rounded-xl border ${isCorrect ? 'border-green-200' : 'border-red-200'} shadow-sm`}>
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-sm font-bold text-gray-400">Question {idx + 1}</span>
                                <button
                                    onClick={() => handleSave(q.id, q)}
                                    className={`text-sm font-medium flex items-center gap-1 ${savedIds.has(q.id) ? 'text-green-600' : 'text-indigo-600 hover:text-indigo-800'}`}
                                    disabled={savedIds.has(q.id)}
                                >
                                    {savedIds.has(q.id) ? '✓ Saved' : '🔖 Save for Later'}
                                </button>
                            </div>

                            <div className="mb-4">
                                <p className="font-serif text-lg text-gray-800">
                                    {q.type === 'fill-in-blank' ? (q as any).sentence :
                                        q.type === 'multiple-choice' ? (q as any).questionStem :
                                            (q as any).questionPrompt}
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                    <div className="font-bold mb-1">Your Answer</div>
                                    {userAnswer || "(Skipped)"}
                                </div>
                                {!isCorrect && (
                                    <div className="p-3 rounded-lg bg-green-50 text-green-800">
                                        <div className="font-bold mb-1">Correct Answer</div>
                                        {q.correctAnswer}
                                    </div>
                                )}
                            </div>

                            {res?.explanation && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-gray-700 text-sm border-l-4 border-indigo-300">
                                    <div className="font-bold text-indigo-900 mb-1">💡 Explanation</div>
                                    {res.explanation}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
