import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Paper {
  title: string;
  authors: string;
  snippet: string;
  link?: string;
  bestLink?: string;
}

const ScholarLookup: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (typeof window !== 'undefined' && localStorage.getItem('theme') === 'light' ? 'light' : 'dark'));
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  function toEmbeddable(url: string | null): string | null {
    if (!url) return null;
    try {
      const u = new URL(url);
      // arXiv: use PDF directly or proxy
      if (u.hostname.endsWith('arxiv.org')) {
        if (u.pathname.endsWith('.pdf')) return url;
        // Convert /abs/xxxx to /pdf/xxxx.pdf
        const m = u.pathname.match(/\/abs\/(.+)$/);
        if (m) return `https://arxiv.org/pdf/${m[1]}.pdf`;
      }
      // Proxy allowed hosts for PDF to improve embeddability
      if (['arxiv.org', 'export.arxiv.org', 'core.ac.uk'].some((h) => u.hostname.endsWith(h))) {
        return `/api/proxy-pdf?url=${encodeURIComponent(url)}`;
      }
      // Default: attempt direct, may get blocked
      return url;
    } catch {
      return url;
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setError(null);
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) throw new Error('Request failed');
      const data = await response.json();
  const papers: Paper[] = Array.isArray(data.papers) ? data.papers : [];
  setResults(papers);
  const first = papers[0];
  const raw = first?.bestLink || first?.link || null;
  setSelectedUrl(raw);
  setEmbedUrl(toEmbeddable(raw));
    } catch (error) {
      console.error('Error fetching search results:', error);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors">
      <div className="absolute inset-0 -z-10 parallax">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-200/40 via-white to-white dark:from-cyan-500/15 dark:via-slate-900 dark:to-slate-950" />
      </div>

      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/40 border-b border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/cgwb_logo.png" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/logo.svg'}} className="h-8 w-8 rounded-full ring-1 ring-black/10 dark:ring-white/10 bg-white" alt="CGWB Logo" />
            <span className="font-semibold tracking-tight text-sky-700 dark:text-sky-300">Scholar Lookup</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-md border border-black/10 dark:border-white/10 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10"
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-4">
          <div className="flex flex-wrap gap-2 text-xs">
            <Link to="/" className="rounded-full bg-sky-600 text-white px-3 py-1.5 font-semibold shadow hover:bg-sky-500">← Back to Home</Link>
            <a href="/#resources" className="rounded-full border border-black/10 dark:border-white/10 px-3 py-1.5 text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10">Dataset Download</a>
            <a href="/#resources" className="rounded-full border border-black/10 dark:border-white/10 px-3 py-1.5 text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10">Report Generation</a>
            <span className="rounded-full border border-sky-300/40 text-sky-700 dark:text-sky-300 px-3 py-1.5 bg-sky-50/60 dark:bg-sky-900/20">Scholar Lookup</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10">
        <section className="glassy-card p-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Google Scholar / arXiv..."
              className="flex-1 rounded-lg border border-black/10 dark:border-white/15 bg-white/70 dark:bg-slate-900/60 px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
            />
            <button type="submit" className="rounded-lg bg-cyan-600 dark:bg-teal-500 px-4 py-2 text-sm font-semibold shadow hover:bg-cyan-500 dark:hover:bg-teal-400 disabled:opacity-50" disabled={loading || !query.trim()}>
              {loading ? 'Searching…' : 'Search'}
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </section>

        <section className="mt-8 grid md:grid-cols-2 gap-6 items-start">
          <div>
            {loading ? (
              <div className="grid gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-black/10 dark:border-white/10 bg-slate-100/60 dark:bg-slate-900/60 p-4 animate-pulse h-24" />
                ))}
              </div>
            ) : results.length === 0 && !error ? (
              <div className="text-center text-slate-600 dark:text-slate-400">Start by searching for papers above.</div>
            ) : (
              <div className="grid gap-4">
                {results.map((r, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const raw = r.bestLink || r.link || null;
                      setSelectedUrl(raw);
                      setEmbedUrl(toEmbeddable(raw));
                    }}
                    className={`text-left group rounded-2xl border border-black/10 dark:border-white/10 bg-gradient-to-br from-slate-100/70 to-white/60 dark:from-slate-900/70 dark:to-slate-900/40 p-5 hover:border-sky-500/40 transition block ${selectedUrl === (r.bestLink || r.link) ? 'ring-2 ring-sky-400/60' : ''}`}
                  >
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-300">{r.title}</h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{r.authors}</p>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{r.snippet}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-slate-100/60 dark:bg-slate-900/60 min-h-[60vh]">
            {!selectedUrl ? (
              <div className="h-full w-full flex items-center justify-center text-slate-600 dark:text-slate-400 p-6 text-center">
                Select a paper on the left to preview here.
              </div>
            ) : (
              <div className="flex flex-col h-[60vh]">
                <div className="flex items-center justify-between px-3 py-2 border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 text-xs">
                  <div className="truncate text-slate-600 dark:text-slate-400">{selectedUrl}</div>
                  <div className="flex gap-2">
                    <a href={selectedUrl || undefined} target="_blank" rel="noreferrer" className="rounded border border-black/10 dark:border-white/10 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">Open</a>
                    <button onClick={() => { if (selectedUrl) navigator.clipboard.writeText(selectedUrl); }} className="rounded border border-black/10 dark:border-white/10 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">Copy Link</button>
                  </div>
                </div>
                {embedUrl ? (
                  <iframe title="paper-preview" src={embedUrl} className="w-full flex-1 bg-white" />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-600 dark:text-slate-400 p-6 text-center">
                    This source does not allow embedding. Use Open instead.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ScholarLookup;
