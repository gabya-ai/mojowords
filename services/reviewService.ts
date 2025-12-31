import { Word } from '@/context/WordsContext';

export interface ReviewFilters {
    difficulty?: 'EASY' | 'MEDIUM' | 'CHALLENGE';
    recency?: 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'ALL_TIME';
    starredOnly?: boolean;
    manualSelection?: string[]; // IDs
    order?: 'RANDOM' | 'RECENCY' | 'DIFFICULTY';
}

export class ReviewService {
    // TODO: Replace with backend implementation when available
    // Currently stubs behavior as requested

    async getReviewWords(userId: string, filters: ReviewFilters): Promise<Word[]> {
        console.log(`[ReviewService] Fetching words for user ${userId} with filters:`, filters);

        // STUB: Returning empty array or mock logic could be placed here.
        // In a real app, this would fetch from DB based on filters.
        // For now, we return a promise that resolves to [] to satisfy the interface,
        // or we encounters a situation where the UI might need real data.
        // The prompt says: "Return predictable, testable placeholders only if required".
        return Promise.resolve([]);
    }

    async markReviewed(wordId: string): Promise<void> {
        console.log(`[ReviewService] Marking word ${wordId} as reviewed`);
        return Promise.resolve();
    }

    async toggleStar(wordId: string): Promise<Word> {
        console.log(`[ReviewService] Toggling star for ${wordId}`);
        // Return a mock word to satisfy signature
        return Promise.resolve({
            id: wordId,
            word: 'Stub',
            definition: '',
            sentence: '',
            imageUrl: '',
            gradeLevel: 1,
            difficulty: 'EASY',
            timestamp: Date.now(),
            isStarred: true
        });
    }

    async getStarredWords(userId: string): Promise<Word[]> {
        console.log(`[ReviewService] Fetching starred words for ${userId}`);
        return Promise.resolve([]);
    }
}
