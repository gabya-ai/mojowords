import { render, screen } from '@testing-library/react';
import Home from '../app/page';
import { WordsProvider } from '../context/WordsContext';
import '@testing-library/jest-dom';

// Mock child components to isolate Home page logic
jest.mock('../components/WordInput', () => {
    return function MockWordInput() {
        return <div data-testid="word-input">Word Input</div>;
    };
});

jest.mock('../components/WordCard', () => {
    return function MockWordCard() {
        return <div>Word Card</div>;
    };
});

// Mock Next.js Link
jest.mock('next/link', () => {
    return ({ children }: { children: React.ReactNode }) => {
        return <a>{children}</a>;
    }
});

describe('Homepage UI', () => {
    it('renders WordInput exactly once', () => {
        render(
            <WordsProvider>
                <Home />
            </WordsProvider>
        );

        const inputs = screen.getAllByTestId('word-input');
        expect(inputs).toHaveLength(1);
    });
});
