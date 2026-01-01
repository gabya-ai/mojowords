'use client';

import { useWords } from '@/context/WordsContext';
import { useState, useEffect } from 'react';
import { LocalSavedQuestionRepo, SavedQuestion } from '@/services/savedQuestionRepo';

export default function VocabularyPage() {
    const { words, deleteWord, toggleStar, updateComment } = useWords();
    const [searchTerm, setSearchTerm] = useState('');
    const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState<SavedQuestion | null>(null);

    // Load saved questions
    useEffect(() => {
        const repo = new LocalSavedQuestionRepo();
        repo.getAll().then(setSavedQuestions);
    }, []);

    // Helper to find saved question for a word
    const getSavedQ = (wordText: string) => {
        return savedQuestions.find(q => q.targetWord.toLowerCase() === wordText.toLowerCase());
    };

    // Limit to 100 recent words if no search term, otherwise search all words
    const filteredWords = searchTerm
        ? words.filter(word =>
            word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
            word.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (word.comment && word.comment.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : words.slice(0, 100);

    return (
        <div className="space-y-6 max-w-5xl mx-auto relative">
            {/* Modal for Saved Question */}
            {selectedQuestion && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedQuestion(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-indigo-700 capitalize">{selectedQuestion.targetWord} Assessment</h3>
                            <button onClick={() => setSelectedQuestion(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-lg font-medium text-gray-800">
                            {selectedQuestion.type === 'fill-in-blank' ? (selectedQuestion as any).sentence :
                                selectedQuestion.type === 'multiple-choice' ? (selectedQuestion as any).questionStem :
                                    (selectedQuestion as any).questionPrompt}
                        </div>
                        <div className="space-y-2">
                            <div className="text-sm font-bold text-green-700">Correct Answer: {selectedQuestion.correctAnswer}</div>
                            {(selectedQuestion as any).explanation && (
                                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    💡 {(selectedQuestion as any).explanation}
                                </p>
                            )}
                        </div>
                        <div className="pt-2 text-right">
                            <button onClick={() => setSelectedQuestion(null)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-end border-b-2 border-[#F1F3C4] pb-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#4A6D51] mb-0.5">My Vocabulary Garden 🌳</h1>
                    <p className="text-[#8A8A8A] font-bold text-sm">
                        <span className="text-[#F4B9B2] text-base">{words.length}</span> unique words collected
                    </p>
                </div>

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search your garden..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-3 py-2 rounded-lg border-2 border-[#F1F3C4] focus:border-[#A2D8A2] focus:ring-4 focus:ring-[#C1E1C1]/30 outline-none transition-all w-52 text-[#4A6D51] font-bold text-sm placeholder-[#C1E1C1] bg-white"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base">🔍</span>
                </div>
            </div>

            {/* Vocabulary Table */}
            <div className="bg-white rounded-2xl shadow-soft border border-[#F1F3C4]/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#FDF4C4]/30 border-b border-[#F1F3C4]">
                            <tr>
                                <th className="px-5 py-3 text-left text-[10px] font-extrabold text-[#8A8A8A] uppercase tracking-wider w-12">Mark</th>
                                <th className="px-5 py-3 text-left text-[10px] font-extrabold text-[#8A8A8A] uppercase tracking-wider">Word</th>
                                <th className="px-5 py-3 text-left text-[10px] font-extrabold text-[#8A8A8A] uppercase tracking-wider">Meaning</th>
                                <th className="px-5 py-3 text-center text-[10px] font-extrabold text-[#8A8A8A] uppercase tracking-wider">Views</th>
                                <th className="px-5 py-3 text-center text-[10px] font-extrabold text-[#8A8A8A] uppercase tracking-wider w-12">Test</th>
                                <th className="px-5 py-3 text-left text-[10px] font-extrabold text-[#8A8A8A] uppercase tracking-wider w-1/3">Garden Notes</th>
                                <th className="px-5 py-3 text-center text-[10px] font-extrabold text-[#8A8A8A] uppercase tracking-wider w-16">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredWords.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-[#8A8A8A] font-bold text-base">
                                        {searchTerm ? '🍂 No words found in this pile.' : '🌱 Your garden is empty. Start planting words!'}
                                    </td>
                                </tr>
                            ) : (
                                filteredWords.map((word) => {
                                    const savedQ = getSavedQ(word.word);
                                    return (
                                        <tr key={word.id} className="hover:bg-[#FDFBF7] transition-colors group">
                                            <td className="px-5 py-3">
                                                <button
                                                    onClick={() => toggleStar(word.id)}
                                                    className={`text-lg transition-all hover:scale-110 active:scale-95 ${word.isStarred ? 'text-[#F4B9B2] drop-shadow-sm' : 'text-[#E5E5E5] hover:text-[#F4B9B2]/50'}`}
                                                >
                                                    ★
                                                </button>
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <div className="text-base font-black text-[#4A6D51] capitalize tracking-tight">{word.word}</div>
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#C1E1C1]/30 text-[#4A6D51] mt-0.5 border border-[#C1E1C1]/50">
                                                    Grade {word.gradeLevel}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="text-xs text-[#4A6D51] font-medium leading-relaxed max-w-sm">{word.definition}</div>
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <span className="text-xs font-bold text-[#D4A373] bg-[#FFE5B4]/50 px-2 py-1 rounded-full">{word.views || 0}</span>
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                {savedQ && (
                                                    <button
                                                        onClick={() => setSelectedQuestion(savedQ)}
                                                        className="w-3 h-3 bg-indigo-500 rounded-full hover:scale-125 transition-transform cursor-pointer shadow-sm ring-2 ring-indigo-200"
                                                        title="View Saved Question"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-5 py-3">
                                                <input
                                                    type="text"
                                                    placeholder="Add a note..."
                                                    value={word.comment || ''}
                                                    onChange={(e) => updateComment(word.id, e.target.value)}
                                                    className="w-full bg-[#FDFBF7] border border-transparent focus:border-[#A2D8A2] focus:bg-white rounded-md px-2 py-1.5 text-xs text-[#4A6D51] outline-none transition-all placeholder-[#C1E1C1]"
                                                />
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => deleteWord(word.id)}
                                                    className="text-[#C1E1C1] hover:text-red-400 transition-colors p-1.5 rounded-full hover:bg-red-50"
                                                    title="Delete from garden"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
