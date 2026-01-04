'use server';

import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function completeOnboarding(name: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        throw new Error("Not authenticated");
    }

    // Update the user
    await prisma.user.update({
        where: { email: session.user.email },
        data: {
            hasCompletedOnboarding: true,
            name: name // Save the Explorer's name
        }
    });

    return { success: true };
}
