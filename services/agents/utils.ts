/**
 * Cleans a string that might contain a markdown code block with JSON.
 * Example input: ```json\n{"foo": "bar"}\n```
 * Example output: {"foo": "bar"}
 */
export function cleanJson(text: string): string {
    // Remove markdown code blocks if present
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // Also try to find the first '{' and last '}' to handle extra text around JSON
    const firstOpen = cleaned.indexOf('{');
    const firstArray = cleaned.indexOf('[');

    // If we find an array or object start, try to extract just that part
    if (firstOpen !== -1 || firstArray !== -1) {
        const start = firstOpen !== -1 && (firstArray === -1 || firstOpen < firstArray) ? firstOpen : firstArray;
        const lastClose = cleaned.lastIndexOf(start === firstOpen ? '}' : ']');

        if (lastClose !== -1 && lastClose > start) {
            cleaned = cleaned.substring(start, lastClose + 1);
        }
    }

    return cleaned;
}
