'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTestContext } from '@/context/TestContext';
import { TestMode } from '@/services/agents/types';

export default function TestConfigPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = (searchParams.get('mode') as TestMode) || 'multiple-choice';
    const { startSession } = useTestContext();

    const [count, setCount] = useState(5);
    const [difficulty, setDifficulty] = useState('medium');
    const [theme, setTheme] = useState('Adventure');
    const [isStarting, setIsStarting] = useState(false);

    // You might want to pull User Age or Interests from a global user context if available
    // For now we hardcode or let them pick context implicitly via "Difficulty"

    const handleStart = async () => {
        setIsStarting(true);
        await startSession(mode, count, {
            difficultyLevel: difficulty as any,
            userInterests: mode === 'story-learning' ? [theme] : [],
            userAge: 8 // default
        });
        router.push('/test/session');
    };

    return (
        <div className="max-w-xl mx-auto space-y-8">
            <div>
                <button
                    onClick={() => router.back()}
                    className="text-gray-500 hover:text-gray-700 mb-4 flex items-center text-sm"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-bold capitalize">Configure {mode.replace(/-/g, ' ')}</h1>
                <p className="text-gray-600">Customize your assessment settings.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">

                {/* Count Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                    <div className="flex gap-4">
                        {[3, 5, 10].map(n => (
                            <button
                                key={n}
                                onClick={() => setCount(n)}
                                className={`px-4 py-2 rounded-lg border ${count === n ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 hover:border-indigo-300'}`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Difficulty Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                        <option value="easy">Easy (Simple words, multiple hints)</option>
                        <option value="medium">Medium (Standard)</option>
                        <option value="hard">Hard (Strict spelling, complex words)</option>
                    </select>
                </div>

                {/* Story Theme Selection (Only for Story Mode) */}
                {mode === 'story-learning' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Story Theme</label>
                        <input
                            type="text"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            placeholder="e.g. Space, Magic, Animals"
                        />
                    </div>
                )}

                <div className="pt-4">
                    <button
                        onClick={handleStart}
                        disabled={isStarting}
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        {isStarting ? 'Generating Test...' : 'Start Test'}
                    </button>
                </div>
            </div>
        </div>
    );
}
