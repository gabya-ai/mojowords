'use server'

import { prisma } from '@/app/lib/prisma';

// Type definition matching the Context state
export interface WordData {
    id?: string;
    word: string;
    definition: string;
    sentence: string;
    imageUrl: string;
    gradeLevel: number;
    difficulty: 'EASY' | 'MEDIUM' | 'CHALLENGE';
    timestamp?: number;
    isStarred?: boolean;
    comment?: string;
    mastery?: number;
    lastReviewed?: number;
    views?: number;
}

// Fetch words for a specific child profile
export async function getWords(childProfileId: string): Promise<(Required<Pick<WordData, 'id' | 'timestamp'>> & WordData)[]> {
    // If no childProfileId is passed (or it's 'default' without a real ID), return empty or handle
    if (!childProfileId || childProfileId === 'default') return [];

    const words = await prisma.word.findMany({
        where: { childProfileId },
        orderBy: { createdAt: 'desc' },
    });

    return words.map(w => ({
        id: w.id,
        word: w.word,
        definition: w.definition,
        sentence: w.sentence,
        imageUrl: w.imageUrl || '',
        gradeLevel: w.gradeLevel,
        difficulty: w.difficulty as 'EASY' | 'MEDIUM' | 'CHALLENGE',
        timestamp: w.createdAt.getTime(),
        isStarred: w.isStarred,
        comment: w.comment || undefined,
        mastery: w.mastery,
        lastReviewed: w.lastReviewed?.getTime(),
        views: w.views,
    }));
}

export async function addWord(childProfileId: string, data: Omit<WordData, 'id' | 'timestamp'>) {
    if (!childProfileId || childProfileId === 'default') {
        throw new Error("Valid Child Profile ID is required to add words");
    }

    // Check if word already exists for this child (case-insensitive)
    const existingWord = await prisma.word.findFirst({
        where: {
            childProfileId,
            word: {
                equals: data.word,
            }
        }
    });

    if (existingWord) {
        // Update existing word
        const updatedWord = await prisma.word.update({
            where: { id: existingWord.id },
            data: {
                definition: data.definition,
                sentence: data.sentence,
                imageUrl: data.imageUrl,
                gradeLevel: data.gradeLevel,
                difficulty: data.difficulty,
                // Preserve user data if not explicitly provided
                comment: data.comment || existingWord.comment,
                // Do not override isStarred
                // Keep mastery/views
            }
        });

        return {
            ...data,
            id: updatedWord.id,
            timestamp: updatedWord.createdAt.getTime(),
            comment: updatedWord.comment || undefined,
            isStarred: updatedWord.isStarred,
            mastery: updatedWord.mastery,
            views: updatedWord.views,
        };
    }

    const newWord = await prisma.word.create({
        data: {
            childProfileId,
            word: data.word,
            definition: data.definition,
            sentence: data.sentence,
            imageUrl: data.imageUrl,
            gradeLevel: data.gradeLevel,
            difficulty: data.difficulty,
            isStarred: data.isStarred || false,
            comment: data.comment,
            mastery: data.mastery || 0,
            views: data.views || 0,
        }
    });

    return {
        ...data,
        id: newWord.id,
        timestamp: newWord.createdAt.getTime(),
    };
}

export async function deleteWord(id: string) {
    await prisma.word.delete({
        where: { id },
    });
}

export async function toggleStar(id: string, isStarred: boolean) {
    await prisma.word.update({
        where: { id },
        data: { isStarred },
    });
}

export async function updateComment(id: string, comment: string) {
    await prisma.word.update({
        where: { id },
        data: { comment },
    });
}

export async function markWordViewed(id: string) {
    await prisma.word.update({
        where: { id },
        data: {
            views: { increment: 1 }
        }
    });
}

export async function markWordReviewed(id: string, difficulty: 'EASY' | 'MEDIUM' | 'HARD') {
    const word = await prisma.word.findUnique({ where: { id } });
    if (!word) return;

    let newMastery = word.mastery;

    switch (difficulty) {
        case 'EASY':
            newMastery = Math.min(100, newMastery + 20);
            break;
        case 'MEDIUM':
            newMastery = Math.min(100, newMastery + 10);
            break;
        case 'HARD':
            newMastery = Math.max(0, newMastery - 20);
            break;
    }

    await prisma.word.update({
        where: { id },
        data: {
            mastery: newMastery,
            lastReviewed: new Date(),
        }
    });
}
export async function updateWordImage(id: string, imageUrl: string) {
    await prisma.word.update({
        where: { id },
        data: { imageUrl },
    });
}
