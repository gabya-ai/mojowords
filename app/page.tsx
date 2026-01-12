'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import WordInput from '@/components/WordInput';
import WordCard from '@/components/WordCard';
import { useWords, Word } from '@/context/WordsContext';

export default function Home() {
  const { addWord, deleteWord, toggleStar, words, userProfile, parentSettings } = useWords();
  const [currentWordId, setCurrentWordId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Redirect to onboarding if not completed (based on PARENT account status)
  useEffect(() => {
    // Only redirect if we are authenticated (have a parent) and they haven't onboarded
    if (parentSettings.hasCompletedOnboarding === false && parentSettings.email) {
      router.push('/onboarding');
    }
  }, [parentSettings.hasCompletedOnboarding, parentSettings.email, router]);

  // Get the current word object from context if it exists
  const currentWord = words.find(w => w.id === currentWordId);

  const handleWordSubmit = async (wordText: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Call the AI API
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'text_only',
          word: wordText,
          // prompt: ... REMOVED, constructed on server
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error(`Offline Mode: ${errorData.message || 'API Key Missing'}`);
        }
        if (response.status === 429 || errorData.error === 'RATE_LIMIT_EXCEEDED') {
          throw new Error(`Busy Bee! 🐝 The garden is crowded. Please wait a few seconds and try again.`);
        }
        // Surface the real backend error details
        throw new Error(errorData.error || errorData.details || errorData.message || `AI Request Failed (${response.status})`);
      }

      const data = await response.json();

      // Parse the text result as JSON
      let aiResult;
      try {
        const cleanText = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
        aiResult = JSON.parse(cleanText);
      } catch (e) {
        console.error("Failed to parse AI response:", data.text);
        throw new Error("Invalid AI response format");
      }

      // 2. Create the Word object
      const newId = Date.now().toString();
      const newWord: Word = {
        id: newId,
        word: wordText,
        timestamp: Date.now(),
        definition: aiResult.definition,
        sentence: aiResult.sentence,
        imageUrl: '', // Empty to trigger "Generate" button
        gradeLevel: aiResult.gradeLevel || 1,
        difficulty: (aiResult.difficulty as 'EASY' | 'MEDIUM' | 'CHALLENGE') || 'MEDIUM',
        isStarred: false,
        comment: ''
      };

      const savedWord = await addWord(newWord);
      setCurrentWordId(savedWord.id);

    } catch (error: any) {
      console.error("Error fetching word data:", error);
      setError(error.message || "Failed to generate word.");
      // CRITICAL: NO SILENT FALLBACK TO MOCK DATA
    } finally {
      setIsLoading(false);
    }
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

        <div className="flex items-center gap-3">
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
      </div>

      <div className="w-full transform transition-all hover:scale-[1.005]">
        <WordInput onSubmit={handleWordSubmit} isLoading={isLoading} />
        {error && (
          <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-sm font-bold text-center animate-pulse">
            ⚠️ {error}
          </div>
        )}
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





      {/* Footer Request: Stability Mode */}
      <div className="fixed bottom-0 left-0 w-full bg-red-600 text-white text-center py-1 text-xs font-bold uppercase tracking-widest z-50 opacity-90">
        Stability Mode Active
      </div>
    </div>
  );
}
