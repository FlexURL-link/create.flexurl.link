/// <reference types="@cloudflare/workers-types" />

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

    await db.sql`INSERT INTO redirects (id, url, expires_at) VALUES (${id}, ${encryptedUrl}, ${expiresAt || null})`.run();

    return c.json({ success: true, id, slug: id }, 201);
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint'))
      return c.json({ error: 'This slug is already taken. Try another one.' }, 400);
    console.error('Create error:', error);
    return c.json({ error: error.message || 'An error occurred' }, 500);
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

app.get('/favicon.ico', (c) => c.notFound());

app.get('*', (c) => {
  return c.html(LANDING_PAGE);
});

const LANDING_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FlexURL Create</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Manrope:wght@500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #f7f7f5; color: #0a0a0a;
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 2rem 1.25rem;
  }
  .card {
    width: 100%; max-width: 480px;
    background: #fff; border: 1px solid #e7e5e0; border-radius: 28px;
    box-shadow: 0 30px 80px rgba(10,10,10,0.10), 0 8px 20px rgba(10,10,10,0.05);
    padding: 2.5rem 2rem;
    animation: scaleIn 0.45s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }
  .card-header { text-align: center; margin-bottom: 2rem; }
  .card-title { font-size: 2rem; font-weight: 800; letter-spacing: -0.035em; margin-bottom: 0.6rem; }
  .gradient-text {
    background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .card-subtitle { font-size: 1rem; color: #71717a; }
  .form-field { margin-bottom: 1rem; }
  .form-field label { display: block; font-size: 0.84rem; font-weight: 600; color: #3f3f46; margin-bottom: 0.45rem; }
  .form-hint { font-size: 0.8rem; color: #a1a1aa; font-weight: 400; }
  input, select {
    width: 100%; padding: 0.78rem 0.95rem;
    border: 1px solid #e7e5e0; border-radius: 10px;
    background: #fff; font-size: 0.95rem; font-family: inherit;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
    outline: none;
  }
  input:focus { border-color: #818cf8; box-shadow: 0 0 0 4px #eef2ff; }
  .input-group { display: flex; border: 1px solid #e7e5e0; border-radius: 10px; overflow: hidden; }
  .input-group:focus-within { border-color: #818cf8; box-shadow: 0 0 0 4px #eef2ff; }
  .input-group-prefix {
    display: flex; align-items: center; padding: 0 0.85rem;
    background: #f4f4f2; color: #71717a; font-size: 0.9rem;
    border-right: 1px solid #e7e5e0; white-space: nowrap;
  }
  .input-group input { border: 0; border-radius: 0; }
  .input-group input:focus { box-shadow: none; }
  .alert { padding: 0.85rem 1rem; border-radius: 14px; font-size: 0.88rem; margin-bottom: 1rem; }
  .alert-error { background: #fef2f2; color: #991b1b; border: 1px solid rgba(220,38,38,0.2); }
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
    border: 1px solid #e7e5e0; border-radius: 999px; font-weight: 600;
    font-size: 0.94rem; padding: 0.7rem 1.3rem;
    transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
    cursor: pointer; font-family: inherit;
  }
  .btn:hover { transform: translateY(-1px); }
  .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .btn-gradient {
    background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
    border-color: transparent; color: #fff;
    box-shadow: 0 8px 20px rgba(139,92,246,0.28);
  }
  .btn-gradient:hover { box-shadow: 0 12px 28px rgba(139,92,246,0.35); }
  .btn-block { width: 100%; }
  .btn-lg { padding: 0.95rem 1.7rem; font-size: 1rem; }
  .btn-soft { background: #f4f4f2; border-color: #e7e5e0; color: #3f3f46; }
  .btn-soft:hover { background: #ebebe7; color: #0a0a0a; }
  .result-section { text-align: center; }
  .result-success {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.65rem 1rem; background: #ecfdf5; color: #065f46;
    border: 1px solid rgba(5,150,105,0.2); border-radius: 14px;
    font-size: 0.88rem; font-weight: 600; margin-bottom: 1.25rem;
  }
  .result-actions { display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem; }
  .footer-link {
    display: block; text-align: center; margin-top: 1.25rem;
    font-size: 0.82rem; color: #a1a1aa; text-decoration: none;
  }
  .footer-link:hover { color: #4f46e5; }
  .spinner {
    width: 18px; height: 18px;
    border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #fff;
    border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block;
  }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
</head>
<body>
<div class="card">
  <div class="card-header">
    <h1 class="card-title">Create a<br><span class="gradient-text">short link</span></h1>
    <p class="card-subtitle">Paste your URL. No account needed.</p>
  </div>

  <div id="result" style="display:none" class="result-section">
    <div class="result-success">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
      Link created!
    </div>
    <div class="input-group">
      <span class="input-group-prefix">flexurl.link/</span>
      <input type="text" id="resultSlug" readonly style="font-weight:700;text-align:center;font-family:monospace">
    </div>
    <div class="result-actions">
      <button class="btn btn-primary btn-block" onclick="copyLink()" id="copyBtn">Copy link</button>
      <button class="btn btn-soft btn-block" onclick="resetForm()">Create another</button>
    </div>
  </div>

  <form id="createForm" onsubmit="handleSubmit(event)">
    <div class="form-field">
      <label for="url">Destination URL</label>
      <input id="url" type="url" required placeholder="https://example.com/my-long-url">
    </div>
    <div class="form-field">
      <label>Custom slug <span class="form-hint">(optional)</span></label>
      <div class="input-group">
        <span class="input-group-prefix">flexurl.link/</span>
        <input id="slug" type="text" placeholder="my-slug" maxlength="100">
      </div>
    </div>
    <div class="form-field">
      <label>Expiration date <span class="form-hint">(optional)</span></label>
      <input id="expires" type="date" min="2026-07-29">
    </div>
    <div id="errorMsg" class="alert alert-error" style="display:none"></div>
    <button type="submit" class="btn btn-gradient btn-lg btn-block" id="submitBtn">
      Create short link
    </button>
  </form>

  <a href="https://flexurl.link" target="_blank" rel="noreferrer" class="footer-link">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    Powered by <strong>FlexURL</strong>
  </a>
</div>

<script>
async function handleSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const err = document.getElementById('errorMsg');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Creating...';
  err.style.display = 'none';

  try {
    const res = await fetch('/api/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: document.getElementById('url').value,
        customId: document.getElementById('slug').value || undefined,
        expiresAt: document.getElementById('expires').value || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) { err.textContent = data.error; err.style.display = 'block'; return; }
    document.getElementById('resultSlug').value = data.slug;
    document.getElementById('createForm').style.display = 'none';
    document.getElementById('result').style.display = 'block';
  } catch { err.textContent = 'Network error. Please try again.'; err.style.display = 'block'; }
  finally { btn.disabled = false; btn.innerHTML = 'Create short link'; }
}

async function copyLink() {
  const slug = document.getElementById('resultSlug').value;
  try {
    await navigator.clipboard.writeText('https://flexurl.link/' + slug);
    document.getElementById('copyBtn').textContent = 'Copied!';
    setTimeout(() => document.getElementById('copyBtn').textContent = 'Copy link', 2000);
  } catch { alert('Copy failed'); }
}

function resetForm() {
  document.getElementById('createForm').style.display = 'block';
  document.getElementById('result').style.display = 'none';
  document.getElementById('url').value = '';
  document.getElementById('slug').value = '';
  document.getElementById('expires').value = '';
}
document.getElementById('expires').min = new Date().toISOString().split('T')[0];
</script>
</body>
</html>`;

export default app;
