'use client';

import { useState } from 'react';
import WordInput from '@/components/WordInput';
import WordCard from '@/components/WordCard';
import { useWords, Word } from '@/context/WordsContext';

export default function Home() {
  const { addWord, deleteWord, toggleStar, words, userProfile } = useWords();
  const [currentWordId, setCurrentWordId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get the current word object from context if it exists
  const currentWord = words.find(w => w.id === currentWordId);

  const handleWordSubmit = async (wordText: string) => {
    setIsLoading(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 600));

    // Mock word data generation
    const newId = Date.now().toString();
    const mockWord: Word = {
      id: newId,
      word: wordText,
      timestamp: Date.now(),
      definition: `A ${wordText} is a wonderful thing that helps us learn and grow. It's something special that we can use in many different ways.`,
      sentence: `I saw a beautiful ${wordText} in the garden today!`,
      imageUrl: `https://placehold.co/400x300/A2D8A2/ffffff.png?text=${encodeURIComponent(wordText)}`,
      gradeLevel: Math.floor(Math.random() * 5) + 1,
      difficulty: 'MEDIUM',
      isStarred: false
    };

    // Auto-save immediately
    addWord(mockWord);
    setCurrentWordId(newId);
    setIsLoading(false);
  };

  const handleDelete = () => {
    if (currentWordId) {
      deleteWord(currentWordId);
      setCurrentWordId(null);
    }
  };

  const handleToggleStar = () => {
    if (currentWordId) {
      toggleStar(currentWordId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Garden Header Section */}
      <div className="flex items-end justify-between pb-2 border-b border-[#F1F3C4]/50">
        <div>
          <h1 className="text-2xl font-extrabold text-[#4A6D51] tracking-tight">
            Hello, {userProfile.name}! 🌤️
          </h1>
          <p className="text-sm text-[#8A8A8A] font-bold mt-0.5">
            Ready to grow your vocabulary garden?
          </p>
        </div>

        {/* Daily Streak Widget */}
        <div className="bg-white/80 rounded-xl px-3 py-2 shadow-sm border border-[#F1F3C4] flex items-center gap-3 scale-90 origin-right">
          <div className="text-center">
            <p className="text-[10px] font-bold text-[#8A8A8A] uppercase leading-tight">Streak</p>
            <p className="text-lg font-extrabold text-[#F4B9B2] leading-tight">{userProfile.streak} Days</p>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-xs ${i <= userProfile.streak ? 'bg-[#FDF4C4] border-[#F1F3C4]' : 'bg-[#FDFBF7] border-gray-100'}`}>
                {i <= userProfile.streak ? '🌻' : ''}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Word Input Section - SIGNIFICANTLY WIDENED */}
      <div className="w-full transform transition-all hover:scale-[1.005]">
        <WordInput onSubmit={handleWordSubmit} isLoading={isLoading} />
      </div>

      {/* Word Card Display */}
      {currentWord && (
        <div className="max-w-2xl mx-auto animate-fade-in relative z-10">
          <WordCard
            word={currentWord}
            onDelete={handleDelete}
            onToggleStar={handleToggleStar}
          />
        </div>
      )}

      {/* Empty State / Hint */}
      {!currentWord && !isLoading && (
        <div className="text-center mt-8 py-8 px-6 rounded-2xl border-dashed border-2 border-[#C1E1C1] bg-[#FDFBF7]/50 max-w-lg mx-auto opacity-70">
          <div className="text-3xl mb-3">🌱</div>
          <p className="text-[#4A6D51] font-bold text-base">Your garden is waiting!</p>
          <p className="text-[#8A8A8A] text-sm mt-1">Type a word above to plant a new seed of knowledge.</p>
        </div>
      )}
    </div>
  );
}
