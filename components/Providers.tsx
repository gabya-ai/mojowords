'use client';

import { SessionProvider } from "next-auth/react";
import { WordsProvider } from "@/context/WordsContext";
import { TestProvider } from "@/context/TestContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <WordsProvider>
                <TestProvider>
                    {children}
                </TestProvider>
            </WordsProvider>
        </SessionProvider>
    );
}
