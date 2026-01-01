'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTestContext } from '@/context/TestContext';
import { TestQuestion } from '@/services/agents/types';

export default function TestSessionPage() {
    const router = useRouter();
    const {
        state: { questions, currentIndex, userAnswers, status },
        setAnswer,
        nextQuestion,
        prevQuestion,
        submitSession
    } = useTestContext();

    // Redirect if no session
    useEffect(() => {
        if (status === 'config' || (status === 'active' && questions.length === 0)) {
            router.replace('/test');
        }
        if (status === 'results') {
            router.replace('/test/results');
        }
    }, [status, questions.length, router]);

    if (status === 'loading' || questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-600">Generating your test...</p>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const currentAnswer = userAnswers[currentQuestion.id] || "";

    const isLast = currentIndex === questions.length - 1;

    const handleSubmit = async () => {
        await submitSession();
        // Context update will trigger useEffect redirect to results
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <span className="font-medium text-gray-500">Question {currentIndex + 1} of {questions.length}</span>
                <div className="flex gap-1">
                    {questions.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-2 w-8 rounded-full ${idx === currentIndex ? 'bg-indigo-600' : idx < currentIndex ? 'bg-indigo-200' : 'bg-gray-200'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 min-h-[400px] flex flex-col">

                {/* Fill-in-Blank UI */}
                {currentQuestion.type === 'fill-in-blank' && (
                    <div className="flex-1">
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold mb-4">Fill in the Blank</span>
                        <h2 className="text-2xl font-serif leading-relaxed text-gray-800">
                            {(currentQuestion as any).sentence.split('____').map((part: string, i: number, arr: any[]) => (
                                <span key={i}>
                                    {part}
                                    {i < arr.length - 1 && (
                                        <input
                                            type="text"
                                            value={currentAnswer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            className="mx-2 border-b-2 border-indigo-400 focus:border-indigo-600 focus:outline-none text-center w-32 font-bold text-indigo-700 bg-indigo-50"
                                            placeholder="?"
                                            autoFocus
                                        />
                                    )}
                                </span>
                            ))}
                        </h2>
                    </div>
                )}

                {/* Multiple Choice UI */}
                {currentQuestion.type === 'multiple-choice' && (
                    <div className="flex-1">
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold mb-4">Multiple Choice</span>
                        <h2 className="text-2xl font-medium text-gray-900 mb-8">
                            {(currentQuestion as any).questionStem}
                        </h2>
                        <div className="grid grid-cols-1 gap-3">
                            {(currentQuestion as any).options.map((opt: string) => (
                                <button
                                    key={opt}
                                    onClick={() => setAnswer(opt)}
                                    className={`p-4 rounded-lg border-2 text-left transition-all ${currentAnswer === opt
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold shadow-sm'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Story Mode UI */}
                {currentQuestion.type === 'story-learning' && (
                    <div className="flex-1">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold mb-4">Story Mode</span>
                        <div className="prose prose-lg text-gray-600 mb-6 bg-gray-50 p-4 rounded-lg italic border-l-4 border-green-500">
                            "{(currentQuestion as any).storySegment}"
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-4">
                            {(currentQuestion as any).questionPrompt}
                        </h3>
                        <input
                            type="text"
                            value={currentAnswer}
                            onChange={(e) => setAnswer(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Type your answer here..."
                        />
                    </div>
                )}

                {/* Navigation */}
                <div className="mt-8 flex justify-between pt-6 border-t border-gray-100">
                    <button
                        onClick={prevQuestion}
                        disabled={currentIndex === 0}
                        className="px-6 py-2 text-gray-500 hover:text-gray-900 font-medium disabled:opacity-30 transition-colors"
                    >
                        Previous
                    </button>

                    {isLast ? (
                        <button
                            onClick={handleSubmit}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
                        >
                            Submit Exam
                        </button>
                    ) : (
                        <button
                            onClick={nextQuestion}
                            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-8 py-2 rounded-lg font-medium shadow-sm transition-all"
                        >
                            Next Question
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
