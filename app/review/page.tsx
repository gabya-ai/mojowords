'use client';

import { useState, useEffect } from 'react';
import { useWords } from '../../context/WordsContext';
import Flashcard from '../../components/Flashcard';
import FlashcardSettings from '../../components/FlashcardSettings';
import { ReviewService, ReviewFilters } from '../../services/reviewService';
import Link from 'next/link';

export default function ReviewPage() {
    const { words, markWordReviewed, markWordViewed } = useWords();
    const [step, setStep] = useState<'SETUP' | 'SESSION'>('SETUP');
    const [queue, setQueue] = useState<typeof words>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sessionStats, setSessionStats] = useState({ easy: 0 });
    const [seenWords, setSeenWords] = useState<Set<string>>(new Set());
    const [isComplete, setIsComplete] = useState(false);

    const handleStartReview = async (filters: ReviewFilters) => {
        const service = new ReviewService();
        // Since backend is missing/stubbed, we filter locally for now
        let filtered = [...words];
        if (filters.difficulty) {
            filtered = filtered.filter(w => w.difficulty === filters.difficulty);
        }
        if (filters.starredOnly) {
            filtered = filtered.filter(w => w.isStarred);
        }

        if (filtered.length === 0) {
            alert("No words match your filters! Try different settings.");
            return;
        }

        setQueue(filtered.sort(() => Math.random() - 0.5));
        setStep('SESSION');
        setCurrentIndex(0);
        setSeenWords(new Set());
        setSessionStats({ easy: 0 });
        setIsComplete(false);
    };

    // Track "Seen" / "Viewed" whenever word changes
    useEffect(() => {
        if (step === 'SESSION' && queue.length > 0) {
            const currentWord = queue[currentIndex];
            if (currentWord) {
                // Update Session Stats
                setSeenWords(prev => {
                    const newSet = new Set(prev);
                    newSet.add(currentWord.id);
                    return newSet;
                });

                // Update Global Stats (Implicit Review / Exposure)
                markWordViewed(currentWord.id);
            }
        }
    }, [currentIndex, step, queue]); // markWordViewed is stable

    const handleResult = (difficulty: 'EASY' | 'MEDIUM' | 'HARD') => {
        const currentWord = queue[currentIndex];
        markWordReviewed(currentWord.id, difficulty);

        setSessionStats(prev => ({
            easy: difficulty === 'EASY' ? prev.easy + 1 : prev.easy
        }));

        handleNext();
    };

    const handleNext = () => {
        if (currentIndex < queue.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsComplete(true);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleExit = () => {
        if (confirm("Exit review? Progress is saved.")) {
            setStep('SETUP');
        }
    };

    if (step === 'SETUP') {
        return (
            <div className="min-h-screen bg-[#FFF8E7] p-4 flex flex-col">
                <div className="p-4 mb-4">
                    <Link href="/" className="text-[#4A6D51] font-bold hover:underline flex items-center gap-2">
                        <span>←</span> Back Home
                    </Link>
                </div>
                <FlashcardSettings onStart={handleStartReview} />
            </div>
        );
    }

    if (isComplete) {
        return (
            <div className="min-h-screen bg-[#FFF8E7] p-8 flex flex-col items-center justify-center text-center animate-fade-in">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-4xl font-extrabold text-[#4A6D51] mb-6">Great Job!</h2>
                <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border-4 border-[#F1F3C4]">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-500 font-bold">Words Reviewed</span>
                        <span className="text-2xl font-bold text-[#4A6D51]">{seenWords.size}</span>
                    </div>
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-500 font-bold">Mastered (Easy)</span>
                        <span className="text-2xl font-bold text-[#A8E6CF]">{sessionStats.easy}</span>
                    </div>
                </div>
                <div className="flex gap-4 mt-8">
                    <button
                        onClick={() => setStep('SETUP')}
                        className="bg-[#FFE5B4] text-[#D4A373] font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-[#FFDAB9]"
                    >
                        Review Again
                    </button>
                    <Link href="/" className="bg-[#4A6D51] text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-[#3A5D41]">
                        Back Home
                    </Link>
                </div>
            </div>
        );
    }

    const currentWord = queue[currentIndex];

    if (!currentWord) return null;

    return (
        <div className="min-h-screen bg-[#FFF8E7] flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <button onClick={handleExit} className="text-[#4A6D51] font-bold hover:underline flex items-center gap-1 group">
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Exit
                </button>
                <div className="text-[#D4A373] font-bold">
                    Word {currentIndex + 1} of {queue.length}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 relative">

                <div className="w-full max-w-2xl flex items-center justify-center gap-4">
                    {/* Left Arrow */}
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="p-4 rounded-full bg-white shadow-md disabled:opacity-30 hover:bg-[#F1F3C4] transition-colors text-[#4A6D51] font-bold"
                        aria-label="Previous Word"
                    >
                        ←
                    </button>

                    <div className="flex-1">
                        <Flashcard
                            key={currentWord.id}
                            word={currentWord}
                            onFlip={() => { }}
                            onResult={handleResult}
                        />
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={handleNext}
                        className="p-4 rounded-full bg-white shadow-md hover:bg-[#F1F3C4] transition-colors text-[#4A6D51] font-bold"
                        aria-label="Next Word"
                    >
                        →
                    </button>
                </div>

            </div>
        </div>
    );
}
