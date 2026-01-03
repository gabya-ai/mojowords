'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from "next-auth/react";
import { getWords, addWord as addWordAction, deleteWord as deleteWordAction, toggleStar as toggleStarAction, updateComment as updateCommentAction, markWordReviewed as markWordReviewedAction, markWordViewed as markWordViewedAction } from '@/app/actions/wordActions';

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
    mastery?: number; // 0 = New, 100 = Mastered
    lastReviewed?: number;
    views?: number; // Exposure count
}

interface WordsContextType {
    words: Word[];
    addWord: (word: Word) => Promise<Word>;
    deleteWord: (id: string) => void;
    toggleStar: (id: string) => void;
    updateComment: (id: string, comment: string) => void;
    markWordReviewed: (id: string, difficulty: 'EASY' | 'MEDIUM' | 'HARD') => void;
    markWordViewed: (id: string) => void;
    userProfile: { // Represents the ACTIVE Child/Gardener
        id: string;
        name: string;
        streak: number;
        lastVisit: string | null;
        age?: number;
        grade?: number;
        hasCompletedOnboarding?: boolean;
    };
    parentSettings: { // Represents the Logged-in Parent (Static)
        name: string;
        email: string;
        state?: string;
        hasCompletedOnboarding?: boolean;
    };
    updateUserName: (name: string) => void;
    updateUserProfile: (data: Partial<WordsContextType['userProfile']>) => void;
    updateParentSettings: (data: Partial<WordsContextType['parentSettings']>) => void;
    profiles: WordsContextType['userProfile'][]; // List of all profiles
    addProfile: (name: string) => boolean;
    switchProfile: (id: string) => void;
    deleteProfile: (id: string) => void;
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
}

export const WordsContext = createContext<WordsContextType | undefined>(undefined);

