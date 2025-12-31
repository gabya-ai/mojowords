import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OnboardingSurvey from '../components/OnboardingSurvey';
import { WordsContext, useWords } from '../context/WordsContext';

// Mock useRouter
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

// Mock useWords hook
jest.mock('../context/WordsContext', () => ({
    ...jest.requireActual('../context/WordsContext'), // Keep actual exports if any
    useWords: jest.fn(),
}));

// Mock Data
const mockUpdateUserProfile = jest.fn();

const MockProvider = ({ children }: { children: React.ReactNode }) => {
    // @ts-expect-error - Mocking useWords partial return
    (useWords as jest.Mock).mockReturnValue({
        userProfile: { name: 'Explorer', streak: 0, lastVisit: null },
        updateUserProfile: mockUpdateUserProfile,
        isAuthenticated: true // Ensure auth is satisfied if needed
    });
    return <>{children}</>;
};

describe('OnboardingSurvey', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the first step (Child Name)', () => {
        render(
            <MockProvider>
                <OnboardingSurvey />
            </MockProvider>
        );
        expect(screen.getByText(/What should we call you?/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Who will be learning?/i)).toBeInTheDocument();
    });

    it('navigates through steps and submits', () => {
        render(
            <MockProvider>
                <OnboardingSurvey />
            </MockProvider>
        );

        // Step 1: Name
        fireEvent.change(screen.getByPlaceholderText(/Who will be learning?/i), { target: { value: 'Test Kid' } });
        fireEvent.click(screen.getByText(/Next/i));

        // Step 2: Age
        expect(screen.getByText(/How old are you?/i)).toBeInTheDocument();
        fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '8' } });
        fireEvent.click(screen.getByText(/Next/i));

        // Step 3: Grade
        expect(screen.getByText(/What grade are you in?/i)).toBeInTheDocument();
        fireEvent.click(screen.getByText('3rd')); // Assuming buttons for grades

        // Step 4: State
        expect(screen.getByText(/Where do you live?/i)).toBeInTheDocument();
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'CA' } });
        fireEvent.click(screen.getByRole('button', { name: /^Finish$/i }));

        // Verification
        expect(mockUpdateUserProfile).toHaveBeenCalledWith({
            name: 'Test Kid',
            age: 8,
            grade: 3,
            state: 'CA',
            hasCompletedOnboarding: true
        });
        expect(mockPush).toHaveBeenCalledWith('/');
    });
});

