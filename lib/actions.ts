'use server';

import { sql } from './db';
import { encrypt } from './encryption';
import { nanoid } from 'nanoid';

export async function createLink(url: string, customId?: string, expiresAt?: string) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return { error: 'URL must start with http:// or https://' };
    }

    if (customId && !/^[a-zA-Z0-9_-]+$/.test(customId)) {
        return { error: 'Custom slug can only contain letters, numbers, hyphens, and underscores.' };
    }

    if (customId && (customId.length < 2 || customId.length > 100)) {
        return { error: 'Custom slug must be between 2 and 100 characters.' };
    }

    const id = customId || nanoid(6);
    const encryptedUrl = encrypt(url);

    const expiresDate = expiresAt ? new Date(expiresAt).toISOString() : null;

    try {
        await sql`
            INSERT INTO redirects (id, url, version, expires_at)
            VALUES (${id}, ${encryptedUrl}, 'lite', ${expiresDate})
        `;
        return { success: true, id, slug: id };
    } catch (error: any) {
        if (error.code === '23505') {
            return { error: 'This slug is already taken. Try another one.' };
        }
        console.error('Create link error:', error);
        return { error: 'An error occurred. Please try again.' };
    }
}
