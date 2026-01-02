'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWords } from '@/context/WordsContext';

export default function LoginPage() {
    const { login } = useWords();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await signIn('google', { callbackUrl: '/' });
        } catch (error) {
            console.error("Login failed", error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] p-4">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-[#F1F3C4]">

                {/* Brand Header */}
                <div className="text-center space-y-2">
                    <div className="inline-block p-4 rounded-full bg-[#E8F5E9] mb-2 shadow-inner border-2 border-white">
                        <span className="text-4xl">🌱</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#4A6D51] tracking-tight">
                        MojoWords
                    </h1>
                    <p className="text-[#8A8A8A] font-medium">Grow your vocabulary, one seed at a time.</p>
                </div>

                {/* Login Options */}
                <div className="mt-8 space-y-4">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-bold py-4 px-4 rounded-xl border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-[#4A6D51] border-t-transparent rounded-full animate-spin"></div>
                                <span>Signing in...</span>
                            </div>
                        ) : (
                            <>
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                <span>Sign in with Google</span>
                            </>
                        )}

                        {/* Hover shine effect */}
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[#FDFBF7] text-gray-400">or</span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            // Dev Mode: Login as new user to see survey
                            login();
                            localStorage.removeItem('vocal-tool-profile'); // Clear profile to force new user state
                            router.push('/onboarding');
                        }}
                        className="w-full text-[#4A6D51] font-bold text-sm hover:underline opacity-50 hover:opacity-100"
                    >
                        Developer Mode (Test Survey)
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 mt-8">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                    <br /> Parents, managing multiple child accounts? <a href="#" className="text-[#4A6D51] underline">Click here</a>.
                </p>
            </div>
        </div>
    );
}
