'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useTestSession, TestSessionState } from '@/hooks/useTestSession';

interface TestContextType {
    state: TestSessionState;
    startSession: (mode: any, count: number, context: any) => Promise<void>;
    setAnswer: (answer: string) => void;
    nextQuestion: () => void;
    prevQuestion: () => void;
    goToQuestion: (index: number) => void;
    submitSession: () => Promise<void>;
    resetSession: () => void;
}

const TestContext = createContext<TestContextType | null>(null);

export const TestProvider = ({ children }: { children: ReactNode }) => {
    const session = useTestSession();

    return (
        <TestContext.Provider value={session}>
            {children}
        </TestContext.Provider>
    );
};

export const useTestContext = () => {
    const context = useContext(TestContext);
    if (!context) {
        throw new Error('useTestContext must be used within a TestProvider');
    }
    return context;
};
