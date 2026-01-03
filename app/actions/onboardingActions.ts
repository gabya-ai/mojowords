'use server';

import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function completeOnboarding() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        throw new Error("Not authenticated");
    }

    // Update the user
    await prisma.user.update({
        where: { email: session.user.email },
        data: { hasCompletedOnboarding: true }
    });

    return { success: true };
}
