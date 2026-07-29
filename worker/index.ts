import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { nanoid } from 'nanoid';
import { createDb } from './lib/db';
import { encrypt } from './lib/encryption';

export type Env = {
  DB: D1Database;
  ENCRYPTION_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use('/api/*', cors({
  origin: ['https://flexurl.link', 'https://create.flexurl.link'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
}));

app.post('/api/create', async (c) => {
  try {
    const { url, customId, expiresAt } = await c.req.json();

    if (!url || typeof url !== 'string')
      return c.json({ error: 'URL is required' }, 400);
    if (!url.startsWith('http://') && !url.startsWith('https://'))
      return c.json({ error: 'URL must start with http:// or https://' }, 400);
    if (customId && !/^[a-zA-Z0-9_-]+$/.test(customId))
      return c.json({ error: 'Custom slug can only contain letters, numbers, hyphens, and underscores.' }, 400);

    const id = customId || nanoid(6);
    const encryptedUrl = await encrypt(url, c.env.ENCRYPTION_KEY);
    const db = createDb(c.env);

    await db.sql`INSERT INTO redirects (id, url, version, expires_at) VALUES (${id}, ${encryptedUrl}, 'lite', ${expiresAt || null})`.run();

    return c.json({ success: true, id, slug: id }, 201);
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint'))
      return c.json({ error: 'This slug is already taken. Try another one.' }, 400);
    console.error('Create error:', error);
    return c.json({ error: 'An error occurred. Please try again.' }, 500);
  }
});

app.get('/api/cleanup', async (c) => {
  try {
    const db = createDb(c.env);
    const result = await db.sql`DELETE FROM redirects WHERE expires_at IS NOT NULL AND expires_at < datetime('now')`.run();
    return c.json({ deleted: result.meta.changes });
  } catch (error) {
    console.error('Cleanup error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('*', (c) => c.text('create.flexurl.link Worker'));

export default app;
