import { render, screen, waitFor } from '@testing-library/react';
import AuthGuard from '../components/AuthGuard';
import { WordsContext, useWords } from '../context/WordsContext';

// Mock useRouter and usePathname
const mockPush = jest.fn();
const mockPathname = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),


    usePathname: () => mockPathname()
}));

// Mock useWords hook
jest.mock('../context/WordsContext', () => ({
    ...jest.requireActual('../context/WordsContext'),
    useWords: jest.fn(),
    WordsContext: jest.requireActual('../context/WordsContext').WordsContext // check this
}));

// Mock Context Provider for testing
const MockProvider = ({ children, isAuthenticated }: { children: React.ReactNode, isAuthenticated: boolean }) => (
    // @ts-ignore - Partial mock of context for testing
    <WordsContext.Provider value={{ isAuthenticated, userProfile: { name: 'Test' } }}>
        {children}
    </WordsContext.Provider>
);

describe('AuthGuard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset useWords mock for each test
        (useWords as jest.Mock).mockReturnValue({
            isAuthenticated: true,
            userProfile: { hasCompletedOnboarding: true } // Default to authenticated and onboarded
        });
    });

    it('renders children if authenticated', async () => {
        mockPathname.mockReturnValue('/');
        (useWords as jest.Mock).mockReturnValue({
            isAuthenticated: true,
            userProfile: { hasCompletedOnboarding: true }
        });

        render(
            <AuthGuard>
                <div data-testid="protected-content">Protected</div>
            </AuthGuard>
        );

        expect(await screen.findByTestId('protected-content')).toBeInTheDocument();
    });

    it('redirects to /login if not authenticated', async () => {
        mockPathname.mockReturnValue('/');
        (useWords as jest.Mock).mockReturnValue({
            isAuthenticated: false,
            userProfile: { hasCompletedOnboarding: true }
        });

        render(
            <AuthGuard>
                <div>Protected</div>
            </AuthGuard>
        );

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/login');
        });
    });

    it('allows access to /login page even if not authenticated', async () => {
        // pathname is /login
        mockPathname.mockReturnValue('/login');
        (useWords as jest.Mock).mockReturnValue({
            isAuthenticated: false,
            userProfile: { hasCompletedOnboarding: true }
        });

        render(
            <AuthGuard>
                <div data-testid="login-content">Login Page</div>
            </AuthGuard>
        );

        expect(await screen.findByTestId('login-content')).toBeInTheDocument();
        expect(mockPush).not.toHaveBeenCalled();
    });
});
