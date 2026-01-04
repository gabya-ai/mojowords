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
    const [imageError, setImageError] = useState(false);
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
                    context: `Word: ${word.word}, Definition: ${word.definition}, Sentence: ${word.sentence}`,
                    agent: 'teacher'
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
        <div
            className="w-full max-w-md mx-auto cursor-pointer group perspective-1000"
            onClick={handleFlip}
        >
            <div
                className={`relative w-full transition-transform duration-700 transform-style-3d grid grid-cols-1 ${isFlipped ? 'rotate-y-180' : ''}`}
            >

                {/* FRONT */}
                <div
                    className="grid-area-1-1 w-full bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center backface-hidden border-4 border-[#F1F3C4] min-h-[400px]"
                >
                    <h2 className="text-4xl font-extrabold text-[#4A6D51] mb-8 text-center">{word.word}</h2>

                    {word.imageUrl && (
                        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                            {showImage && !imageError ? (
                                <Image
                                    src={word.imageUrl}
                                    alt={word.word}
                                    fill
                                    unoptimized={true}
                                    className="object-contain rounded-xl"
                                    onError={() => setImageError(true)}
                                />
                            ) : showImage && imageError ? (
                                <div className="text-center text-red-300 text-xs font-bold">
                                    Image failed to load
                                </div>
                            ) : (
                                <button
                                    onClick={handleShowImage}
                                    className="bg-[#FFE5B4] text-[#D4A373] font-bold py-3 px-8 rounded-xl hover:bg-[#FFDAB9] shadow-sm text-base transition-transform hover:scale-105"
                                >
                                    📷 Show Picture
                                </button>
                            )}
                        </div>
                    )}

                    <div className="mt-auto flex flex-col items-center">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onResult('EASY');
                            }}
                            className="bg-[#A8E6CF] hover:bg-[#88CCA0] text-[#4A6D51] p-5 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 mb-3"
                            aria-label="I know this word"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-wide">I know it!</p>
                    </div>
                </div>

                {/* BACK */}
                <div
                    className="grid-area-1-1 w-full bg-[#FFF8E7] rounded-3xl shadow-xl p-6 flex flex-col backface-hidden rotate-y-180 border-4 border-[#F4B9B2] min-h-[400px]"
                >
                    <h3 className="text-2xl font-black text-[#4A6D51] mb-4 text-center border-b-2 border-[#F4B9B2]/20 pb-2">{word.word}</h3>

                    <div className="space-y-4 flex-grow">
                        <div>
                            <span className="text-xs font-black text-[#F4B9B2] uppercase tracking-wider block mb-1">Definition</span>
                            <p className="text-lg text-gray-700 font-medium leading-relaxed">{word.definition}</p>
                        </div>

                        <div>
                            <span className="text-xs font-black text-[#F4B9B2] uppercase tracking-wider block mb-1">Example</span>
                            <p className="text-base text-gray-500 italic">&quot;{word.sentence}&quot;</p>
                        </div>

                        {/* AI Explanation Area - Enhanced */}
                        {aiExplanation ? (
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F1F3C4] animate-fade-in mt-4 relative">
                                <div className="absolute -top-3 left-4 bg-[#A2D8A2] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-sm">
                                    AI Teacher
                                </div>
                                <div className="text-base text-gray-700 leading-relaxed mt-1">
                                    {(() => {
                                        try {
                                            const parsed = JSON.parse(aiExplanation);
                                            // Handle Teacher Agent response
                                            if (parsed.explanation) {
                                                return (
                                                    <div className="space-y-3">
                                                        {parsed.type && (
                                                            <div className="text-[10px] font-bold text-[#A2D8A2] uppercase tracking-wide mb-1">
                                                                {parsed.type}
                                                            </div>
                                                        )}
                                                        <p>{parsed.explanation}</p>
                                                        {parsed.fun_fact && (
                                                            <div className="bg-[#FFF8E7] p-3 rounded-lg mt-2 text-sm">
                                                                <span className="font-bold text-[#F4B9B2] mr-1">💡 Fun Fact:</span>
                                                                {parsed.fun_fact}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            }
                                            // Fallback for old format or generator responses
                                            return (
                                                <div className="space-y-3">
                                                    {parsed.definition && <p>{parsed.definition}</p>}
                                                    {parsed.sentence && <p className="italic text-gray-500">&quot;{parsed.sentence}&quot;</p>}
                                                    {parsed.fun_fact && (
                                                        <div className="bg-[#FFF8E7] p-3 rounded-lg mt-2 text-sm">
                                                            <span className="font-bold text-[#F4B9B2] mr-1">💡 Fun Fact:</span>
                                                            {parsed.fun_fact}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        } catch (e) {
                                            return <p>{aiExplanation}</p>;
                                        }
                                    })()}
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center py-4">
                                <button
                                    onClick={handleAiExplain}
                                    disabled={isLoadingAi}
                                    className="bg-[#FFE5B4] text-[#D4A373] font-bold py-2 px-6 rounded-xl text-sm hover:bg-[#FFDAB9] disabled:opacity-50 transition-colors flex items-center gap-2"
                                >
                                    {isLoadingAi ? (
                                        <>Thinking... <span className="animate-bounce">🤔</span></>
                                    ) : (
                                        <>✨ Explain More</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-4 border-t border-[#F4B9B2]/20">
                        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">How hard was this word?</p>
                        <div className="grid grid-cols-3 gap-3">
                            <button onClick={(e) => { e.stopPropagation(); onResult('HARD'); }} className="group flex flex-col items-center gap-1">
                                <span className="w-full bg-[#FFB7B2] rounded-xl py-3 font-bold text-white shadow-md group-hover:bg-[#FF9E99] group-active:scale-95 transition-all">Hard</span>
                                <span className="text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">😓</span>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onResult('MEDIUM'); }} className="group flex flex-col items-center gap-1">
                                <span className="w-full bg-[#FFDAC1] rounded-xl py-3 font-bold text-white shadow-md group-hover:bg-[#FFC8A0] group-active:scale-95 transition-all">Medium</span>
                                <span className="text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">😐</span>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onResult('EASY'); }} className="group flex flex-col items-center gap-1">
                                <span className="w-full bg-[#E2F0CB] rounded-xl py-3 font-bold text-[#4A6D51] shadow-md group-hover:bg-[#C8E0A0] group-active:scale-95 transition-all">Easy</span>
                                <span className="text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">🤩</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .grid-area-1-1 { grid-area: 1 / 1; }
            `}</style>
        </div>
    );
}
