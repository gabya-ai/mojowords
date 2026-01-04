'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from "next-auth/react";
import { getWords, addWord as addWordAction, deleteWord as deleteWordAction, toggleStar as toggleStarAction, updateComment as updateCommentAction, markWordReviewed as markWordReviewedAction, markWordViewed as markWordViewedAction, updateWordImage as updateWordImageAction } from '@/app/actions/wordActions';
import { getProfiles, createProfile, deleteProfile as deleteProfileAction } from '@/app/actions/profileActions';

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

export interface ChildProfile {
    id: string;
    name: string;
    streak: number;
    lastVisit: string | null;
    age?: number;
    grade?: number;
    hasCompletedOnboarding?: boolean;
}

interface WordsContextType {
    words: Word[];
    addWord: (word: Word) => Promise<Word>;
    deleteWord: (id: string) => void;
    toggleStar: (id: string) => void;
    updateComment: (id: string, comment: string) => void;
    markWordReviewed: (id: string, difficulty: 'EASY' | 'MEDIUM' | 'HARD') => void;
    markWordViewed: (id: string) => void;
    updateWordImage: (id: string, imageUrl: string) => void;

    // Active Child (The one whose garden we see)
    userProfile: ChildProfile;

    // Parent Info (The one logged in)
    parentSettings: {
        name: string;
        email: string;
        state?: string;
        hasCompletedOnboarding?: boolean;
    };

    updateUserName: (name: string) => void; // Updates Active Child Name
    updateUserProfile: (data: Partial<ChildProfile>) => void; // Updates Active Child Stats
    updateParentSettings: (data: Partial<WordsContextType['parentSettings']>) => void;

    // Profile Management
    profiles: ChildProfile[];
    addProfile: (name: string, age?: number, grade?: number) => Promise<boolean>;
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

    // Parent Identity (Logged in user)
    const [parentSettings, setParentSettings] = useState<WordsContextType['parentSettings']>({
        name: 'Gardener',
        email: '',
        state: '',
    });

    // List of all profiles for this parent
    const [profiles, setProfiles] = useState<ChildProfile[]>([]);

    // Active Child (Currently viewing) - Default to placeholder
    const [userProfile, setUserProfile] = useState<ChildProfile>({
        id: 'default',
        name: 'Explorer',
        streak: 0,
        lastVisit: null,
    });

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Sync Session to Parent Settings & Fetch Profiles
    useEffect(() => {
        if (session?.user) {
            setTimeout(async () => {


                // Fetch Real Profiles from Server
                try {
                    const fetchedProfiles = await getProfiles();
                    setProfiles(fetchedProfiles);

                    const hasChildren = fetchedProfiles.length > 0;

                    // Set Parent Info
                    // Derive hasCompletedOnboarding from whether they have created any child profiles
                    setParentSettings(prev => ({
                        ...prev,
                        name: session.user?.name || "Gardener",
                        email: session.user?.email || prev.email,
                        hasCompletedOnboarding: hasChildren
                    }));

                    setIsAuthenticated(true);

                    // If we have profiles, auto-select the last active one or the first one
                    if (hasChildren) {
                        // TODO: Logic for last active. For now, first one.
                        setUserProfile(fetchedProfiles[0]);
                    } else {
                        // No profiles (New User) -> Application should probably redirect to Onboarding
                        // Handled by Components checking hasCompletedOnboarding
                    }
                } catch (e) {
                    console.error("Failed to fetch profiles", e);
                }
            }, 0);
        }
    }, [session]);

