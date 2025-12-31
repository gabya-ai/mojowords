import { render, screen, waitFor } from '@testing-library/react';
import AuthGuard from '../components/AuthGuard';
import { WordsContext } from '../context/WordsContext';

// Mock useRouter and usePathname
const mockPush = jest.fn();
const mockPathname = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
    usePathname: () => mockPathname()
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
    });

    it('renders children if authenticated', () => {
        mockPathname.mockReturnValue('/');

        render(
            <MockProvider isAuthenticated={true}>
                <AuthGuard>
                    <div data-testid="protected-content">Protected</div>
                </AuthGuard>
            </MockProvider>
        );

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('redirects to /login if not authenticated', async () => {
        mockPathname.mockReturnValue('/');

        render(
            <MockProvider isAuthenticated={false}>
                <AuthGuard>
                    <div>Protected</div>
                </AuthGuard>
            </MockProvider>
        );

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/login');
        });
    });

    it('allows access to /login page even if not authenticated', () => {
        // pathname is /login
        mockPathname.mockReturnValue('/login');

        render(
            <MockProvider isAuthenticated={false}>
                <AuthGuard>
                    <div data-testid="login-content">Login Page</div>
                </AuthGuard>
            </MockProvider>
        );

        expect(screen.getByTestId('login-content')).toBeInTheDocument();
        expect(mockPush).not.toHaveBeenCalled();
    });
});
