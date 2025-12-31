import { renderHook, act } from '@testing-library/react';
import { WordsProvider, useWords, Word } from '../context/WordsContext';

describe('WordsContext', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WordsProvider>{children}</WordsProvider>
    );

    beforeEach(() => {
        localStorage.clear();
    });

    it('provides default values', () => {
        const { result } = renderHook(() => useWords(), { wrapper });

        expect(result.current.words).toEqual([]);
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.userProfile.name).toBe('Explorer');
    });

    it('can login and logout', () => {
        const { result } = renderHook(() => useWords(), { wrapper });

        act(() => {
            result.current.login();
        });

        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.userProfile.email).toBe('explorer@example.com');

        act(() => {
            result.current.logout();
        });

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.userProfile.email).toBe('');
    });

    it('can add and delete words', () => {
        const { result } = renderHook(() => useWords(), { wrapper });

        const newWord: Word = {
            id: '1',
            word: 'Test',
            definition: 'A test word',
            sentence: 'This is a test.',
            imageUrl: 'http://example.com/img.jpg',
            timestamp: Date.now(),
            gradeLevel: 1,
            difficulty: 'EASY'
        };

        act(() => {
            result.current.addWord(newWord);
        });

        expect(result.current.words).toHaveLength(1);
        expect(result.current.words[0]).toEqual(newWord);

        act(() => {
            result.current.deleteWord('1');
        });

        expect(result.current.words).toHaveLength(0);
    });

    it('handles duplicate words by moving to top (overwriting)', () => {
        const { result } = renderHook(() => useWords(), { wrapper });

        const word1: Word = {
            id: '1',
            word: 'Apple',
            definition: 'Fruit',
            sentence: 'Eat apple',
            imageUrl: '',
            timestamp: 1000,
            gradeLevel: 1,
            difficulty: 'EASY'
        };

        const word2: Word = {
            id: '2',
            word: 'Apple', // Same word
            definition: 'Red Fruit',
            sentence: 'Red apple',
            imageUrl: '',
            timestamp: 2000,
            gradeLevel: 1,
            difficulty: 'EASY'
        };

        act(() => {
            result.current.addWord(word1);
        });

        expect(result.current.words).toHaveLength(1);
        expect(result.current.words[0].id).toBe('1');

        act(() => {
            result.current.addWord(word2);
        });

        expect(result.current.words).toHaveLength(1); // Should still be 1
        expect(result.current.words[0].id).toBe('2'); // Should be the new one
        expect(result.current.words[0].definition).toBe('Red Fruit');
    });
    it('adds new profile with onboarded status to prevent survey loop', () => {
        const { result } = renderHook(() => useWords(), { wrapper });

        act(() => {
            result.current.addProfile('New Kid');
        });

        const newProfile = result.current.profiles.find(p => p.name === 'New Kid');
        expect(newProfile).toBeDefined();
        // This validates the fix: new profiles should treat onboarding as done
        // if they are created under an existing account context (simplified for now as always true for added kids)
        expect(newProfile?.hasCompletedOnboarding).toBe(true);
    });


    it('updates word mastery on review', () => {
        const { result } = renderHook(() => useWords(), { wrapper });

        const word: Word = {
            id: '1',
            word: 'Test',
            definition: 'Def',
            sentence: 'Sen',
            imageUrl: '',
            timestamp: Date.now(),
            gradeLevel: 1,
            difficulty: 'EASY',
            mastery: 0
        };

        act(() => {
            result.current.addWord(word);
        });

        act(() => {
            result.current.markWordReviewed('1', 'EASY');
        });

        expect(result.current.words[0].mastery).toBe(20);
        expect(result.current.words[0].lastReviewed).toBeDefined();

        act(() => {
            result.current.markWordReviewed('1', 'HARD');
        });

        expect(result.current.words[0].mastery).toBe(0); // Should decrease/reset
    });

});
