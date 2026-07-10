'use client';

import { useState } from 'react';
import { nanoid } from 'nanoid';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const IconShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

export default function CreatePage() {
  const [url, setUrl] = useState('');
  const [customId, setCustomId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ id: string; slug: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, customId: customId || undefined, expiresAt: expiresAt || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
      } else {
        setResult({ id: data.id, slug: data.slug });
        setUrl('');
        setCustomId('');
        setExpiresAt('');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(`https://flexurl.link/${result.slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Copy failed');
    }
  };

  return (
    <article className="card" style={{ maxWidth: 480, width: '100%', padding: '2.5rem 2rem' }}>
      <h2 className="gradient-text" style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '0.4rem' }}>
        Create a short link
      </h2>
      <p style={{ textAlign: 'center', marginBottom: '1.75rem', fontSize: '0.92rem' }}>
        Paste your long URL below. No account needed.
      </p>

      {result ? (
        <div style={{ textAlign: 'center' }}>
          <div className="alert alert-success" style={{ marginBottom: '1.25rem', justifyContent: 'center' }}>
            <IconCheck /> Link created!
          </div>
          <div className="input-group" style={{ marginBottom: '0.75rem' }}>
            <span className="input-group-prefix" style={{ fontSize: '0.85rem' }}>flexurl.link/</span>
            <input type="text" value={result.slug} readOnly style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', textAlign: 'center' }} />
          </div>
          {expiresAt && (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Expires on {new Date(expiresAt).toLocaleDateString()}
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button onClick={copyToClipboard} className="btn btn-primary" type="button">
              {copied ? <><IconCheck /> Copied</> : <><IconCopy /> Copy link</>}
            </button>
            <button onClick={() => setResult(null)} className="btn btn-soft" type="button">
              Create another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="url">Destination URL</label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://example.com/my-long-url"
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="slug">Custom slug <span className="form-hint">(optional)</span></label>
            <div className="input-group">
              <span className="input-group-prefix">flexurl.link/</span>
              <input
                id="slug"
                type="text"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                placeholder="my-slug"
                maxLength={100}
                style={{ border: 0, boxShadow: 'none' }}
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="expires">Expiration date <span className="form-hint">(optional)</span></label>
            <input
              id="expires"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="alert alert-info" style={{ marginBottom: '1rem', fontSize: '0.82rem', alignItems: 'center' }}>
            <IconShield /> No tracking, no analytics, no account. Privacy first.
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-gradient btn-lg btn-block">
            {loading ? <><span className="spinner sm" /> Creating...</> : 'Create short link'}
          </button>
        </form>
      )}

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--text-faint)' }}>
        Powered by <a href="https://flexurl.link" target="_blank" rel="noreferrer" style={{ fontWeight: 700, color: 'var(--brand)' }}>FlexURL</a>
      </p>
    </article>
  );
}
