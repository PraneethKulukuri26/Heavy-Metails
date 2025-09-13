import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import StateThumb from '../components/StateThumb';

function deslugify(slug: string) {
  const name = slug.replace(/-/g, ' ');
  return name.replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function StateDetail() {
  const params = useParams();
  const slug = params.slug || '';
  const displayName = useMemo(() => deslugify(slug), [slug]);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/40 border-b border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/states" className="rounded-md border border-black/10 dark:border-white/10 px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10">← All States</Link>
            <span className="font-semibold tracking-tight">{displayName}</span>
          </div>
          <Link to="/" className="text-xs text-sky-700 dark:text-sky-400">Home</Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 p-8 text-center">
          <div className="mx-auto max-w-xl">
            <StateThumb name={displayName} className="w-full h-auto" />
          </div>
          <h1 className="mt-6 text-2xl font-bold">{displayName}</h1>
          <p className="mt-2 text-slate-700 dark:text-slate-300">Detailed analytics for this state will appear here soon.</p>
          <div className="mt-6">
            <Link to="/hmpi" className="inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500">Open HMPI Calculator</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
