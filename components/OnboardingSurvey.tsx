'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWords } from '@/context/WordsContext';

export default function OnboardingSurvey() {
    const { updateUserProfile } = useWords();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<{
        name: string;
        age: number;
        grade: number;
        state: string;
    }>({
        name: '',
        age: 7,
        grade: 2,
        state: ''
    });

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = () => {
        updateUserProfile({
            name: formData.name,
            age: formData.age,
            grade: formData.grade,
            state: formData.state,
            hasCompletedOnboarding: true
        });
        router.push('/');
    };

    return (
        <div className="max-w-md w-full mx-auto bg-white p-8 rounded-3xl shadow-xl border border-[#F1F3C4] animate-fade-in relative">

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-[#F1F3C4] rounded-t-3xl overflow-hidden">
                <div
                    className="h-full bg-[#4A6D51] transition-all duration-500 ease-out"
                    style={{ width: `${(step / 4) * 100}%` }}
                ></div>
            </div>

            <div className="mt-4 space-y-6">

                {step === 1 && (
                    <div className="space-y-4 text-center animate-slide-in">
                        <span className="text-4xl">👋</span>
                        <h2 className="text-2xl font-extrabold text-[#4A6D51]">What should we call you?</h2>
                        <input
                            type="text"
                            placeholder="Who will be learning?"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full text-center text-xl p-3 border-b-2 border-[#F1F3C4] focus:border-[#4A6D51] outline-none bg-transparent placeholder:text-gray-300"
                            autoFocus
                        />
                        <button
                            onClick={handleNext}
                            disabled={!formData.name.trim()}
                            className="w-full bg-[#4A6D51] text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:bg-[#3A5D41] transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 text-center animate-slide-in">
                        <span className="text-4xl">🎂</span>
                        <h2 className="text-2xl font-extrabold text-[#4A6D51]">How old are you?</h2>
                        <div className="flex justify-center items-center gap-4">
                            <button
                                onClick={() => setFormData(prev => ({ ...prev, age: Math.max(5, prev.age - 1) }))}
                                className="w-12 h-12 rounded-full border-2 border-[#F1F3C4] text-[#4A6D51] font-black text-2xl hover:bg-[#FDFBF7]"
                            >-</button>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                                className="w-20 text-center text-4xl font-black text-[#4A6D51] bg-transparent outline-none"
                            />
                            <button
                                onClick={() => setFormData(prev => ({ ...prev, age: Math.min(12, prev.age + 1) }))}
                                className="w-12 h-12 rounded-full border-2 border-[#F1F3C4] text-[#4A6D51] font-black text-2xl hover:bg-[#FDFBF7]"
                            >+</button>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleBack} className="flex-1 py-3 font-bold text-[#8A8A8A]">Back</button>
                            <button onClick={handleNext} className="flex-1 bg-[#4A6D51] text-white font-bold py-3 rounded-xl hover:bg-[#3A5D41]">Next</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4 text-center animate-slide-in">
                        <span className="text-4xl">📚</span>
                        <h2 className="text-2xl font-extrabold text-[#4A6D51]">What grade are you in?</h2>
                        <div className="grid grid-cols-3 gap-2">
                            {[0, 1, 2, 3, 4, 5].map(g => (
                                <button
                                    key={g}
                                    onClick={() => {
                                        setFormData({ ...formData, grade: g });
                                        handleNext(); // Auto-advance for better UX
                                    }}
                                    className={`p-4 rounded-xl font-bold border-2 transition-all ${formData.grade === g
                                        ? 'bg-[#4A6D51] text-white border-[#4A6D51]'
                                        : 'bg-[#FDFBF7] text-[#4A6D51] border-transparent hover:border-[#F1F3C4]'
                                        }`}
                                >
                                    {g === 0 ? 'K' : `${g}${g === 1 ? 'st' : g === 2 ? 'nd' : g === 3 ? 'rd' : 'th'}`}
                                </button>
                            ))}
                        </div>
                        <button onClick={handleBack} className="w-full py-2 font-bold text-[#8A8A8A]">Back</button>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-4 text-center animate-slide-in">
                        <span className="text-4xl">🌎</span>
                        <h2 className="text-2xl font-extrabold text-[#4A6D51]">Where do you live?</h2>
                        <p className="text-xs text-[#8A8A8A]">This helps us find what you're learning at school!</p>

                        <select
                            value={formData.state}
                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                            className="w-full p-3 rounded-xl border-2 border-[#F1F3C4] bg-white text-[#4A6D51] font-bold outline-none focus:border-[#4A6D51]"
                        >
                            <option value="">Select a State</option>
                            {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>

                        <div className="flex gap-2 mt-4">
                            <button onClick={handleBack} className="flex-1 py-3 font-bold text-[#8A8A8A]">Back</button>
                            <button
                                onClick={handleSubmit}
                                disabled={!formData.state}
                                className="flex-1 bg-[#4A6D51] text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:bg-[#3A5D41]"
                            >
                                Finish
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
