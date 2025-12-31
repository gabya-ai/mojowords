'use client';

import { useState } from 'react';
import { ReviewFilters } from '@/services/reviewService';

interface FlashcardSettingsProps {
    onStart: (filters: ReviewFilters) => void;
}

export default function FlashcardSettings({ onStart }: FlashcardSettingsProps) {
    const [difficulty, setDifficulty] = useState<ReviewFilters['difficulty'] | 'ALL'>('ALL');
    const [recency, setRecency] = useState<ReviewFilters['recency']>('ALL_TIME');
    const [starredOnly, setStarredOnly] = useState(false);

    // Future: Manual Selection and Order
    // For now, keeping it simple as per scope, but including placeholders if needed or just the required filters.

    const handleStart = () => {
        const filters: ReviewFilters = {
            recency,
            starredOnly,
            difficulty: difficulty === 'ALL' ? undefined : difficulty
        };
        onStart(filters);
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto border-4 border-[#F1F3C4]">
            <h2 className="text-3xl font-extrabold text-[#4A6D51] mb-8 text-center">Customize Your Review 🎒</h2>

            <div className="space-y-8">
                {/* Difficulty Filter */}
                <div>
                    <h3 className="text-lg font-bold text-[#8A8A8A] mb-3">Difficulty</h3>
                    <div className="flex gap-3 flex-wrap">
                        {['ALL', 'EASY', 'MEDIUM', 'CHALLENGE'].map((d) => (
                            <button
                                key={d}
                                onClick={() => setDifficulty(d as any)}
                                className={`px-4 py-2 rounded-xl font-bold transition-all ${difficulty === d
                                        ? 'bg-[#A2D8A2] text-white shadow-md transform scale-105'
                                        : 'bg-[#FDFBF7] text-[#4A6D51] border border-[#F1F3C4] hover:bg-[#F1F3C4]'
                                    }`}
                            >
                                {d === 'ALL' ? 'All Levels' : d.charAt(0) + d.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recency Filter */}
                <div>
                    <h3 className="text-lg font-bold text-[#8A8A8A] mb-3">Recency</h3>
                    <div className="flex gap-3 flex-wrap">
                        {[
                            { id: 'ALL_TIME', label: 'All Time' },
                            { id: 'LAST_7_DAYS', label: 'Last 7 Days' },
                            { id: 'LAST_30_DAYS', label: 'Last 30 Days' }
                        ].map((r) => (
                            <button
                                key={r.id}
                                onClick={() => setRecency(r.id as any)}
                                className={`px-4 py-2 rounded-xl font-bold transition-all ${recency === r.id
                                        ? 'bg-[#FFE5B4] text-[#D4A373] shadow-md transform scale-105'
                                        : 'bg-[#FDFBF7] text-[#8A8A8A] border border-[#F1F3C4] hover:bg-[#F1F3C4]'
                                    }`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Starred Toggle */}
                <div className="flex items-center gap-3 bg-[#FDFBF7] p-4 rounded-xl border border-[#F1F3C4]">
                    <div
                        onClick={() => setStarredOnly(!starredOnly)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${starredOnly ? 'bg-[#F4B9B2] border-[#F4B9B2]' : 'border-gray-300 bg-white'
                            }`}
                        aria-label="Starred Only"
                    >
                        {starredOnly && <span className="text-white text-sm">✓</span>}
                    </div>
                    <span
                        className="font-bold text-[#4A6D51] cursor-pointer selection:bg-none"
                        onClick={() => setStarredOnly(!starredOnly)}
                    >
                        Show Starred Words Only ⭐
                    </span>
                </div>

                {/* Start Button */}
                <button
                    onClick={handleStart}
                    className="w-full py-4 bg-[#4A6D51] text-white font-extrabold text-xl rounded-2xl shadow-lg hover:bg-[#3A5D41] transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-4"
                >
                    <span>🚀</span> Start Review
                </button>
            </div>
        </div>
    );
}
