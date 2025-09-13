import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import MapView from '../components/MapView';
import { isStateAvailable } from '../lib/indiaGeo';

export default function HomePage() {
  const [year, setYear] = useState(2020);
  const [state, setState] = useState('All');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (typeof window !== 'undefined' && localStorage.getItem('theme') === 'light' ? 'light' : 'dark'));
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(() => typeof window !== 'undefined' && !!localStorage.getItem('user_id'));
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for login/logout changes in localStorage
  useEffect(() => {
    function handleStorage() {
      setIsLoggedIn(!!localStorage.getItem('user_id'));
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <div
      className="min-h-screen relative overflow-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors"
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setParallax({ x, y });
      }}
    >
      {/* Background parallax layers */}
      <div className="absolute inset-0 -z-10 parallax">
        <div
          className="parallax-layer deep"
          style={{ transform: `translateZ(-2px) scale(1.2) translate(${parallax.x * 6}px, ${parallax.y * 6}px)` }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-200/40 via-white to-white dark:from-cyan-500/15 dark:via-slate-900 dark:to-slate-950" />
        </div>
        <div
          className="parallax-layer"
          style={{ transform: `translateZ(-1px) scale(1.12) translate(${parallax.x * 10}px, ${parallax.y * 10}px)` }}
        >
          <div className="water-bg" />
        </div>
        <div
          className="parallax-layer shallow"
          style={{ transform: `translateZ(-0.5px) scale(1.06) translate(${parallax.x * 14}px, ${parallax.y * 14}px)` }}
        >
          <div className="bubbles" aria-hidden />
        </div>
        {/* Decorative animated blobs */}
        <div className="absolute -top-10 -left-10 h-52 w-52 rounded-full bg-sky-400/20 dark:bg-sky-500/20 blob" />
        <div className="absolute bottom-10 -right-10 h-72 w-72 rounded-full bg-emerald-300/20 dark:bg-emerald-500/20 blob float-slower" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/40 border-b border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/cgwb_logo.png" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/logo.svg'}} className="h-8 w-8 rounded-full ring-1 ring-black/10 dark:ring-white/10 bg-white" alt="CGWB Logo" />
            <span className="font-semibold tracking-tight text-sky-700 dark:text-sky-300">HMPI Portal</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-700 dark:text-slate-200">
            <a className="hover:text-black dark:hover:text-white" href="#map">Map</a>
            <a className="hover:text-black dark:hover:text-white" href="#features">Features</a>
            <a className="hover:text-black dark:hover:text-white" href="#hmpi">HMPI</a>
            <a className="hover:text-black dark:hover:text-white" href="#resources">Resources</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="#soon" className="text-sm text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white">Docs</a>
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-md border border-black/10 dark:border-white/10 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10"
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            {isLoggedIn ? (
              <button
                type="button"
                className="rounded-lg bg-emerald-600 dark:bg-emerald-500 px-3 py-1.5 text-sm font-semibold shadow hover:bg-emerald-500 dark:hover:bg-emerald-400"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </button>
            ) : (
              <button
                type="button"
                className="rounded-lg bg-cyan-600 dark:bg-teal-500 px-3 py-1.5 text-sm font-semibold shadow hover:bg-cyan-500 dark:hover:bg-teal-400"
                onClick={() => navigate('/auth')}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        {/* Animated hero waves background */}
        <div className="hero-waves -z-[5]">
          <svg className="wave-top" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 V60 Q300,120 600,60 T1200,60 V0z" fill="currentColor" className="text-cyan-300/40 dark:text-cyan-400/30" />
          </svg>
          <svg className="wave-mid" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 V60 Q300,100 600,60 T1200,60 V0z" fill="currentColor" className="text-cyan-400/40 dark:text-teal-400/30" />
          </svg>
          <svg className="wave-bot" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 V60 Q300,80 600,60 T1200,60 V0z" fill="currentColor" className="text-teal-500/40 dark:text-cyan-700/30" />
          </svg>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-20 md:py-28 relative">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="reveal-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-3 py-1 text-xs text-slate-700 dark:text-slate-200">
                <span className="inline-block h-2 w-2 rounded-full bg-sky-500 dark:bg-sky-400 animate-pulse" />
                Pilot for India groundwater HMPI
              </div>
              <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
                Assess Heavy Metals in Groundwater with Confidence
              </h1>
              <p className="mt-5 text-slate-700 dark:text-slate-300 md:text-lg max-w-prose">
                A modern, automated HMPI platform to compute indices, visualize trends, and generate decision-ready reports — reducing manual work and errors.
              </p>
              <div className="mt-8 flex gap-4 flex-wrap">
                <a href="/hmpi" className="rounded-xl bg-cyan-600 dark:bg-teal-500 px-5 py-3 text-sm font-semibold shadow-lg hover:bg-cyan-500 dark:hover:bg-teal-400 transition shimmer">Try HMPI Calculator</a>
                <a href="#features" className="rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-black/10 dark:hover:bg-white/10 transition">Explore Features</a>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-6 text-center text-slate-700 dark:text-slate-300">
                <Stat label="Indices" value="9+" />
                <Stat label="Stations" value="10k+" />
                <Stat label="Years" value="2000–2025" />
              </div>
            </div>
            <div className="relative reveal-up reveal-delay-2">
              <div className="glassy-card p-6 transform-gpu transition-transform hover:-rotate-1 hover:scale-[1.01]">
                <div className="aspect-[16/10] w-full rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-slate-100/60 dark:bg-slate-900/60">
                  {/* Placeholder video/animation */}
                  <div className="relative h-full w-full">
                    <div className="absolute inset-0 animate-slow-pan bg-[url('/191002_groundwater.jpg')] bg-cover bg-center opacity-70" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-white via-transparent to-sky-200/40 dark:from-slate-950 dark:to-sky-900/20" />
                    <div className="absolute bottom-0 left-0 p-4">
                      <div className="rounded-lg bg-white/70 dark:bg-slate-950/60 px-3 py-2 text-xs border border-black/10 dark:border-white/10 text-slate-800 dark:text-slate-200">
                        Demo visualization preview
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">Animated water backdrop with a preview of upcoming analytics.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* India Map + Controls */}
  <section id="map" className="relative border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex items-end justify-between gap-6 flex-wrap reveal-up">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">India Heavy Metals Overview</h2>
              <p className="mt-2 text-slate-700 dark:text-slate-300 max-w-prose">Interactive map with yearly slider and state selector. Data overlays coming soon.</p>
            </div>
            <div className="glassy-card flex items-center gap-4 p-4">
              <div className="min-w-[220px]">
                <label className="text-xs text-slate-500 dark:text-slate-400">Year</label>
                <input
                  type="range"
                  min={2000}
                  max={2025}
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full accent-sky-500"
                />
                <div className="text-sm text-slate-800 dark:text-slate-200 mt-1">{year}</div>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="mt-1 w-56 rounded-lg border border-black/10 dark:border-white/15 bg-white/70 dark:bg-slate-900/60 px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                >
                  <option value="All">All States</option>
                  {states.filter(isStateAvailable).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-slate-100/60 dark:bg-slate-900/60 min-h-[380px] reveal-up">
              <div className="h-[380px] md:h-[480px] w-full">
                {/* Satellite map */}
                {/* eslint-disable-next-line @typescript-eslint/consistent-type-imports */}
                {/* dynamic import not required, component is client-side */}
                <MapView selectedState={state === 'All' ? undefined : state} />
              </div>
            </div>
            <div className="glassy-card p-5 reveal-up reveal-delay-1">
              <h3 className="font-semibold">Selected: {state}</h3>
              <p className="mt-1 text-slate-700 dark:text-slate-300 text-sm">UP specific page with detailed plots, animations, and per-metal analysis will be available soon.</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li>• Metals: As, Pb, Cd, Cr, Hg, Ni</li>
                <li>• Trends: Seasonal and yearly</li>
                <li>• Sources: Industrial, agricultural, natural</li>
              </ul>
              <div className="mt-4 flex gap-3">
                {state === 'All' ? (
                  <a href="/states" className="inline-block text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 text-sm">Browse All States →</a>
                ) : (
                  <>
                    <a href={`/states?q=${encodeURIComponent(state)}`} className="inline-block text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 text-sm">Open {state} →</a>
                    <a href="/states" className="inline-block text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 text-sm">Browse All States →</a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">What you can do</h2>
          <p className="mt-2 text-slate-700 dark:text-slate-300 max-w-prose">We are building a full-stack HMPI workflow. These modules will roll out soon.</p>

          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className={`reveal-up ${i%3===1 ? 'reveal-delay-1': i%3===2 ? 'reveal-delay-2' : ''}`}>
                <FeatureCard {...f} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HMPI CTA */}
      <section id="hmpi" className="relative border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="glassy-card p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 reveal-up">
            <div>
              <h3 className="text-2xl font-bold">HMPI Index Calculator</h3>
              <p className="mt-2 text-slate-700 dark:text-slate-300 max-w-prose">Enter metal concentrations and get instant indices with an AI-powered interpretation. Full module coming soon.</p>
            </div>
            <a href="/hmpi" className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold shadow-lg hover:bg-emerald-500">Open Calculator</a>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section id="resources" className="relative border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="reveal-up"><ResourceCard title="Dataset Download" desc="Open datasets with geo-coordinates, schemas, and quality flags." cta="Browse Datasets" /></div>
            <div className="reveal-up reveal-delay-1"><ResourceCard title="Report Generation" desc="Export PDF and CSV reports with charts and summaries." cta="Generate Reports" /></div>
            <div className="reveal-up reveal-delay-2"><ResourceCard title="Scholar Lookup" desc="Search journal papers via Google Scholar API integration." cta="Search Papers" href="/scholar-lookup" /></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-10 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/cgwb_logo.png" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/logo.svg'}} className="h-6 w-6 rounded-full ring-1 ring-black/10 dark:ring-white/10 bg-white" alt="CGWB Logo" />
            <span className="text-sm text-slate-600 dark:text-slate-300">HMPI Portal • Research Preview</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} Environmental Analytics Lab</div>
        </div>
      </footer>
    </div>
  );
}

function Stat(props: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4">
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{props.value}</div>
      <div className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400">{props.label}</div>
    </div>
  );
}

function FeatureCard({ title, desc, tag }: { title: string; desc: string; tag: string }) {
  return (
    <div className="group rounded-2xl border border-black/10 dark:border-white/10 bg-gradient-to-br from-slate-100/70 to-white/60 dark:from-slate-900/70 dark:to-slate-900/40 p-5 hover:border-sky-500/40 transition relative overflow-hidden">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-400/10 dark:bg-sky-500/10 blur-2xl group-hover:bg-sky-400/20 transition" />
      <div className="text-[10px] uppercase tracking-wider text-sky-700/90 dark:text-sky-300/90 font-semibold">{tag}</div>
      <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{desc}</p>
    </div>
  );
}

function ResourceCard({ title, desc, cta, href }: { title: string; desc: string; cta: string; href?: string }) {
  return (
    <div className="glassy-card p-6 flex flex-col justify-between">
      <div>
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h4>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{desc}</p>
      </div>
      <a href={href || '#soon'} className="mt-6 inline-block text-sky-700 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 text-sm">{cta} →</a>
    </div>
  );
}

const features = [
  { title: 'Automated HMPI Computation', desc: 'Compute indices using standard methodologies automatically.', tag: 'Engine' },
  { title: 'Geo-enabled Datasets', desc: 'Integrate concentration data with coordinates for mapping.', tag: 'Data' },
  { title: 'Quality Categorization', desc: 'Categorize water quality based on heavy metal presence.', tag: 'Insights' },
  { title: 'UP-specific Analytics', desc: 'Dedicated page with plots and metal-wise animations.', tag: 'State View' },
  { title: 'AI-powered Analysis', desc: 'Explain results and trends in plain language.', tag: 'AI' },
  { title: 'Map Allocation Bots', desc: 'Track contaminated sites and suggested interventions.', tag: 'Automation' },
];

const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
];
