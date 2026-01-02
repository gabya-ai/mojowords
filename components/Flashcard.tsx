'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Word } from '../context/WordsContext';

interface FlashcardProps {
    word: Word;
    onFlip: () => void;
    onResult: (difficulty: 'EASY' | 'MEDIUM' | 'HARD') => void;
}

export default function Flashcard({ word, onResult }: FlashcardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showImage, setShowImage] = useState(false);
    const [aiExplanation, setAiExplanation] = useState<string | null>(null);
    const [isLoadingAi, setIsLoadingAi] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleShowImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowImage(true);
    };

    const handleAiExplain = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent flip
        if (aiExplanation) return;

        setIsLoadingAi(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `Explain the word "${word.word}" to an 8-year-old.`,
                    context: `Word: ${word.word}, Definition: ${word.definition}, Sentence: ${word.sentence}`
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${res.status}: Failed to fetch AI`);
            }

            const data = await res.json();
            setAiExplanation(data.text);
        } catch (error: any) {
            console.error(error);
            setAiExplanation(`⚠️ ${error.message || 'Connection failed'}`);
        } finally {
            setIsLoadingAi(false);
        }
    };

    return (
        <div className="w-full max-w-md h-[400px] perspective-1000 mx-auto cursor-pointer group" onClick={handleFlip}>
            <div className={`relative w-full h-full duration-500 transform-style-3d transition-all ${isFlipped ? 'rotate-y-180' : ''}`}>

                {/* FRONT */}
                <div className="absolute w-full h-full bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center backface-hidden border-4 border-[#F1F3C4]">
                    <h2 className="text-4xl font-extrabold text-[#4A6D51] mb-6">{word.word}</h2>

                    {word.imageUrl && (
                        <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
                            {showImage ? (
                                <Image
                                    src={word.imageUrl}
                                    alt={word.word}
                                    fill
                                    className="object-contain rounded-xl"
                                />
                            ) : (
                                <button
                                    onClick={handleShowImage}
                                    className="bg-[#FFE5B4] text-[#D4A373] font-bold py-2 px-6 rounded-xl hover:bg-[#FFDAB9] shadow-sm text-sm"
                                >
                                    📷 Show Picture
                                </button>
                            )}
                        </div>
                    )}

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onResult('EASY');
                        }}
                        className="mt-auto bg-[#A8E6CF] hover:bg-[#88CCA0] text-[#4A6D51] p-4 rounded-full shadow-lg transition-transform active:scale-95"
                        aria-label="I know this word"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                    <p className="text-sm text-gray-400 mt-2 font-bold">I know it!</p>
                </div>

                {/* BACK */}
                <div className="absolute w-full h-full bg-[#FFF8E7] rounded-3xl shadow-xl p-8 flex flex-col items-center backface-hidden rotate-y-180 border-4 border-[#F4B9B2]">
                    <h3 className="text-2xl font-bold text-[#4A6D51] mb-2">{word.word}</h3>
                    <p className="text-lg text-gray-600 italic mb-4 text-center">{word.definition}</p>
                    <p className="text-md text-gray-500 text-center mb-6">&quot;{word.sentence}&quot;</p>

                    {/* AI Explanation Area - Enhanced */}
                    {aiExplanation && (
                        <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-dashed border-[#4A6D51]/30 w-full animate-fade-in overflow-y-auto max-h-48 scrollbar-thin scrollbar-thumb-[#C1E1C1] scrollbar-track-transparent">
                            <div className="flex items-center gap-2 mb-2 sticky top-0 bg-[#FDFBF7] py-1 border-b border-[#F1F3C4]">
                                <span className="text-xl">🤖</span>
                                <span className="font-bold text-[#4A6D51] text-sm uppercase tracking-wide">AI Says:</span>
                            </div>

                            <div className="text-sm text-[#4A6D51] leading-relaxed space-y-3">
                                {(() => {
                                    try {
                                        // Try to parse if it's JSON
                                        const parsed = JSON.parse(aiExplanation);
                                        return (
                                            <>
                                                {parsed.definition && (
                                                    <p>
                                                        <span className="font-bold">Definition:</span> {parsed.definition}
                                                    </p>
                                                )}
                                                {parsed.sentence && (
                                                    <p>
                                                        <span className="font-bold">Example:</span> &quot;{parsed.sentence}&quot;
                                                    </p>
                                                )}
                                                {parsed.fun_fact && (
                                                    <p className="italic text-[#8A8A8A]">
                                                        <span className="font-bold not-italic text-[#F4B9B2]">Did you know?</span> {parsed.fun_fact}
                                                    </p>
                                                )}
                                            </>
                                        );
                                    } catch (e) {
                                        // Fallback for plain text
                                        return <p>{aiExplanation}</p>;
                                    }
                                })()}
                            </div>
                        </div>
                    )}

                    {!aiExplanation && (
                        <button
                            onClick={handleAiExplain}
                            disabled={isLoadingAi}
                            className="bg-[#FFE5B4] text-[#D4A373] font-bold py-2 px-4 rounded-lg text-sm mb-auto hover:bg-[#FFDAB9] disabled:opacity-50"
                        >
                            {isLoadingAi ? 'Asking AI...' : '✨ Explain More'}
                        </button>
                    )}

                    <div className="grid grid-cols-3 gap-2 w-full mt-auto">
                        <button onClick={(e) => { e.stopPropagation(); onResult('HARD'); }} className="bg-[#FFB7B2] rounded-xl py-3 font-bold text-white shadow-md hover:bg-[#FF9E99]">Hard</button>
                        <button onClick={(e) => { e.stopPropagation(); onResult('MEDIUM'); }} className="bg-[#FFDAC1] rounded-xl py-3 font-bold text-white shadow-md hover:bg-[#FFC8A0]">Medium</button>
                        <button onClick={(e) => { e.stopPropagation(); onResult('EASY'); }} className="bg-[#E2F0CB] rounded-xl py-3 font-bold text-[#4A6D51] shadow-md hover:bg-[#C8E0A0]">Easy</button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>
        </div>
    );
}
