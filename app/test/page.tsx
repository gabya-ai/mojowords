'use client';

import { useRouter } from 'next/navigation';

export default function TestLandingPage() {
    const router = useRouter();

    const handleSelectMode = (mode: string) => {
        router.push(`/test/config?mode=${mode}`);
    };

    return (
        <div className="space-y-8">
            <header className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Mode</h1>
                <p className="text-gray-600">Choose a challenge to test your mastery!</p>
            </header>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Card 1: Fill-in-the-Blank */}
                <button
                    onClick={() => handleSelectMode('fill-in-blank')}
                    className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-500 transition-all text-left group"
                >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200">
                        <span className="text-2xl">📝</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Fill-in-the-Blank</h3>
                    <p className="text-gray-500 text-sm">Recall the exact word to complete the sentence. Great for spelling and context.</p>
                </button>

                {/* Card 2: Multiple Choice */}
                <button
                    onClick={() => handleSelectMode('multiple-choice')}
                    className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-500 transition-all text-left group"
                >
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200">
                        <span className="text-2xl">🤔</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Multiple Choice</h3>
                    <p className="text-gray-500 text-sm">Choose the correct definition or word. Good for quick reviews.</p>
                </button>

                {/* Card 3: Story Learning */}
                <button
                    onClick={() => handleSelectMode('story-learning')}
                    className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-green-500 transition-all text-left group"
                >
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200">
                        <span className="text-2xl">📖</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Story Mode</h3>
                    <p className="text-gray-500 text-sm">Read a short story and find the hidden vocabulary words.</p>
                </button>
            </div>
        </div>
    );
}
