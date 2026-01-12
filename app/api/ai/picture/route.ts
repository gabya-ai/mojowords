import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { createHash } from 'crypto';
import { getAIClient } from '@/app/lib/ai';

// Helper for minimal "fire and forget" if platform allows, or just await for P0 simplicity
// User asked for "Non-blocking" -> We must return quickly.
// If we await generateImage, it blocks for 10s.
// We will try running it without await, but Vercel might kill it.
// Ideally usage of `waitUntil` if available, or just accept that on free tier it might be flaky.
// For P0 Stability we'll try the "background promise" approach.

export async function POST(req: NextRequest) {
    try {
        const { wordId, childId, prompt } = await req.json();

        if (!prompt || !childId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Idempotency Key
        const key = createHash('sha256').update(`${wordId || 'new'}-${childId}-${prompt}`).digest('hex');

        // 1. Check existing job
        let job = await prisma.job.findUnique({ where: { idempotencyKey: key } });

        if (job) {
            return NextResponse.json({ jobId: job.id, status: job.status });
        }

        // 2. Create Job
        job = await prisma.job.create({
            data: {
                type: 'IMAGE_GENERATION',
                status: 'PENDING',
                idempotencyKey: key,
                childId,
                wordId,
            }
        });

        // 3. Trigger Async Processing (Fire & Forget Logic)
        (async () => {
            try {
                await prisma.job.update({ where: { id: job.id }, data: { status: 'PROCESSING' } });

                const client = getAIClient();
                // We rely on the 10s timeout we implemented in route.ts or here? 
                // Let's just call generateImage. 
                const imageUrl = await client.generateImage(prompt);

                await prisma.job.update({
                    where: { id: job.id },
                    data: { status: 'COMPLETED', result: { imageUrl } }
                });
            } catch (e: any) {
                console.error("Async Job Failed:", e);
                await prisma.job.update({
                    where: { id: job.id },
                    data: { status: 'FAILED', error: e.message || 'Unknown error' }
                });
            }
        })();

        return NextResponse.json({ jobId: job.id, status: 'PENDING' });

    } catch (e: any) {
        console.error("Enqueue Error:", e);
        return NextResponse.json({ error: 'Failed to enqueue job' }, { status: 500 });
    }
}
