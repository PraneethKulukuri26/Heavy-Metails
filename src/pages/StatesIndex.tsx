import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import StateThumb from '../components/StateThumb';
import { isStateAvailable } from '../lib/indiaGeo';

type Theme = 'light' | 'dark';

const ALL_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
];

function slugify(name: string) {
  return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export default function StatesIndex() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [theme, setTheme] = useState<Theme>(() => (typeof window !== 'undefined' && localStorage.getItem('theme') === 'light' ? 'light' : 'dark'));
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = ALL_STATES.filter(isStateAvailable);
    if (!q) return base;
    return base.filter((s) => s.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/40 border-b border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="rounded-md border border-black/10 dark:border-white/10 px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10">← Home</button>
            <span className="font-semibold tracking-tight">Browse States</span>
          </div>
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-md border border-black/10 dark:border-white/10 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10"
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="max-w-2xl">
          <label className="text-xs text-slate-600 dark:text-slate-400">Search states</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Start typing e.g. Uttar Pradesh"
            className="mt-1 w-full rounded-xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-slate-900/60 px-4 py-3 text-sm outline-none focus:ring-2 ring-sky-500/50"
          />
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((name) => {
            const slug = slugify(name);
            return (
              <a key={slug} href={`/states/${slug}`} className="group rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 shadow-sm hover:shadow-md transition">
                <div className="aspect-[4/3] w-full bg-slate-200/60 dark:bg-slate-800/60 relative">
                  <StateThumb name={name} className="absolute inset-0 h-full w-full p-2" />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{name}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Open details</div>
                  </div>
                  <div className="text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition">→</div>
                </div>
              </a>
            );
          })}
        </div>
      </main>
    </div>
  );
}
