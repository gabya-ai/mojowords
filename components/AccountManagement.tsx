'use client';

import { useState } from 'react';
import { useWords } from '@/context/WordsContext';

export default function AccountManagement() {
    const { userProfile } = useWords();
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(false);

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#F1F3C4]/50 animate-fade-in">
            <h2 className="text-2xl font-extrabold text-[#4A6D51] mb-6">Account Settings</h2>

            <div className="space-y-6">

                {/* User Info Read-only */}
                <div className="p-4 bg-[#FDFBF7] rounded-xl border border-[#F1F3C4]/30">
                    <label className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider block mb-1">Parent Account</label>
                    <div className="font-bold text-[#4A6D51]">{userProfile.email || 'guest@mojo.local'}</div>
                </div>

                {/* Child Profiles (Mockup) */}
                <div>
                    <div className="flex items-center justify-between border-b border-[#F1F3C4] pb-2 mb-4">
                        <h3 className="font-bold text-[#4A6D51]">Child Profiles</h3>
                        <button className="text-xs font-bold text-[#F4B9B2] hover:text-[#E09090]">+ Add Kid</button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-[#E8F5E9] rounded-xl border border-[#A2D8A2]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">🤠</div>
                                <span className="font-bold text-[#4A6D51]">{userProfile.name}</span>
                            </div>
                            <span className="text-xs font-bold text-[#4A6D51] bg-white/50 px-2 py-1 rounded-md">Active</span>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                    <h3 className="font-bold text-[#4A6D51] border-b border-[#F1F3C4] pb-2">Preferences</h3>

                    <div className="flex items-center justify-between">
                        <span className="font-bold text-[#6A8D71]">Sound Effects</span>
                        <button
                            role="switch"
                            aria-checked={soundEnabled}
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${soundEnabled ? 'bg-[#A2D8A2]' : 'bg-gray-200'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-sm border-2 border-white absolute top-0 transition-transform duration-300 ${soundEnabled ? 'right-0' : 'left-0'}`}></div>
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="font-bold text-[#6A8D71]">Email Notifications</span>
                        <button
                            role="switch"
                            aria-checked={emailNotifications}
                            onClick={() => setEmailNotifications(!emailNotifications)}
                            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${emailNotifications ? 'bg-[#A2D8A2]' : 'bg-gray-200'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-sm border-2 border-white absolute top-0 transition-transform duration-300 ${emailNotifications ? 'right-0' : 'left-0'}`}></div>
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-6 mt-6 border-t border-[#F1F3C4]">
                    <h3 className="font-bold text-[#F4B9B2] mb-4">Danger Zone</h3>
                    <button className="text-red-400 font-bold text-sm hover:text-red-500 hover:underline">
                        Delete Account
                    </button>
                </div>

            </div>
        </div>
    );
}
