'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useWords } from '@/context/WordsContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useWords();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Allow login page access without auth
        if (pathname === '/login') return;

        // Redirect if not authenticated
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, pathname, router, mounted]);

    // Don't render anything until client-side hydration is complete
    if (!mounted) return null;

    // If on login page, just render
    if (pathname === '/login') {
        return <>{children}</>;
    }

    // If authenticated, render protected content
    if (isAuthenticated) {
        return <>{children}</>;
    }

    // Otherwise render nothing while redirecting
    return null;
}
