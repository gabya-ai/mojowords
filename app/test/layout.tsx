import React from 'react';
import { TestProvider } from '@/context/TestContext';

export default function TestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <TestProvider>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto p-6">
                    {children}
                </div>
            </div>
        </TestProvider>
    );
}