    // Check streak logic (Client side primarily)
    const checkStreak = () => {
        if (userProfile.id === 'default') return;

        setTimeout(() => {
            setUserProfile(prev => {
                const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
                const lastVisit = prev.lastVisit ? prev.lastVisit.split('T')[0] : null;

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
                    return { ...prev, streak: 1, lastVisit: today };
                }
            });
        }, 0);
    };

    // Load words from DB when Active Profile changes
    useEffect(() => {
        if (userProfile.id && userProfile.id !== 'default') {
            getWords(userProfile.id).then(fetchedWords => {
                setWords(fetchedWords);
            });
        } else {
            setWords([]);
        }
    }, [userProfile.id]);

    const updateUserName = (name: string) => {
        setUserProfile(prev => ({ ...prev, name }));
    };

    const updateUserProfile = (data: Partial<ChildProfile>) => {
        setUserProfile(prev => ({ ...prev, ...data }));
    };

    const updateParentSettings = (data: Partial<WordsContextType['parentSettings']>) => {
        setParentSettings(prev => ({ ...prev, ...data }));
    };

    const addProfile = async (name: string, age?: number, grade?: number) => {
        // Optimistic check
        if (profiles.some(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
            return false;
        }

        try {
            const newProfile = await createProfile(name.trim(), age, grade);
            if (newProfile) {
                setProfiles(prev => [...prev, newProfile]);
                setUserProfile(newProfile);
                setParentSettings(prev => ({ ...prev, hasCompletedOnboarding: true }));
                return true;
            }
            return false;
        } catch (e) {
            console.error("Failed to create profile", e);
            return false;
        }
    };

    const switchProfile = (id: string) => {
        const profile = profiles.find(p => p.id === id);
        if (profile) {
            setUserProfile(profile);
        }
    };

    const deleteProfile = async (id: string) => {
        // Optimistic UI Update
        const newProfiles = profiles.filter(p => p.id !== id);
        setProfiles(newProfiles);

        if (userProfile.id === id) {
            if (newProfiles.length > 0) {
                setUserProfile(newProfiles[0]);
            } else {
                setUserProfile({
                    id: 'default',
                    name: 'Explorer',
                    streak: 0,
                    lastVisit: null
                });
            }
        }

        // Update onboarding status immediately
        setParentSettings(prev => ({ ...prev, hasCompletedOnboarding: newProfiles.length > 0 }));

        try {
            await deleteProfileAction(id);
        } catch (e) {
            console.error("Failed to delete profile", e);
        }
    };

    const addWord = async (word: Word): Promise<Word> => {
        if (userProfile.id === 'default') {
            console.warn("Cannot add word to default profile");
            return word;
        }

        // Optimistic update
        setWords(prev => {
            const exists = prev.some(w => w.word.toLowerCase() === word.word.toLowerCase());
            if (exists) {
                return [word, ...prev.filter(w => w.word.toLowerCase() !== word.word.toLowerCase())];
            }
            return [word, ...prev];
        });

        try {
            // Call server with CHILD ID
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
                const replaced = prev.map(w => w.id === word.id ? savedWord : w);
                return replaced;
            });
            return savedWord;
        } catch (error) {
            console.error("Failed to save word:", error);
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
        setWords(prev => prev.map(w => w.id === id ? { ...w, isStarred: newStatus } : w));
        await toggleStarAction(id, newStatus);
    };

    const updateComment = async (id: string, comment: string) => {
        setWords(prev => prev.map(w => w.id === id ? { ...w, comment } : w));
        await updateCommentAction(id, comment);
    };

    const markWordViewed = async (id: string) => {
        setWords(prev => prev.map(w => w.id === id ? { ...w, views: (w.views || 0) + 1 } : w));
        await markWordViewedAction(id);
    };

    const updateWordImage = async (id: string, imageUrl: string) => {
        setWords(prev => prev.map(w => w.id === id ? { ...w, imageUrl } : w));
        await updateWordImageAction(id, imageUrl);
    };

    const markWordReviewed = async (id: string, difficulty: 'EASY' | 'MEDIUM' | 'HARD') => {
        setWords(prev => prev.map(w => {
            if (w.id !== id) return w;
            let newMastery = w.mastery || 0;
            switch (difficulty) {
                case 'EASY': newMastery = Math.min(100, newMastery + 20); break;
                case 'MEDIUM': newMastery = Math.min(100, newMastery + 10); break;
                case 'HARD': newMastery = Math.max(0, newMastery - 20); break;
            }
            return { ...w, mastery: newMastery, lastReviewed: Date.now() };
        }));
        await markWordReviewedAction(id, difficulty);
    };

    const login = () => {
        setIsAuthenticated(true);
        setParentSettings(prev => ({ ...prev, name: 'Gardener', email: 'parent@example.com' }));
    };

    const logout = () => {
        setIsAuthenticated(false);
        setParentSettings({ name: 'Gardener', email: '', state: '' });
        setUserProfile({ id: 'default', name: 'Explorer', streak: 0, lastVisit: null });
        setWords([]);
        setProfiles([]);
        localStorage.removeItem('vocal-tool-auth');
    };

    return (
        <WordsContext.Provider value={{ words, addWord, deleteWord, toggleStar, updateComment, markWordReviewed, markWordViewed, updateWordImage, userProfile, parentSettings, updateUserName, updateUserProfile, updateParentSettings, profiles, addProfile, switchProfile, deleteProfile, isAuthenticated, login, logout }}>
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
