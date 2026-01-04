'use server';

import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export interface ChildProfileData {
    id: string;
    name: string;
    age?: number;
    grade?: number;
    streak: number;
    lastVisit: string | null; // ISO Date string
    hasCompletedOnboarding?: boolean; // Derived
}

export async function getProfiles(): Promise<ChildProfileData[]> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return [];
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { children: true }
    });

    if (!user) return [];

    return user.children.map(child => ({
        id: child.id,
        name: child.name,
        age: child.age || undefined,
        grade: child.grade || undefined,
        streak: child.streak,
        lastVisit: child.lastVisit ? child.lastVisit.toISOString() : null,
        hasCompletedOnboarding: true // Existing profiles are always onboarded
    }));
}

export async function createProfile(name: string, age?: number, grade?: number): Promise<ChildProfileData | null> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        throw new Error("Not authenticated");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) throw new Error("User not found");

    // Check for duplicates
    const existing = await prisma.childProfile.findFirst({
        where: {
            userId: user.id,
            name: {
                equals: name,
                mode: 'insensitive' // Postgres supports this
            }
        }
    });

    if (existing) {
        return null; // Duplicate
    }

    const child = await prisma.childProfile.create({
        data: {
            userId: user.id,
            name: name,
            age: age,
            grade: grade,
        }
    });

    revalidatePath('/');
    revalidatePath('/profile');

    return {
        id: child.id,
        name: child.name,
        age: child.age || undefined,
        grade: child.grade || undefined,
        streak: child.streak,
        lastVisit: null,
        hasCompletedOnboarding: true
    };
}

export async function deleteProfile(profileId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Not authenticated");

    // Ensure the profile belongs to the user
    // We can do this efficiently by checking relation or just fetch user first.
    // Let's rely on delete where

    // First get user id
    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) throw new Error("User not found");

    await prisma.childProfile.delete({
        where: {
            id: profileId,
            userId: user.id // Security check: must belong to user
        }
    });

    revalidatePath('/');
    revalidatePath('/profile');
}
