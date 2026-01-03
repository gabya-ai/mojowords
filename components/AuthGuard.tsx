'use client';

import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from 'next/navigation';
import { useWords } from '@/context/WordsContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, userProfile, login } = useWords();
    const { status } = useSession(); // Direct access to auth status
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (status === 'loading') return; // Wait for loading to finish

        // 1. Unauthenticated -> Redirect to Login
        if (status === 'unauthenticated' && pathname !== '/login') {
            router.push('/login');
        }

        // 2. Authenticated but Incomplete Onboarding -> Redirect to Onboarding
        // We use userProfile.hasCompletedOnboarding check, BUT we need to ensure WordsContext is also ready?
        // Actually, WordsContext syncs with session. 
        // If status is authenticated, WordsContext might still be syncing in its own effect.
        // But the critical piece is avoiding the loop.

        // Let's rely on WordsContext's `isAuthenticated` for the onboarding check 
        // because that implies the profile is loaded? 
        // Or better: relying on `status === 'authenticated'` is safer for the "logged in" check.

        // Re-implementing the logic:
        else if (status === 'authenticated') {
            // We need to wait for userProfile/parentSettings to be populated?
            // WordsContext does this: `if (session?.user) { setTimeout(...) }`. 
            // Logic in page.tsx handles the specific onboarding redirect now.
            // AuthGuard's job is primarily to protect private routes.

            // If we rely on page.tsx for onboarding redirect, we might verify we just protect access here.
        }

    }, [status, pathname, router, mounted]);

    // Render loading state while checking session
    if (!mounted || status === 'loading') {
        return (
            <div className="flex h-screen items-center justify-center bg-[#FDFBF7]">
                <div className="text-center">
                    <div className="text-4xl animate-bounce mb-4">🌱</div>
                    <p className="text-[#4A6D51] font-bold">Growing your garden...</p>
                </div>
            </div>
        );
    }

    // If unauthenticated and trying to safeguard, return null (redirect happens in effect)
    if (status === 'unauthenticated' && pathname !== '/login') {
        return null; // Don't render protected content
    }

    // If authenticated, render children. 
    // Onboarding redirect is handled by page.tsx or we can keep it here if we want global enforcement.
    // The previous implementation had it here:
    // `else if (isAuthenticated && !userProfile.hasCompletedOnboarding && pathname !== '/onboarding')`
    // Since we moved that logic to page.tsx (dependent on parentSettings), we can relax it here 
    // OR update it to check parentSettings if we pull it.

    // For now, let's just protect against unauthenticated access to non-login pages.

    return <>{children}</>;
}
