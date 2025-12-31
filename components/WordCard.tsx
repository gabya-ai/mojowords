'use client';

import { Word } from '@/context/WordsContext';
import { useState } from 'react';

interface WordCardProps {
    word: Word;
    onDelete: () => void;
    onToggleStar: () => void;
}

export default function WordCard({ word, onDelete, onToggleStar }: WordCardProps) {
    const [showMarkedConfirm, setShowMarkedConfirm] = useState(false);

    const difficultyColors: Record<string, string> = {
        EASY: 'bg-[#C1E1C1] text-[#4A6D51] border-transparent',
        MEDIUM: 'bg-[#FDF4C4] text-yellow-700 border-yellow-200',
        CHALLENGE: 'bg-[#F4B9B2] text-red-700 border-red-200'
    };

    const handleStarClick = () => {
        onToggleStar();
        if (!word.isStarred) {
            setShowMarkedConfirm(true);
            setTimeout(() => setShowMarkedConfirm(false), 2000);
        }
    };

    return (
        <div className="glass-panel rounded-2xl shadow-card overflow-hidden border border-white/60 relative">

            {/* Toast Notification */}
            <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#4A6D51] text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 z-50 shadow-md ${showMarkedConfirm ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                ✨ Marked!
            </div>

            {/* Header Bar - Compact */}
            <div className="px-6 py-4 flex items-start justify-between bg-white/40 border-b border-white/50">
                <div>
                    <h2 className="text-2xl font-extrabold text-[#4A6D51] capitalize tracking-tight">
                        {word.word}
                    </h2>
                    <div className="flex gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${difficultyColors[word.difficulty] || 'bg-gray-100'}`}>
                            Grade {word.gradeLevel}
                        </span>
                        <span className="text-[10px] font-bold text-[#8A8A8A] self-center flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#A2D8A2]"></span> Saved
                        </span>
                    </div>
                </div>

                <div className="flex gap-1.5">
                    {/* Mark Button */}
                    <button
                        onClick={handleStarClick}
                        className={`p-2 rounded-lg transition-all ${word.isStarred ? 'bg-[#FDF4C4] text-yellow-500 scale-105' : 'bg-white/50 text-[#C1E1C1] hover:bg-[#FDF4C4] hover:text-[#4A6D51]'}`}
                        title="Mark as important"
                    >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                    </button>

                    {/* Delete Button */}
                    <button
                        onClick={onDelete}
                        className="p-2 rounded-lg bg-white/50 text-[#C1E1C1] hover:bg-red-50 hover:text-red-400 transition-all"
                        title="Delete this word"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content Area - Compact */}
            <div className="p-6 space-y-6">

                {/* Definition & Sentence Section */}
                <div className="space-y-4">
                    <div className="text-gray-700 leading-relaxed font-medium text-base">
                        <span className="text-[#4A6D51] text-[10px] font-extrabold uppercase tracking-wider block mb-0.5 opacity-70">Definition</span>
                        {word.definition}
                    </div>

                    <div className="bg-[#F4B9B2]/10 p-4 rounded-xl border-l-4 border-[#F4B9B2]">
                        <span className="text-[#F4B9B2] text-[10px] font-extrabold uppercase tracking-wider block mb-0.5">Example</span>
                        <p className="text-base text-gray-700 italic font-medium">
                            "{word.sentence}"
                        </p>
                    </div>
                </div>

                {/* Separator */}
                <div className="border-t border-[#F1F3C4]"></div>

                {/* Image Section - Reduced Height */}
                <div className="relative h-48 w-full rounded-xl overflow-hidden shadow-inner bg-[#FDFBF7] group border border-white">
                    <img
                        src={word.imageUrl}
                        alt={word.word}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-md">
                        AI Generated
                    </div>
                </div>

            </div>
        </div>
    );
}
