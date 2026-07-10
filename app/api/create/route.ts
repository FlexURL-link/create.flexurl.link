import { NextRequest, NextResponse } from 'next/server';
import { createLink } from '@/lib/actions';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': 'https://flexurl.link',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { url, customId, expiresAt } = body;

        if (!url || typeof url !== 'string') {
            return NextResponse.json({ error: 'URL is required' }, { status: 400, headers: CORS_HEADERS });
        }

        const result = await createLink(url, customId, expiresAt);

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 400, headers: CORS_HEADERS });
        }

        return NextResponse.json(result, { headers: CORS_HEADERS });
    } catch (error) {
        console.error('Create API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: CORS_HEADERS });
    }
}
