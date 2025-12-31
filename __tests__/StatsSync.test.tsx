import { renderHook, act } from '@testing-library/react';
import { useWords, WordsProvider } from '../context/WordsContext';

describe('WordsContext Stats', () => {
    it('increments view count when word is reviewed', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <WordsProvider>{children}</WordsProvider>
        );
        const { result } = renderHook(() => useWords(), { wrapper });

        // Add a word
        act(() => {
            result.current.addWord({
                id: '1',
                word: 'Test',
                definition: '',
                sentence: '',
                imageUrl: '',
                gradeLevel: 1,
                difficulty: 'EASY',
                timestamp: Date.now(),
                mastery: 0,
                views: 0
            });
        });

        // Mark as reviewed
        act(() => {
            result.current.markWordReviewed('1', 'EASY');
        });

        // Check if views incremented
        expect(result.current.words[0].views).toBe(1);

        // Mark again
        act(() => {
            result.current.markWordReviewed('1', 'HARD');
        });

        // Check if views incremented again
        expect(result.current.words[0].views).toBe(2);
    });
});
