import { POST } from '../app/api/ai/route';
import { NextRequest } from 'next/server';

// Mock NextRequest
class MockNextRequest extends Request {
    constructor(body: any) {
        super('http://localhost:3000/api/ai', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }
    async json() {
        return super.json();
    }
}

async function verifyGemini() {
    console.log("Testing Gemini API...");
    try {
        const req = new MockNextRequest({
            prompt: "elephant",
            agent: "generator"
        }) as unknown as NextRequest;

        const response = await POST(req);
        const data = await response.json();

        console.log("Status:", response.status);
        if (response.status === 200) {
            console.log("Success! Response:");
            console.log(JSON.parse(data.text));
        } else {
            console.error("Error Response:", data);
        }

    } catch (e) {
        console.error("Verification failed:", e);
    }
}

verifyGemini();
