'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWords } from '@/context/WordsContext';

export default function ProfilePage() {
    const { userProfile, updateUserName, updateUserProfile, logout, profiles, addProfile, switchProfile, deleteProfile } = useWords();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(userProfile.name);
    // Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newKidName, setNewKidName] = useState('');
    // Remove Kid Modal State
    const [deleteProfileId, setDeleteProfileId] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim()) {
            updateUserName(newName.trim());
            setIsEditing(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-extrabold text-[#4A6D51]">
                    My Gardener Profile 👩‍🌾
                </h1>
                <p className="text-[#8A8A8A]">Manage your settings and track your growth</p>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#F1F3C4]/50 space-y-8">

                {/* Profile Info */}
                <div className="flex items-center gap-6 pb-8 border-b border-[#F1F3C4]/50">
                    <div className="w-24 h-24 bg-[#E8F5E9] rounded-full flex items-center justify-center text-4xl border-4 border-white shadow-inner">
                        🤠
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">Name</label>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-xs font-bold text-[#F4B9B2] hover:text-[#E09090] transition-colors"
                                >
                                    Edit
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-4 bg-[#FDFBF7] p-4 rounded-xl border border-[#F1F3C4]">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-xs font-bold text-[#8A8A8A] uppercase mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full text-lg font-bold text-[#4A6D51] border-b-2 border-[#F1F3C4] focus:border-[#4A6D51] outline-none bg-transparent py-1"
                                        autoFocus
                                    />
                                </div>

                                {/* Conditional Fields */}
                                {userProfile.email ? (
                                    /* Parent Fields */
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-[#8A8A8A] uppercase mb-1">Email (Read-only)</label>
                                            <input
                                                type="email"
                                                value={userProfile.email}
                                                disabled
                                                className="w-full text-base text-gray-500 bg-transparent border-b border-gray-200 py-1 cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-[#8A8A8A] uppercase mb-1">US State</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. California"
                                                value={userProfile.state || ''}
                                                onChange={(e) => updateUserProfile({ state: e.target.value })}
                                                className="w-full text-base font-medium text-[#4A6D51] border-b-2 border-[#F1F3C4] focus:border-[#4A6D51] outline-none bg-transparent py-1"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    /* Child Fields */
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-[#8A8A8A] uppercase mb-1">Age</label>
                                            <input
                                                type="number"
                                                value={userProfile.age || ''}
                                                onChange={(e) => updateUserProfile({ age: parseInt(e.target.value) || 0 })}
                                                className="w-full text-base font-medium text-[#4A6D51] border-b-2 border-[#F1F3C4] focus:border-[#4A6D51] outline-none bg-transparent py-1"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-[#8A8A8A] uppercase mb-1">Grade</label>
                                            <input
                                                type="number"
                                                value={userProfile.grade || ''}
                                                onChange={(e) => updateUserProfile({ grade: parseInt(e.target.value) || 0 })}
                                                className="w-full text-base font-medium text-[#4A6D51] border-b-2 border-[#F1F3C4] focus:border-[#4A6D51] outline-none bg-transparent py-1"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-[#4A6D51] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#3A5D41] transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 font-bold text-[#8A8A8A] hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <h2 className="text-3xl font-extrabold text-[#4A6D51]">{userProfile.name}</h2>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#FDFBF7] p-6 rounded-2xl border border-[#F1F3C4]/30 text-center">
                        <div className="text-3xl mb-2">🔥</div>
                        <div className="text-2xl font-black text-[#4A6D51]">{userProfile.streak}</div>
                        <div className="text-xs font-bold text-[#8A8A8A] uppercase">Day Streak</div>
                    </div>
                    <div className="bg-[#FDFBF7] p-6 rounded-2xl border border-[#F1F3C4]/30 text-center">
                        <div className="text-3xl mb-2">🗓️</div>
                        <div className="text-sm font-bold text-[#4A6D51] mt-2">{userProfile.lastVisit || 'Today'}</div>
                        <div className="text-xs font-bold text-[#8A8A8A] uppercase mt-1">Last Visit</div>
                    </div>
                </div>

                {/* Children Profiles */}
                <div className="space-y-4 pt-4 border-t border-[#F1F3C4]/50">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-[#4A6D51]">My Gardeners</h3>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-[#F4B9B2] text-white px-3 py-1 rounded-full text-sm font-bold hover:bg-[#E09090] transition-colors"
                        >
                            + Add Kid
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {profiles.map(profile => (
                            <div
                                key={profile.id}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${userProfile.id === profile.id
                                    ? 'bg-[#E8F5E9] border-[#4A6D51] shadow-sm'
                                    : 'bg-white border-[#F1F3C4] hover:border-[#4A6D51]/50'
                                    }`}
                            >
                                <div
                                    className="flex items-center gap-4 flex-1 cursor-pointer"
                                    onClick={() => switchProfile(profile.id)}
                                >
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                                        {profile.name === 'Parent' ? '👩‍🌾' : '🤠'}
                                    </div>
                                    <div>
                                        <div className="font-bold text-[#4A6D51]">{profile.name}</div>
                                        {profile.hasCompletedOnboarding && <div className="text-xs text-[#8A8A8A]">Lvl {profile.grade || 1} • {profile.streak} Day Streak</div>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteProfileId(profile.id);
                                        }}
                                        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                        title="Remove Profile"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add Kid Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6">
                            <div className="text-center space-y-2">
                                <span className="text-4xl">👋</span>
                                <h3 className="text-2xl font-extrabold text-[#4A6D51]">What&apos;s the new gardener&apos;s name?</h3>
                            </div>

                            <input
                                type="text"
                                value={newKidName}
                                onChange={(e) => setNewKidName(e.target.value)}
                                placeholder="Enter name..."
                                className="w-full text-center text-xl p-3 border-b-2 border-[#F1F3C4] focus:border-[#4A6D51] outline-none bg-transparent placeholder:text-gray-300"
                                autoFocus
                            />

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setNewKidName('');
                                    }}
                                    className="flex-1 py-3 font-bold text-[#8A8A8A] hover:bg-[#FDFBF7] rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (newKidName.trim()) {
                                            const success = addProfile(newKidName.trim());
                                            if (success) {
                                                setShowAddModal(false);
                                                setNewKidName('');
                                            } else {
                                                alert('A gardener with this name already exists! Please choose a different name.');
                                            }
                                        }
                                    }}
                                    disabled={!newKidName.trim()}
                                    className="flex-1 bg-[#4A6D51] text-white font-bold py-3 rounded-xl hover:bg-[#3A5D41] disabled:opacity-50 transition-colors"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Remove Kid Confirmation Modal */}
                {deleteProfileId && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6">
                            <div className="text-center space-y-2">
                                <span className="text-4xl">🗑️</span>
                                <h3 className="text-2xl font-extrabold text-[#4A6D51]">Remove this profile?</h3>
                                <p className="text-[#8A8A8A] font-medium">
                                    Are you sure you want to remove <span className="text-[#4A6D51] font-bold">&quot;{profiles.find(p => p.id === deleteProfileId)?.name}&quot;</span>? This cannot be undone.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setDeleteProfileId(null)}
                                    className="flex-1 py-3 font-bold text-[#8A8A8A] hover:bg-[#FDFBF7] rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (deleteProfileId) {
                                            deleteProfile(deleteProfileId);
                                            setDeleteProfileId(null);
                                        }
                                    }}
                                    className="flex-1 bg-[#F4B9B2] text-white font-bold py-3 rounded-xl hover:bg-[#E09090] transition-colors"
                                >
                                    Yes, Remove
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Area */}
                <div className="space-y-4 pt-4 border-t border-[#F1F3C4]/50">
                    <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-xl border border-[#F1F3C4]/30 hover:bg-[#Fcfdf5] cursor-pointer transition-colors" onClick={() => router.push('/account')}>
                        <div className="flex items-center gap-3">
                            <span className="text-xl">⚙️</span>
                            <span className="font-bold text-[#4A6D51]">Account Settings</span>
                        </div>
                        <span className="text-[#8A8A8A]">›</span>
                    </div>
                </div>

                {/* Sign Out Button */}
                <div className="pt-4 border-t border-[#F1F3C4]/50 text-center">
                    <button
                        onClick={() => {
                            logout();
                            router.push('/login');
                        }}
                        className="text-[#F4B9B2] font-bold text-sm hover:text-[#E09090] transition-colors"
                    >
                        Sign Out
                    </button>
                </div>

            </div>
        </div>
    );
}
