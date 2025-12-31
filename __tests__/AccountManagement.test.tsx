import { render, screen, fireEvent } from '@testing-library/react';
import AccountManagement from '../components/AccountManagement';
import { WordsContext } from '../context/WordsContext';

// Mock Provider
const mockUpdateUserProfile = jest.fn();
const MockProvider = ({ children }: { children: React.ReactNode }) => (
    // @ts-expect-error - Mocking useWords partial return
    <WordsContext.Provider value={{
        userProfile: { name: 'Parent', streak: 0, lastVisit: null },
        updateUserProfile: mockUpdateUserProfile
    }}>
        {children}
    </WordsContext.Provider>
);

describe('AccountManagement', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders account settings', () => {
        render(
            <MockProvider>
                <AccountManagement />
            </MockProvider>
        );
        expect(screen.getByText(/Account Settings/i)).toBeInTheDocument();
        expect(screen.getByText(/Sound Effects/i)).toBeInTheDocument();
    });

    it('toggles sound settings', () => {
        render(
            <MockProvider>
                <AccountManagement />
            </MockProvider>
        );

        const toggles = screen.getAllByRole('switch');
        const soundToggle = toggles[0]; // First one is Sound Effects

        fireEvent.click(soundToggle);
        // Expect some state change (mocked)
    });
});
