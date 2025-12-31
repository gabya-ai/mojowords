'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Word {
    id: string;
    word: string;
    definition: string;
    sentence: string;
    imageUrl: string;
    gradeLevel: number;
    difficulty: 'EASY' | 'MEDIUM' | 'CHALLENGE';
    timestamp: number;
    isStarred?: boolean;
    comment?: string;
}

interface WordsContextType {
    words: Word[];
    addWord: (word: Word) => void;
    deleteWord: (id: string) => void;
    toggleStar: (id: string) => void;
    updateComment: (id: string, comment: string) => void;
    userProfile: {
        id: string; // Add ID for tracking
        name: string;
        streak: number;
        lastVisit: string | null;
        email?: string;
        age?: number;
        grade?: number;
        state?: string;
        hasCompletedOnboarding?: boolean;
    };
    updateUserName: (name: string) => void;
    updateUserProfile: (data: Partial<WordsContextType['userProfile']>) => void;
    profiles: WordsContextType['userProfile'][]; // List of all profiles
    addProfile: (name: string) => void;
    switchProfile: (id: string) => void;
    deleteProfile: (id: string) => void;
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
}

export const WordsContext = createContext<WordsContextType | undefined>(undefined);

export function WordsProvider({ children }: { children: ReactNode }) {
    const [words, setWords] = useState<Word[]>([]);
    const [profiles, setProfiles] = useState<WordsContextType['userProfile'][]>([]);
    const [userProfile, setUserProfile] = useState<WordsContextType['userProfile']>({
        id: 'default',
        name: 'Explorer',
        streak: 0,
        lastVisit: null,
        email: ''
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const savedWords = localStorage.getItem('vocal-tool-words');
        const savedProfile = localStorage.getItem('vocal-tool-profile');
        const savedProfiles = localStorage.getItem('vocal-tool-profiles');
        const savedAuth = localStorage.getItem('vocal-tool-auth');

        if (savedAuth) {
            try {
                setIsAuthenticated(JSON.parse(savedAuth));
            } catch (e) {
                console.error('Failed to parse auth', e);
            }
        }

        if (savedWords) {
            try {
                setWords(JSON.parse(savedWords));
            } catch (e) {
                console.error('Failed to parse words from localStorage', e);
            }
        }

        if (savedProfile) {
            try {
                setUserProfile(JSON.parse(savedProfile));
            } catch (e) {
                console.error('Failed to parse profile from localStorage', e);
            }
        }

        if (savedProfiles) {
            try {
                setProfiles(JSON.parse(savedProfiles));
            } catch (e) {
                console.error('Failed to parse profiles from localStorage', e);
            }
        }

        // Check streak on mount
        checkStreak();
    }, []);

    // Save to localStorage whenever words or profile change
    useEffect(() => {
        localStorage.setItem('vocal-tool-words', JSON.stringify(words));
    }, [words]);

    useEffect(() => {
        localStorage.setItem('vocal-tool-profile', JSON.stringify(userProfile));

        // Also update this profile in the profiles list
        setProfiles(prev => {
            // Deduplicate logic: check by ID
            const existingIndex = prev.findIndex(p => p.id === userProfile.id);

            if (existingIndex >= 0) {
                // Only update if actually different to avoid infinite loops if we were careful
                // But simplified: just replace
                const newProfiles = [...prev];
                newProfiles[existingIndex] = userProfile;
                return newProfiles;
            } else {
                // If not in list, add it.
                // Guard against duplicate adding (React 18 Strict Mode double-invoke protection)
                if (prev.some(p => p.id === userProfile.id)) return prev;
                return [...prev, userProfile];
            }
        });
    }, [userProfile]);

    useEffect(() => {
        localStorage.setItem('vocal-tool-profiles', JSON.stringify(profiles));
    }, [profiles]);

    useEffect(() => {
        localStorage.setItem('vocal-tool-auth', JSON.stringify(isAuthenticated));
    }, [isAuthenticated]);

    const checkStreak = () => {
        setUserProfile(prev => {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const lastVisit = prev.lastVisit;

            // If visiting for the first time or same day, just update last visit
            if (!lastVisit) {
                return { ...prev, streak: 1, lastVisit: today };
            }

            if (lastVisit === today) {
                return prev;
            }

            // Check if last visit was yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastVisit === yesterdayStr) {
                return { ...prev, streak: prev.streak + 1, lastVisit: today };
            } else {
                // Missed a day (or more), reset streak
                return { ...prev, streak: 1, lastVisit: today };
            }
        });
    };

    const updateUserName = (name: string) => {
        setUserProfile(prev => ({ ...prev, name }));
    };

    const updateUserProfile = (data: Partial<typeof userProfile>) => {
        setUserProfile(prev => ({ ...prev, ...data }));
    };

    const addProfile = (name: string) => {
        const newProfile: WordsContextType['userProfile'] = {
            id: Date.now().toString(),
            name,
            streak: 0,
            lastVisit: null,
            hasCompletedOnboarding: false
        };
        setProfiles(prev => [...prev, newProfile]);
        // Switch to new profile? Optional. Let's not auto-switch for now, just add.
        // Actually, for "Add Kid" flow, usually you want to set it up.
    };

    const switchProfile = (id: string) => {
        const profile = profiles.find(p => p.id === id);
        if (profile) {
            setUserProfile(profile);
        }
    };

    const deleteProfile = (id: string) => {
        // Prevent deleting the last profile or the active one (for simplicity, force switch if active deleted? check requirements)
        // Requirement: "allows remove kids. for example, i want to remove "Explorer"."

        setProfiles(prev => prev.filter(p => p.id !== id));

        // If we deleted the active profile, switch to the first available one
        if (userProfile.id === id) {
            setProfiles(prev => {
                const remaining = prev.filter(p => p.id !== id);
                if (remaining.length > 0) {
                    setUserProfile(remaining[0]);
                } else {
                    // Fallback if all deleted? Should typically keep at least one or logout.
                    // Create a fresh guest/default
                    setUserProfile({
                        id: 'default',
                        name: 'Explorer',
                        streak: 0,
                        lastVisit: null,
                        email: ''
                    });
                }
                return remaining;
            });
        }
    };

    const addWord = (word: Word) => {
        setWords(prev => {
            const filtered = prev.filter(w => w.word.toLowerCase() !== word.word.toLowerCase());
            return [word, ...filtered];
        });
        checkStreak(); // Update streak on activity
    };

    const deleteWord = (id: string) => {
        setWords(prev => prev.filter(w => w.id !== id));
    };

    const toggleStar = (id: string) => {
        setWords(prev => prev.map(w =>
            w.id === id ? { ...w, isStarred: !w.isStarred } : w
        ));
    };

    const updateComment = (id: string, comment: string) => {
        setWords(prev => prev.map(w =>
            w.id === id ? { ...w, comment } : w
        ));
    };

    const login = () => {
        setIsAuthenticated(true);
        // Only set default profile if it doesn't have an email (new user concept)
        setUserProfile(prev => prev.email ? prev : { ...prev, name: 'Explorer', email: 'explorer@example.com' });
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUserProfile(prev => ({ ...prev, email: '' })); // Reset sensitive info but keep prefs if needed
        localStorage.removeItem('vocal-tool-auth');
    };

    return (
        <WordsContext.Provider value={{ words, addWord, deleteWord, toggleStar, updateComment, userProfile, updateUserName, updateUserProfile, profiles, addProfile, switchProfile, deleteProfile, isAuthenticated, login, logout }}>
            {children}
        </WordsContext.Provider>
    );
}

export function useWords() {
    const context = useContext(WordsContext);
    if (context === undefined) {
        throw new Error('useWords must be used within a WordsProvider');
    }
    return context;
}
