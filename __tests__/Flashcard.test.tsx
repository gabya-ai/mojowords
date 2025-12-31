import { render, screen, fireEvent } from '@testing-library/react';
import Flashcard from '../components/Flashcard';
import { Word } from '../context/WordsContext';
import '@testing-library/jest-dom';

const mockWord: Word = {
    id: '1',
    word: 'Elephant',
    definition: 'A large animal',
    sentence: 'The elephant has a trunk',
    imageUrl: 'http://example.com/ele.jpg',
    timestamp: Date.now(),
    gradeLevel: 1,
    difficulty: 'EASY',
    mastery: 0,
    views: 0 // New property
};

describe('Flashcard Component', () => {
    it('hides image by default and shows "Show Picture" button', () => {
        render(<Flashcard word={mockWord} onFlip={() => { }} onResult={() => { }} />);

        // Image should NOT be in the document initially 
        // (Note: we check for the alt text or the img role)
        const img = screen.queryByAltText('Elephant');
        expect(img).not.toBeInTheDocument();

        // Button should be present
        expect(screen.getByRole('button', { name: /Show Picture/i })).toBeInTheDocument();
    });

    it('reveals image when "Show Picture" is clicked', () => {
        render(<Flashcard word={mockWord} onFlip={() => { }} onResult={() => { }} />);

        const button = screen.getByRole('button', { name: /Show Picture/i });
        fireEvent.click(button);

        // Image should now be visible
        const img = screen.getByAltText('Elephant');
        expect(img).toBeInTheDocument();

        // Button should be gone (optional, but good UX)
        expect(button).not.toBeInTheDocument();
    });
});
