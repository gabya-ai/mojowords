import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = await params; // Next.js 15+ await params

        const job = await prisma.job.findUnique({ where: { id } });

        if (!job) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({
            id: job.id,
            status: job.status,
            result: job.result,
            error: job.error
        });
    } catch (e: any) {
        return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
    }
}
