'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useWords } from '@/context/WordsContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, userProfile } = useWords();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Use timeout to push to next tick, avoiding sync setState warning
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        if (!isAuthenticated && pathname !== '/login') {
            router.push('/login');
        } else if (isAuthenticated && !userProfile.hasCompletedOnboarding && pathname !== '/onboarding') {
            router.push('/onboarding');
        }
    }, [isAuthenticated, userProfile.hasCompletedOnboarding, pathname, router, mounted]);

    // Don't render anything until client-side hydration is complete
    if (!mounted) return null;

    // If not authenticated and not on login page, render nothing (redirecting)
    if (!isAuthenticated && pathname !== '/login') {
        return null;
    }

    // If authenticated but onboarding incomplete and not on onboarding page, render nothing (redirecting)
    if (isAuthenticated && !userProfile.hasCompletedOnboarding && pathname !== '/onboarding') {
        return null;
    }

    return <>{children}</>;
}
