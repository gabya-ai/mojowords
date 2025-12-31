import { render, screen } from '@testing-library/react';
import Home from '../app/page';
import { WordsProvider } from '../context/WordsContext';
import '@testing-library/jest-dom';

// Mock child components
jest.mock('../components/WordInput', () => function MockInput() { return <div />; });
jest.mock('../components/WordCard', () => function MockCard() { return <div />; });
jest.mock('next/link', () => ({ children }: any) => <a>{children}</a>);

describe('Home Empty State', () => {
    it('renders "Your garden is waiting" exactly once when no words exist', () => {
        render(
            <WordsProvider>
                <Home />
            </WordsProvider>
        );

        const emptyStates = screen.getAllByText(/Your garden is waiting/i);
        expect(emptyStates).toHaveLength(1);
    });
});
