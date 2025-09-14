import { useEffect, useMemo, useState } from 'react';

import { MetalKey, metalLabels, standardsMgL, computeHPI, categorizeHPI, formatNumber, computeHEI, computeCI } from '../lib/hmpi';
import { renderSimpleMarkdown } from '../lib/markdown';

type Row = { key: MetalKey; value: string };

export default function HMPIPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (typeof window !== 'undefined' && localStorage.getItem('theme') === 'light' ? 'light' : 'dark'));

  const [rows, setRows] = useState<Row[]>(() => (Object.keys(standardsMgL) as MetalKey[]).map(k => ({ key: k, value: '' })));
  const numericInputs = useMemo(() => Object.fromEntries(rows.map(r => [r.key, parseFloat(r.value) || 0])) as Record<MetalKey, number>, [rows]);
  const { hpi, details } = useMemo(() => computeHPI(numericInputs), [numericInputs]);
  const { hei } = useMemo(() => computeHEI(numericInputs), [numericInputs]);
  const { ci } = useMemo(() => computeCI(numericInputs), [numericInputs]);
  const category = useMemo(() => categorizeHPI(hpi), [hpi]);

  // Find top contributors for better insights
  const topContributors = useMemo(() => {
    const sorted = details.sort((a, b) => b.contribution - a.contribution);
    return sorted.slice(0, 3).filter(d => d.contribution > 0);
  }, [details]);

  const resetInputs = () => {
    setRows((Object.keys(standardsMgL) as MetalKey[]).map(k => ({ key: k, value: '' })));
  };

  useEffect(() => {
    document.title = 'HMPI Calculator';
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/40 border-b border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/cgwb_logo.png" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/logo.svg'}} className="h-8 w-8 rounded-full ring-1 ring-black/10 dark:ring-white/10 bg-white" alt="CGWB Logo" />
            <span className="font-semibold tracking-tight text-cyan-700 dark:text-cyan-300">HMPI Calculator</span>
          </div>
          <a href="/" className="text-sm text-slate-600 dark:text-slate-300 hover:underline">← Home</a>
        </div>
      </header>
      <div className="absolute top-4 right-4">
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-md border border-black/10 dark:border-white/10 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10"
        >
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
      <section className="relative">
        <div className="hero-waves -z-[5]">
          <svg className="wave-top" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M0,0 V60 Q300,120 600,60 T1200,60 V0z" fill="currentColor" className="text-cyan-300/40 dark:text-cyan-400/30" /></svg>
          <svg className="wave-mid" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M0,0 V60 Q300,100 600,60 T1200,60 V0z" fill="currentColor" className="text-cyan-400/40 dark:text-teal-400/30" /></svg>
          <svg className="wave-bot" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M0,0 V60 Q300,80 600,60 T1200,60 V0z" fill="currentColor" className="text-teal-500/40 dark:text-cyan-700/30" /></svg>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="glassy-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold">Enter Heavy Metal Concentrations</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Units: mg/L • Metals: Cd, Cr, Cu, Pb, Mn, Ni, Fe, Zn</p>
                  </div>
                  <button
                    onClick={resetInputs}
                    className="rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 text-sm font-medium transition-colors"
                  >
                    Reset
                  </button>
                </div>
                <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(Object.keys(standardsMgL) as MetalKey[]).map((k) => (
                    <MetalInput
                      key={k}
                      metalKey={k}
                      value={rows.find(r => r.key===k)?.value ?? ''}
                      onChange={(value: string) => setRows((prev) => prev.map(r => r.key===k ? { ...r, value } : r))}
                    />
                  ))}
                </div>
              </div>

              <div className="glassy-card p-5">
                <h2 className="text-xl font-semibold">Breakdown</h2>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="py-2 pr-6">Metal</th>
                        <th className="py-2 pr-6">Mi</th>
                        <th className="py-2 pr-6">Si</th>
                        <th className="py-2 pr-6">Qi</th>
                        <th className="py-2">Contribution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.map((d) => (
                        <tr key={d.key} className="border-t border-black/5 dark:border-white/5">
                          <td className="py-2 pr-6">{metalLabels[d.key]}</td>
                          <td className="py-2 pr-6">{formatNumber(d.Mi)}</td>
                          <td className="py-2 pr-6">{formatNumber(d.Si)}</td>
                          <td className="py-2 pr-6">{formatNumber(d.Qi)}</td>
                          <td className="py-2">{formatNumber(d.contribution)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="glassy-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Water Quality Indices</h2>
                  {topContributors.length > 0 && (
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Top: {topContributors.map(c => metalLabels[c.key].split(' ')[0]).join(', ')}
                    </div>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <SummaryCard 
                    title="HPI" 
                    value={formatNumber(hpi,2)} 
                    tag={category.label} 
                    color={category.color}
                    tooltip="Heavy Metal Pollution Index: Weighted average of metal concentrations relative to standards" 
                  />
                  <SummaryCard 
                    title="HEI" 
                    value={formatNumber(hei,2)} 
                    tag={hei <= 10 ? 'Low' : hei <= 20 ? 'Medium' : 'High'} 
                    color={hei <= 10 ? '#22c55e' : hei <= 20 ? '#f59e0b' : '#ef4444'}
                    tooltip="Heavy Metal Evaluation Index: Sum of concentration-to-standard ratios"
                  />
                  <SummaryCard 
                    title="CI" 
                    value={formatNumber(ci,2)} 
                    tag={ci <= 1 ? 'Within limit' : 'Exceeds'} 
                    color={ci <= 1 ? '#22c55e' : '#ef4444'}
                    tooltip="Contamination Index: Maximum concentration-to-standard ratio among all metals"
                  />
                </div>
                <RadialGauge value={hpi} label={`HPI: ${category.label}`} color={category.color} />
              </div>
              <AIInsights inputs={numericInputs} hpi={hpi} hei={hei} ci={ci} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetalInput({ metalKey, value, onChange }: { metalKey: MetalKey; value: string; onChange: (value: string) => void }) {
  const [focused, setFocused] = useState(false);
  const numValue = parseFloat(value) || 0;
  const standard = standardsMgL[metalKey];
  const ratio = numValue / standard;
  const isExceeded = ratio > 1;

  return (
    <div className={`p-4 rounded-xl border transition-colors ${
      focused 
        ? 'border-cyan-500/50 bg-cyan-50/50 dark:bg-cyan-950/20' 
        : isExceeded 
          ? 'border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/20'
          : 'border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{metalLabels[metalKey]}</div>
        {isExceeded && numValue > 0 && (
          <span className="text-xs font-medium text-red-600 dark:text-red-400">
            {ratio.toFixed(1)}× limit
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          step="0.0001"
          min="0"
          placeholder="0.000"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
        />
        <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
          ≤{standard} mg/L
        </div>
      </div>
    </div>
  );
}

function RadialGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const cappedValue = Math.min(value, 120);
  const progress = (cappedValue / 120) * 100;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="mt-6 flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-slate-200 dark:text-slate-700"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.1))'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {formatNumber(value, 1)}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 text-center leading-tight">
            {label.split(':')[1]?.trim() || label}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span>0</span>
        <div className="w-16 h-1 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full" />
        <span>120+</span>
      </div>
    </div>
  );
}

function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div 
      className="relative cursor-help" 
      onMouseEnter={() => setVisible(true)} 
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs rounded-lg bg-slate-800 dark:bg-slate-900 px-3 py-2 text-sm text-white shadow-lg z-20">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-900" />
        </div>
      )}
    </div>
  );
}


function AIInsights({ inputs, hpi, hei, ci }: { inputs: Record<MetalKey, number>; hpi: number; hei: number; ci: number }) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  async function handleAsk() {
    setLoading(true);
    setText('');
  const prompt = `You are an environmental water quality expert. Inputs (mg/L, only Cd, Cr, Cu, Pb, Mn, Ni, Fe, Zn): ${JSON.stringify(inputs)}. Indices: HPI=${hpi.toFixed(2)}, HEI=${hei.toFixed(2)}, CI=${ci.toFixed(2)}.

Return a concise explanation in markdown with these exact headings:
# Summary (≤30 words)
# Likely Sources (3 bullets max)
# Health & Risk (≤40 words)
# Recommended Actions (3 bullets max)
Keep it specific to groundwater in India. Keep total length ≤120 words.`;
    try {
      const res = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
      if (!res.ok) throw new Error('Failed');
      const txt = await res.text();
      setText(txt);
    } catch (e) {
      setText('Could not generate AI insights.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="glassy-card p-5">
      <h2 className="text-xl font-semibold">AI Insights</h2>
      <button onClick={handleAsk} disabled={loading} className="mt-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-400 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 transition-colors">
        {loading ? 'Generating…' : 'Explain Sources & Fixes'}
      </button>
      <div className="mt-4 p-4 rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 min-h-[120px] text-sm prose prose-slate max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: text ? renderSimpleMarkdown(text) : '<p>Click the button to generate an explanation.</p>' }} />
    </div>
  );
}

function SummaryCard({ title, value, tag, color, tooltip }: { title: string; value: string; tag: string; color: string; tooltip?: string }) {
  const cardContent = (
    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
      <div className="flex flex-col items-start gap-1 min-w-0">
        <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{title}</div>
        <div className="text-2xl font-bold leading-none break-words">{value}</div>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-black/5 dark:bg-white/10 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          <span className="truncate max-w-full">{tag}</span>
        </span>
      </div>
    </div>
  );

  if (tooltip) {
    return <Tooltip content={tooltip}>{cardContent}</Tooltip>;
  }

  return cardContent;
}
