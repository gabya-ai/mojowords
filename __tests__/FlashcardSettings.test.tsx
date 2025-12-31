import { render, screen, fireEvent } from '@testing-library/react';
import FlashcardSettings from '../components/FlashcardSettings';

describe('FlashcardSettings', () => {
    it('renders all filter options', () => {
        render(<FlashcardSettings onStart={() => { }} />);

        expect(screen.getByText(/Difficulty/i)).toBeInTheDocument();
        expect(screen.getByText(/Recency/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Starred Only/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Start Review/i })).toBeInTheDocument();
    });

    it('calls onStart when Start button is clicked', () => {
        const onStartMock = jest.fn();
        render(<FlashcardSettings onStart={onStartMock} />);

        fireEvent.click(screen.getByRole('button', { name: /Start Review/i }));
        expect(onStartMock).toHaveBeenCalledTimes(1);
    });
});
