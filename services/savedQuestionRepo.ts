import { TestQuestion } from '@/services/agents/types';

export type SavedQuestion = TestQuestion & {
    savedAt: string;
};

export interface SavedQuestionRepo {
    save(question: TestQuestion): Promise<void>;
    getAll(): Promise<SavedQuestion[]>;
    remove(id: string): Promise<void>;
}

// Simple local storage implementation
export class LocalSavedQuestionRepo implements SavedQuestionRepo {
    private STORAGE_KEY = 'mojoword_saved_questions';

    async save(question: TestQuestion): Promise<void> {
        if (typeof window === 'undefined') return;
        const current = await this.getAll();
        if (!current.find(q => q.id === question.id)) {
            const newItem: SavedQuestion = { ...question, savedAt: new Date().toISOString() };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...current, newItem]));
        }
    }

    async getAll(): Promise<SavedQuestion[]> {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    async remove(id: string): Promise<void> {
        if (typeof window === 'undefined') return;
        const current = await this.getAll();
        const updated = current.filter(q => q.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    }
}
