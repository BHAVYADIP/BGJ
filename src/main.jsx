import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function checkEmail(event) {
    event.preventDefault();
    setError('');
    setResult(null);
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/breach-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to complete the check.');
      setResult(data);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="eyebrow">BGJ • CYBER CHAUKIDAAR</div>
        <h1>Know if your email<br /><span>has been exposed.</span></h1>
        <p>Check breach exposure through a legitimate intelligence provider. BGJ does not host or distribute leaked datasets.</p>
        <form onSubmit={checkEmail} className="search-card">
          <label htmlFor="email">Email address</label>
          <div className="row">
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            <button disabled={loading}>{loading ? 'Checking…' : 'Check exposure'}</button>
          </div>
          {error && <div className="error">{error}</div>}
        </form>
      </section>

      {result && (
        <section className="results">
          <div className={result.found ? 'status danger' : 'status safe'}>
            <div className="status-dot" />
            <div>
              <strong>{result.found ? 'Exposure found' : 'No exposure found'}</strong>
              <span>{result.found ? `${result.breaches.length} breach${result.breaches.length === 1 ? '' : 'es'} matched.` : 'No matching breach was returned by the provider.'}</span>
            </div>
          </div>
          {result.breaches?.map((breach) => (
            <article className="breach" key={breach.name}>
              <div><h2>{breach.title || breach.name}</h2><span>{breach.date || 'Date unavailable'}</span></div>
              <div className="chips">{(breach.dataClasses || []).map((item) => <span key={item}>{item}</span>)}</div>
            </article>
          ))}
          <small>Checked {new Date(result.checkedAt).toLocaleString()}</small>
        </section>
      )}

      <footer>BGJ Cyber Chaukidaar · Privacy-first exposure monitoring</footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
