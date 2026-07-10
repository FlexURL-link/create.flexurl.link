import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
    try {
        const result = await sql`
            DELETE FROM redirects
            WHERE expires_at IS NOT NULL AND expires_at < NOW()
        `;
        return NextResponse.json({ deleted: result.rowCount });
    } catch (error) {
        console.error('Cleanup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
