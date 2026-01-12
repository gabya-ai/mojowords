const MIN_LENGTH = 2;
const MAX_LENGTH = 30;
// Allow letters, spaces, hyphens, apostrophes. Reject numbers and symbols.
const VALID_REGEX = /^[a-zA-Z\s\-']+$/;
const GARBAGE_PATTERNS = [
    /(.)\1{2,}/, // "aaa" sequence (3 chars or more)
    /^[b-df-hj-np-tv-z]+$/i // Explict consonant-only check (heuristic)
];

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export function validateWord(input: string): ValidationResult {
    if (!input || typeof input !== 'string') {
        return { isValid: false, error: 'Input is empty' };
    }
    const trimmed = input.trim();

    if (trimmed.length < MIN_LENGTH) return { isValid: false, error: 'Word is too short' };
    if (trimmed.length > MAX_LENGTH) return { isValid: false, error: 'Word is too long' };

    if (!VALID_REGEX.test(trimmed)) {
        return { isValid: false, error: "Please enter a valid word (letters, spaces, - and ')." };
    }

    if (GARBAGE_PATTERNS.some(p => p.test(trimmed))) {
        return { isValid: false, error: "That doesn't look like a real word." };
    }

    return { isValid: true };
}
