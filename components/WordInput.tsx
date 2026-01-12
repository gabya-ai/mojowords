'use client';

import { useState, FormEvent } from 'react';
import { validateWord } from '@/services/validation/sharedValidator';

interface WordInputProps {
    onSubmit: (word: string) => void;
    isLoading: boolean;
}

export default function WordInput({ onSubmit, isLoading }: WordInputProps) {
    const [word, setWord] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        const { isValid, error: validationError } = validateWord(word);

        if (!isValid) {
            setError(validationError || 'Invalid word');
            return;
        }

        if (word.trim()) {
            onSubmit(word.trim());
            setWord('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="bg-white rounded-2xl shadow-soft p-5 border border-[#F1F3C4]">
                <label htmlFor="word-input" className="block text-base font-bold text-[#4A6D51] mb-3 flex items-center gap-2">
                    <span className="text-[#F4B9B2]">✨</span> Enter a word to learn:
                </label>

                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <input
                            id="word-input"
                            type="text"
                            value={word}
                            onChange={(e) => {
                                setWord(e.target.value);
                                if (error) setError(null);
                            }}
                            placeholder="Type a word..."
                            disabled={isLoading}
                            className={`flex-1 px-4 py-3 text-lg border-2 rounded-xl focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder-[#C1E1C1] ${error
                                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50'
                                    : 'border-[#F1F3C4] focus:border-[#A2D8A2] focus:ring-[#C1E1C1]/20'
                                }`}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !isLoading) {
                                    e.preventDefault();
                                    handleSubmit(e as any);
                                }
                            }}
                        />

                        <button
                            type="submit"
                            disabled={isLoading || !word.trim()}
                            className="px-6 py-3 bg-[#C1E1C1] hover:bg-[#A2D8A2] text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-sm flex items-center gap-2"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <>🚀 <span className="hidden sm:inline">Learn!</span></>
                            )}
                        </button>
                    </div>
                    {error && (
                        <p className="text-sm text-red-500 font-bold ml-1 animate-pulse">{error}</p>
                    )}
                </div>
            </div>
        </form>
    );
}
