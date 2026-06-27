import { NextRequest, NextResponse } from 'next/server';
import { createLink } from '@/lib/actions';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { url, customId, expiresAt } = body;

        if (!url || typeof url !== 'string') {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const result = await createLink(url, customId, expiresAt);

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Create API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
