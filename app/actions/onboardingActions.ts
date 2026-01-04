'use server';

import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function completeOnboarding(childName: string, childAge?: number, childGrade?: number) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        throw new Error("Not authenticated");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Create a new Child Profile
    const newProfile = await prisma.childProfile.create({
        data: {
            userId: user.id,
            name: childName,
            age: childAge,
            grade: childGrade,
            streak: 0,
            // If this is the first child, it effectively completes onboarding for the parent
        }
    });

    return { success: true, profileId: newProfile.id };
}
