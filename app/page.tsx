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
const IconLink = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
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
    <section className="create-hero">
      <div className="hero-bg" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="grid-overlay" />
      </div>

      <div className="create-card">
        <div className="card-header">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Privacy first
          </span>
          <h1 className="card-title">
            Create a<br />
            <span className="gradient-text">short link</span>
          </h1>
          <p className="card-subtitle">Paste your URL. No account needed.</p>
        </div>

        {result ? (
          <div className="result-section">
            <div className="result-success">
              <IconCheck /> Link created!
            </div>
            <div className="input-group result-input">
              <span className="input-group-prefix">flexurl.link/</span>
              <input type="text" value={result.slug} readOnly style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', textAlign: 'center' }} />
            </div>
            {expiresAt && (
              <p className="result-expires">
                Expires on {new Date(expiresAt).toLocaleDateString()}
              </p>
            )}
            <div className="result-actions">
              <button onClick={copyToClipboard} className="btn btn-primary" type="button">
                {copied ? <><IconCheck /> Copied</> : <><IconCopy /> Copy link</>}
              </button>
              <button onClick={() => setResult(null)} className="btn btn-soft" type="button">
                Create another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="create-form">
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
              <label className="form-label" htmlFor="slug">
                Custom slug <span className="form-hint">(optional)</span>
              </label>
              <div className="input-group">
                <span className="input-group-prefix">flexurl.link/</span>
                <input
                  id="slug"
                  type="text"
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value)}
                  placeholder="my-slug"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="expires">
                Expiration date <span className="form-hint">(optional)</span>
              </label>
              <input
                id="expires"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-gradient btn-lg btn-block">
              {loading ? <><span className="spinner" /> Creating...</> : <><IconLink /> Create short link</>}
            </button>
          </form>
        )}

        <div className="card-trust">
          <div className="trust-item"><IconCheck /> No account</div>
          <div className="trust-item"><IconCheck /> No tracking</div>
          <div className="trust-item"><IconCheck /> Encrypted</div>
        </div>

        <a href="https://flexurl.link" target="_blank" rel="noreferrer" className="card-footer-link">
          <IconShield /> Powered by <strong>FlexURL</strong>
        </a>
      </div>

      <style jsx>{`
        .create-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.25rem;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          animation: blob 18s ease-in-out infinite;
        }

        .blob-1 {
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, transparent 70%);
          top: -120px;
          left: -120px;
        }

        .blob-2 {
          width: 520px;
          height: 520px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.32) 0%, transparent 70%);
          bottom: -160px;
          right: -160px;
          animation-delay: -6s;
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(10, 10, 10, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(10, 10, 10, 0.04) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 75%);
        }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }

        .create-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 480px;
          background: var(--bg-surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-xl);
          box-shadow: 0 30px 80px rgba(10, 10, 10, 0.10), 0 8px 20px rgba(10, 10, 10, 0.05);
          padding: 2.5rem 2rem;
          animation: scaleIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        .card-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--brand);
          background: var(--brand-soft);
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-full);
          border: 1px solid rgba(79, 70, 229, 0.14);
          margin-bottom: 1.25rem;
        }

        .eyebrow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brand);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.18);
        }

        .card-title {
          font-size: 2rem;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.035em;
          margin-bottom: 0.6rem;
        }

        .gradient-text {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .card-subtitle {
          font-size: 1rem;
          color: var(--text-muted);
        }

        .create-form {
          display: flex;
          flex-direction: column;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          margin-bottom: 1rem;
        }

        .form-label {
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .form-hint {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 400;
        }

        .input-group {
          display: flex;
          align-items: stretch;
          border: 1px solid var(--line);
          border-radius: var(--radius-sm);
          background: #fff;
          overflow: hidden;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .input-group:focus-within {
          border-color: var(--brand-light);
          box-shadow: 0 0 0 4px var(--brand-soft);
        }

        .input-group-prefix {
          display: flex;
          align-items: center;
          padding: 0 0.85rem;
          background: var(--bg-soft);
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 500;
          border-right: 1px solid var(--line);
          white-space: nowrap;
        }

        .input-group input {
          border: 0;
          border-radius: 0;
          padding: 0.78rem 0.95rem;
          background: transparent;
        }

        .input-group input:focus { box-shadow: none; }

        .alert {
          display: flex;
          align-items: flex-start;
          gap: 0.7rem;
          padding: 0.85rem 1rem;
          border-radius: var(--radius);
          border: 1px solid;
          font-size: 0.88rem;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .alert-error {
          background: var(--danger-soft);
          color: #991b1b;
          border-color: rgba(220, 38, 38, 0.2);
        }

        .btn-block { width: 100%; }
        .btn-lg { padding: 0.95rem 1.7rem; font-size: 1rem; }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Result */
        .result-section {
          text-align: center;
        }

        .result-success {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1rem;
          background: var(--success-soft);
          color: #065f46;
          border: 1px solid rgba(5, 150, 105, 0.2);
          border-radius: var(--radius);
          font-size: 0.88rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
        }

        .result-input {
          margin-bottom: 0.75rem;
        }

        .result-expires {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .result-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        /* Trust */
        .card-trust {
          display: flex;
          justify-content: center;
          gap: 1.25rem;
          margin-top: 1.75rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--line);
        }

        .trust-item {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--text-muted);
          font-size: 0.82rem;
          font-weight: 500;
        }

        .trust-item :global(svg) {
          color: var(--success);
        }

        /* Footer link */
        .card-footer-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-top: 1.25rem;
          font-size: 0.82rem;
          color: var(--text-faint);
          transition: color 0.18s ease;
        }

        .card-footer-link:hover {
          color: var(--brand);
        }

        .card-footer-link strong {
          color: var(--brand);
          font-weight: 700;
        }
      `}</style>
    </section>
  );
}
