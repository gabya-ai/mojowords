'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTestContext } from '@/context/TestContext';
import { TestMode } from '@/services/agents/types';
import { useWords } from '@/context/WordsContext';

export default function TestConfigPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = (searchParams.get('mode') as TestMode) || 'multiple-choice';
    const { startSession } = useTestContext();
    const { words } = useWords();

    const [count, setCount] = useState(5);
    const [difficulty, setDifficulty] = useState('medium');
    const [theme, setTheme] = useState('Adventure');
    const [source, setSource] = useState<'starred' | 'recent' | 'all' | 'random'>('all');
    const [isStarting, setIsStarting] = useState(false);

    // Filter words based on source
    const getTargetWords = () => {
        let filtered = [];
        switch (source) {
            case 'starred':
                filtered = words.filter(w => w.isStarred);
                break;
            case 'recent':
                filtered = [...words].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
                break;
            case 'all':
                filtered = words;
                break;
            case 'random':
            default:
                return []; // Agent will generate unrelated words
        }
        // Extract actual strings, shuffle if needed, and slice to count
        return filtered.map(w => w.word).sort(() => 0.5 - Math.random()).slice(0, count);
    };

    const handleStart = async () => {
        const targetWords = getTargetWords();

        // Validation
        if (source === 'starred' && targetWords.length === 0) {
            alert("You don't have enough starred words!");
            return;
        }

        setIsStarting(true);
        await startSession(mode, count, {
            difficultyLevel: difficulty as any,
            userInterests: mode === 'story-learning' ? [theme] : [],
            userAge: 8,
            targetWords: targetWords
        });
        router.push('/test/session');
    };

    const starredCount = words.filter(w => w.isStarred).length;

    return (
        <div className="max-w-xl mx-auto space-y-8">
            <div>
                <button
                    onClick={() => router.back()}
                    className="text-gray-500 hover:text-gray-700 mb-4 flex items-center text-sm"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-bold capitalize pt-1">Configure {mode.replace(/-/g, ' ')}</h1>
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

                {/* Source Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vocabulary Source</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setSource('all')}
                            className={`p-3 rounded-lg border text-left text-sm ${source === 'all' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                            <div className="font-semibold text-gray-900">All Words</div>
                            <div className="text-gray-500 text-xs">Mix from your collection ({words.length})</div>
                        </button>
                        <button
                            onClick={() => setSource('recent')}
                            className={`p-3 rounded-lg border text-left text-sm ${source === 'recent' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                            <div className="font-semibold text-gray-900">Recently Added</div>
                            <div className="text-gray-500 text-xs">Last 10 planted words</div>
                        </button>
                        <button
                            onClick={() => setSource('starred')}
                            disabled={starredCount === 0}
                            className={`p-3 rounded-lg border text-left text-sm ${source === 'starred' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : starredCount === 0 ? 'opacity-50 cursor-not-allowed border-gray-100' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                            <div className="font-semibold text-gray-900">Starred Only</div>
                            <div className="text-gray-500 text-xs">{starredCount} favorites available</div>
                        </button>
                        <button
                            onClick={() => setSource('random')}
                            className={`p-3 rounded-lg border text-left text-sm ${source === 'random' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                            <div className="font-semibold text-gray-900">Surprise Me 🎲</div>
                            <div className="text-gray-500 text-xs">New words generated by AI</div>
                        </button>
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
