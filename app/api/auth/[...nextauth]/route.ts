import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "@/app/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET || "dev-secret-123",
    session: {
        // strategy: "jwt", // Defaults to "database" when adapter is present
    },
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                // @ts-ignore
                session.user.id = user.id;
                // @ts-ignore
                session.user.hasCompletedOnboarding = user.hasCompletedOnboarding;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
