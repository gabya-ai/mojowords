// Embedded for verification to avoid ts-node import issues
function cleanJson(text: string): string {
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

const testCases = [
    {
        name: "Standard JSON",
        input: `{"foo": "bar"}`,
        expected: `{"foo": "bar"}`
    },
    {
        name: "Markdown Code Block",
        input: "```json\n{\"foo\": \"bar\"}\n```",
        expected: `{"foo": "bar"}`
    },
    {
        name: "Markdown with text outside",
        input: "Here is the JSON:\n```json\n{\"foo\": \"bar\"}\n```\nHope this helps!",
        expected: `{"foo": "bar"}`
    },
    {
        name: "Plain text with JSON inside",
        input: "Sure, here is it: {\"foo\": \"bar\"}",
        expected: `{"foo": "bar"}`
    }
];

testCases.forEach(tc => {
    const result = cleanJson(tc.input);
    if (result === tc.expected) {
        console.log(`✅ ${tc.name} PASSED`);
    } else {
        console.error(`❌ ${tc.name} FAILED`);
        console.error(`Input: ${JSON.stringify(tc.input)}`);
        console.error(`Expected: ${JSON.stringify(tc.expected)}`);
        console.error(`Actual: ${JSON.stringify(result)}`);
    }
});
