import { NextResponse } from 'next/server';

export async function GET() {
    const vars = {
        GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
        Has_GCP_PROJECT_ID: !!process.env.GCP_PROJECT_ID,
        Length_GCP_PROJECT_ID: process.env.GCP_PROJECT_ID?.length,

        GCP_CLIENT_EMAIL: process.env.GCP_CLIENT_EMAIL,
        Has_CLIENT_EMAIL: !!process.env.GCP_CLIENT_EMAIL,

        GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '*******' : undefined,
        Has_GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,

        NODE_ENV: process.env.NODE_ENV,
    };

    return NextResponse.json(vars);
}
