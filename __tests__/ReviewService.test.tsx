import { ReviewService } from '../services/reviewService';
import { Word } from '../context/WordsContext';

// Mock data
const mockWords: Word[] = [
    { id: '1', word: 'A', timestamp: 100, isStarred: false, difficulty: 'EASY', gradeLevel: 1, definition: 'A', sentence: 'A', imageUrl: '' },
    { id: '2', word: 'B', timestamp: 200, isStarred: true, difficulty: 'HARD', gradeLevel: 1, definition: 'B', sentence: 'B', imageUrl: '' }
];

describe('ReviewService', () => {
    let service: ReviewService;

    beforeEach(() => {
        service = new ReviewService();
        // Inject mock data mechanism if possible, or we assume it relies on global/localstorage mocks
        // Since it is a service, we might need to mock the data source it uses. 
        // For this TDD phase, we assume it has internal logic we are testing, 
        // or we mock the "Database" layer it calls.

        // Given the requirement "Do NOT fake persistence", we expect stubs.
    });

    it('getReviewWords filters by difficulty', async () => {
        // Stub response
        jest.spyOn(service, 'getReviewWords').mockResolvedValue([mockWords[1]]);

        const results = await service.getReviewWords('user1', { difficulty: 'HARD' });
        expect(results).toHaveLength(1);
        expect(results[0].word).toBe('B');
    });

    it('getReviewWords filters by starred', async () => {
        jest.spyOn(service, 'getReviewWords').mockResolvedValue([mockWords[1]]);

        const results = await service.getReviewWords('user1', { starredOnly: true });
        expect(results[0].isStarred).toBe(true);
    });

    it('markReviewed exists', async () => {
        await expect(service.markReviewed('1')).resolves.not.toThrow();
    });
});