export function WordsProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const [words, setWords] = useState<Word[]>([]);
    const [profiles, setProfiles] = useState<WordsContextType['userProfile'][]>([]);

    // Parent Identity (Logged in user)
    const [parentSettings, setParentSettings] = useState<WordsContextType['parentSettings']>({
        name: 'Gardener',
        email: '',
        state: '',
        hasCompletedOnboarding: false
    });

    // Active Child (Currently viewing)
    const [userProfile, setUserProfile] = useState<WordsContextType['userProfile']>({
        id: 'default',
        name: 'Explorer',
        streak: 0,
        lastVisit: null,
        hasCompletedOnboarding: true // Default explorer is considered ready
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Sync Session to Parent Settings
    useEffect(() => {
        if (session?.user) {
            setTimeout(() => {
                setIsAuthenticated(true);

                // @ts-ignore
                const dbOnboardingStatus = session.user?.hasCompletedOnboarding;

                // Set Parent Info
                setParentSettings(prev => ({
                    ...prev,
                    name: session.user?.name || "Gardener",
                    email: session.user?.email || prev.email,
                    hasCompletedOnboarding: dbOnboardingStatus ?? prev.hasCompletedOnboarding
                }));

                // ensure userProfile is not polluted by parent info
            }, 0);
        }
    }, [session]);

    const checkStreak = () => {
        setTimeout(() => {
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
        }, 0);
    };

    // Load from localStorage on mount
    useEffect(() => {
        const savedProfile = localStorage.getItem('vocal-tool-profile');
        const savedProfiles = localStorage.getItem('vocal-tool-profiles');
        const savedAuth = localStorage.getItem('vocal-tool-auth');

        if (savedAuth) {
            try {
                const auth = JSON.parse(savedAuth);
                setTimeout(() => setIsAuthenticated(auth), 0);
            } catch (e) {
                console.error('Failed to parse auth', e);
            }
        }

        if (savedProfile) {
            try {
                const profile = JSON.parse(savedProfile);
                setTimeout(() => setUserProfile(profile), 0);
            } catch (e) {
                console.error('Failed to parse profile from localStorage', e);
            }
        }

        if (savedProfiles) {
            try {
                const profiles = JSON.parse(savedProfiles);
                setTimeout(() => setProfiles(profiles), 0);
            } catch (e) {
                console.error('Failed to parse profiles from localStorage', e);
            }
        }

        // Check streak on mount
        checkStreak();
    }, []);

    // Load words from DB when user changes
    useEffect(() => {
        if (userProfile.id) {
            getWords(userProfile.id).then(fetchedWords => {
                setWords(fetchedWords);
            });
        }
    }, [userProfile.id]);

    // Save to localStorage whenever profile changes (removed words sync)

    useEffect(() => {
        localStorage.setItem('vocal-tool-profile', JSON.stringify(userProfile));

        // Also update this profile in the profiles list
        // Use timeout to avoid sync setState in effect
        setTimeout(() => {
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
        }, 0);
    }, [userProfile]);

    useEffect(() => {
        localStorage.setItem('vocal-tool-profiles', JSON.stringify(profiles));
    }, [profiles]);

    useEffect(() => {
        localStorage.setItem('vocal-tool-auth', JSON.stringify(isAuthenticated));
    }, [isAuthenticated]);

    const updateUserName = (name: string) => {
        setUserProfile(prev => ({ ...prev, name }));
    };

    const updateUserProfile = (data: Partial<typeof userProfile>) => {
        setUserProfile(prev => ({ ...prev, ...data }));
    };

    const updateParentSettings = (data: Partial<WordsContextType['parentSettings']>) => {
        setParentSettings(prev => ({ ...prev, ...data }));
    };

    const addProfile = (name: string) => {
        // Check for duplicates (case-insensitive)
        if (profiles.some(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
            return false;
        }

        const newProfile: WordsContextType['userProfile'] = {
            id: Date.now().toString(),
            name: name.trim(),
            streak: 0,
            lastVisit: null,
            hasCompletedOnboarding: true // New profiles added by parent don't need survey
        };
        setProfiles(prev => [...prev, newProfile]);
        return true;
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
                        lastVisit: null
                    });
                }
                return remaining;
            });
        }
    };

    const addWord = async (word: Word): Promise<Word> => {
        // Optimistic update: Remove duplicates first to avoid UI jumps
        setWords(prev => {
            const exists = prev.some(w => w.word.toLowerCase() === word.word.toLowerCase());
            if (exists) {
                // Filter out the old one so the new one takes precedence at top
                return [word, ...prev.filter(w => w.word.toLowerCase() !== word.word.toLowerCase())];
            }
            return [word, ...prev];
        });

        try {
            // Call server
            const savedWord = await addWordAction(userProfile.id, {
                word: word.word,
                definition: word.definition,
                sentence: word.sentence,
                imageUrl: word.imageUrl,
                gradeLevel: word.gradeLevel,
                difficulty: word.difficulty,
                isStarred: word.isStarred,
                comment: word.comment,
                mastery: word.mastery,
                views: word.views
            });

            // Update state with real ID from server
            setWords(prev => {
                // Replace the temporary optimistic word with the real one
                // And explicitly dedupe just in case the optimistic filtering missed something (race condition)
                const replaced = prev.map(w => w.id === word.id ? savedWord : w);

                // Final safety net: if savedWord.id matches ANOTHER item in the list (not the temp one we just replaced),
                // we should keep the one we just updated and remove the stale one.
                // However, our optimistic filter *should* have removed the old one.
                // If the old one was '123' and temp was '999'. We removed '123' and added '999'.
                // Now we swap '999' -> '123'. We are good.
                return replaced;
            });
            return savedWord;
        } catch (error) {
            console.error("Failed to save word:", error);
            // Revert on error? For now just log and return optimistic word
            return word;
        }

        checkStreak(); // Update streak on activity
    };

    const deleteWord = async (id: string) => {
        setWords(prev => prev.filter(w => w.id !== id));
        await deleteWordAction(id);
    };

    const toggleStar = async (id: string) => {
        const word = words.find(w => w.id === id);
        if (!word) return;
        const newStatus = !word.isStarred;

        setWords(prev => prev.map(w =>
            w.id === id ? { ...w, isStarred: newStatus } : w
        ));
        await toggleStarAction(id, newStatus);
    };

    const updateComment = async (id: string, comment: string) => {
        setWords(prev => prev.map(w =>
            w.id === id ? { ...w, comment } : w
        ));
        await updateCommentAction(id, comment);
    };

    const markWordViewed = async (id: string) => {
        setWords(prev => prev.map(w =>
            w.id === id ? { ...w, views: (w.views || 0) + 1 } : w
        ));
        await markWordViewedAction(id);
    };

    const markWordReviewed = async (id: string, difficulty: 'EASY' | 'MEDIUM' | 'HARD') => {
        setWords(prev => prev.map(w => {
            if (w.id !== id) return w;

            // Simple Spaced Repetition Logic (Placeholder for SM-2)
            // EASY -> Increase mastery significantly
            // MEDIUM -> Increase mastery slightly
            // HARD -> Reset or decrease mastery

            let newMastery = w.mastery || 0;

            switch (difficulty) {
                case 'EASY':
                    newMastery = Math.min(100, newMastery + 20);
                    break;
                case 'MEDIUM':
                    newMastery = Math.min(100, newMastery + 10);
                    break;
                case 'HARD':
                    newMastery = Math.max(0, newMastery - 20); // Penalty
                    break;
            }

            return {
                ...w,
                mastery: newMastery,
                lastReviewed: Date.now(),
            };
        }));

        await markWordReviewedAction(id, difficulty);
    };

    const login = () => {
        setIsAuthenticated(true);
        // Developer Mode: Set Parent Defaults
        setParentSettings(prev => ({
            ...prev,
            name: 'Gardener',
            email: 'parent@example.com',
            state: 'CA'
        }));
        // Ensure default child exists
        if (profiles.length === 0 && userProfile.id === 'default') {
            // Default is fine
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setParentSettings({ name: 'Gardener', email: '', state: '' }); // Reset Parent
        setUserProfile(prev => ({ ...prev, id: 'default', name: 'Explorer', streak: 0 })); // Reset Child
        localStorage.removeItem('vocal-tool-auth');
    };

    return (
        <WordsContext.Provider value={{ words, addWord, deleteWord, toggleStar, updateComment, markWordReviewed, markWordViewed, userProfile, parentSettings, updateUserName, updateUserProfile, updateParentSettings, profiles, addProfile, switchProfile, deleteProfile, isAuthenticated, login, logout }}>
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
