'use client';

import { useRouter } from 'next/navigation';
import { useWords } from '@/context/WordsContext';

export default function MagicLoginPage() {
    const { login } = useWords();
    const router = useRouter();

    const handleMagicLogin = () => {
        login();
        localStorage.removeItem('vocal-tool-profile');
        router.push('/onboarding');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] p-4">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-[#F1F3C4] text-center">
                <div className="inline-block p-4 rounded-full bg-[#E8F5E9] mb-2 shadow-inner border-2 border-white">
                    <span className="text-4xl">🎩</span>
                </div>
                <h1 className="text-3xl font-extrabold text-[#4A6D51] tracking-tight">
                    Magic Mode
                </h1>
                <p className="text-[#8A8A8A] font-medium">
                    This area is for developers only.
                </p>

                <button
                    onClick={handleMagicLogin}
                    className="w-full flex items-center justify-center gap-2 bg-[#4A6D51] text-white font-bold py-4 px-4 rounded-xl hover:bg-[#3d5a43] transition-colors shadow-lg shadow-[#4A6D51]/20"
                >
                    <span>Enter Magic Mode</span>
                </button>
            </div>
        </div>
    );
}
