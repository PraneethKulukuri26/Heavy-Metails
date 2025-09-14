import { csvParse } from 'd3-dsv';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend,
  CartesianGrid,
  ComposedChart,
  Line,
} from 'recharts';

import { computeCI, computeHEI, computeHPI, standardsMgL, scaleStandards, type MetalKey, type Standards } from '../lib/hmpi';
import { renderSimpleMarkdown } from '../lib/markdown';

type Row = {
  State: string; District: string; Location: string; Longitude: string; Latitude: string;
  Cd: string; Cr: string; Cu: string; Pb: string; Mn: string; Ni: string; Fe: string; Zn: string;
};

const metalKeys: MetalKey[] = ['Cd','Cr','Cu','Pb','Mn','Ni','Fe','Zn'];
const requiredHeaders = ['State','District','Location','Longitude','Latitude', ...metalKeys] as const;

export default function ReportsPage() {
  const [text, setText] = useState<string>('');
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState<'mg/L' | 'µg/L'>('µg/L');
  const [profile, setProfile] = useState<'BIS (Acceptable)' | 'BIS (Permissible)' | 'WHO'>('BIS (Acceptable)');
  const reportRef = useRef<HTMLDivElement>(null);
  const [aiText, setAiText] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const toMg = 0.001; // µg/L -> mg/L
  const toDisplayFromMg = units === 'mg/L' ? 1 : 1000; // mg/L -> display

  const stdProfile: Standards = useMemo(() => {
    if (profile === 'BIS (Permissible)') return scaleStandards(standardsMgL, 2);
    if (profile === 'WHO') return scaleStandards(standardsMgL, 1);
    return standardsMgL;
  }, [profile]);

  function parseCSVString(input: string) {
    try {
      const parsed = csvParse(input);
      const headers = (parsed.columns || []) as string[];
      const missing = (requiredHeaders as readonly string[]).filter(h => !headers.includes(h));
      if (missing.length) throw new Error(`Missing headers: ${missing.join(', ')}`);
      setRows(parsed as unknown as Row[]);
      setError(null);
    } catch (e) {
      setRows([]);
      setError(e instanceof Error ? e.message : 'Failed to parse CSV');
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => parseCSVString(String(reader.result || ''));
    reader.readAsText(f);
  }

  function toNum(v: string) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : undefined;
  }

  // Compute indices per row (in mg/L), and build exportable dataset
  const computed = useMemo(() => {
    return rows.map((r) => {
      const inputsMg: Partial<Record<MetalKey, number>> = {};
      metalKeys.forEach(m => {
        const v = toNum(r[m]); // assume CSV in µg/L by default
        inputsMg[m] = v === undefined ? 0 : v * toMg;
      });
      const { hpi } = computeHPI(inputsMg, stdProfile);
      const { hei } = computeHEI(inputsMg, stdProfile);
      const { ci } = computeCI(inputsMg, stdProfile);
      return { ...r, HPI: hpi, HEI: hei, CI: ci };
    });
  }, [rows, stdProfile]);

  const avgMgByMetal = useMemo(() => {
    const agg: Record<MetalKey, { sum: number; n: number }> = { Cd:{sum:0,n:0}, Cr:{sum:0,n:0}, Cu:{sum:0,n:0}, Pb:{sum:0,n:0}, Mn:{sum:0,n:0}, Ni:{sum:0,n:0}, Fe:{sum:0,n:0}, Zn:{sum:0,n:0} };
    rows.forEach(r => {
      metalKeys.forEach(m => { const v = toNum(r[m]); if (v !== undefined) { agg[m].sum += v * toMg; agg[m].n += 1; } });
    });
    const out: Record<MetalKey, number> = { Cd:0,Cr:0,Cu:0,Pb:0,Mn:0,Ni:0,Fe:0,Zn:0 };
    metalKeys.forEach(m => { out[m] = agg[m].n ? agg[m].sum/agg[m].n : 0; });
    return out;
  }, [rows]);

  const barData = useMemo(() => metalKeys.map(m => ({
    key: m,
    value: avgMgByMetal[m] * toDisplayFromMg,
    standard: stdProfile[m] * toDisplayFromMg,
  })), [avgMgByMetal, stdProfile, toDisplayFromMg]);

  const { yMax, showStdLine } = useMemo(() => {
    const maxBar = barData.length ? Math.max(...barData.map(d => d.value)) : 0;
    const maxStd = barData.length ? Math.max(...barData.map(d => d.standard)) : 0;
    const yMax = maxBar > 0 ? maxBar * 1.2 : 1;
    const showStdLine = maxStd <= yMax * 1.5;
    return { yMax, showStdLine };
  }, [barData]);

  // Exceedance stats (mg/L basis)
  const exceedances = useMemo(() => {
    const counts: Record<MetalKey, number> = { Cd:0, Cr:0, Cu:0, Pb:0, Mn:0, Ni:0, Fe:0, Zn:0 };
    rows.forEach(r => {
      metalKeys.forEach(m => {
        const v = parseFloat(r[m]);
        if (Number.isFinite(v)) {
          const mg = v * toMg;
          if (stdProfile[m] > 0 && mg / stdProfile[m] > 1) counts[m] += 1;
        }
      });
    });
    const total = rows.length;
    const ranked = metalKeys
      .map(m => ({ key: m, count: counts[m], pct: total ? (counts[m] / total) * 100 : 0 }))
      .sort((a, b) => b.count - a.count);
    return { counts, ranked, total };
  }, [rows, stdProfile]);

  const generateAISummary = useCallback(async (): Promise<string | null> => {
    try {
      setAiLoading(true); setAiError(null);
      const meta = {
        rows: rows.length,
        units,
        profile,
        averages_mgL: avgMgByMetal,
        hpi_avg: average(computed.map(r => r.HPI)),
        hei_avg: average(computed.map(r => r.HEI)),
        ci_max: computed.length ? Math.max(...computed.map(r => r.CI)) : 0,
        exceedances: exceedances.ranked.slice(0, 8),
      };
      const prompt = `You are assisting with a professional groundwater heavy metals report.
Use the provided metrics to write a concise, executive-style narrative with:
- Executive Summary (3-5 sentences)
- Key Findings (bulleted, 4-6 bullets)
- Possible Sources & Considerations (2-4 bullets)
- Recommendations (3-5 bullets)

Avoid absolute claims—use cautious language. Do not fabricate numbers; refer qualitatively to trends. Keep it under 300 words.
Context JSON:\n${JSON.stringify(meta)}\n`;
      const res = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
      if (!res.ok) throw new Error('AI service failed');
      const txt = await res.text();
      setAiText(txt.trim());
      return txt.trim();
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Failed to generate AI summary');
      return null;
    } finally {
      setAiLoading(false);
    }
  }, [rows.length, units, profile, avgMgByMetal, computed, exceedances]);

  // Auto-generate AI summary when data becomes available
  useEffect(() => {
    if (rows.length && !aiText && !aiLoading) {
      void generateAISummary();
    }
  }, [rows.length, aiText, aiLoading, generateAISummary]);

  function downloadCSV() {
    const headers = [...requiredHeaders, 'HPI','HEI','CI'] as const;
    const csv = [headers.join(',')].concat(
      computed.map(r => (headers as readonly string[]).map(h => String((r as unknown as Record<string, unknown>)[h] ?? '')).join(','))
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'hmpi_report.csv'; a.click(); URL.revokeObjectURL(url);
  }

  async function downloadPDF() {
    const el = reportRef.current; if (!el) return;
    // Ensure AI summary exists before capture
    if (rows.length && !aiText && !aiLoading) {
      await generateAISummary();
      await new Promise((r) => setTimeout(r, 200));
    }
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 24; // pt
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - margin * 2);

    while (heightLeft > 0) {
      pdf.addPage();
      position = margin - (imgHeight - heightLeft);
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - margin * 2);
    }

    pdf.save('hmpi_report.pdf');
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/40 border-b border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="rounded-md border border-black/10 dark:border-white/10 px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10">← Home</a>
            <a href="/reports" className="rounded-md border border-black/10 dark:border-white/10 px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10">Report Generation</a>
            <a href="/scholar-lookup" className="rounded-md border border-black/10 dark:border-white/10 px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10">Scholar Lookup</a>
            <a href="/api-docs" className="rounded-md border border-black/10 dark:border-white/10 px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10">API Documentation</a>
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300">
            <div>Comprehensive guide to the API endpoints and usage.</div>
            <div>Export PDF and CSV reports with charts and summaries.</div>
            <div>Search journal papers via Google Scholar API integration.</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Quick Actions */}
        <section className="grid md:grid-cols-3 gap-4">
          <a href="/reports" className="group rounded-2xl border border-black/10 dark:border-white/10 bg-gradient-to-br from-sky-100/70 to-white/60 dark:from-slate-900/70 dark:to-slate-900/40 p-5 hover:border-sky-500/40 transition">
            <div className="text-[10px] uppercase tracking-wider text-sky-700/90 dark:text-sky-300/90 font-semibold">Report Generation</div>
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Export PDF and CSV</h3>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">Export PDF and CSV reports with charts and summaries.</p>
            <div className="mt-4 inline-flex items-center gap-1 text-sky-700 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 text-sm">Generate Reports →</div>
          </a>
          <a href="/scholar-lookup" className="group rounded-2xl border border-black/10 dark:border-white/10 bg-gradient-to-br from-emerald-100/60 to-white/60 dark:from-slate-900/70 dark:to-slate-900/40 p-5 hover:border-emerald-500/40 transition">
            <div className="text-[10px] uppercase tracking-wider text-emerald-700/90 dark:text-emerald-300/90 font-semibold">Scholar Lookup</div>
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Search Papers</h3>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">Search journal papers via Google Scholar API integration.</p>
            <div className="mt-4 inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm">Search Papers →</div>
          </a>
          <a href="/api-docs" className="group rounded-2xl border border-black/10 dark:border-white/10 bg-gradient-to-br from-slate-100/70 to-white/60 dark:from-slate-900/70 dark:to-slate-900/40 p-5 hover:border-slate-400/50 transition">
            <div className="text-[10px] uppercase tracking-wider text-slate-700/90 dark:text-slate-300/90 font-semibold">API Documentation</div>
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Developer Guide</h3>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">Comprehensive guide to the API endpoints and usage.</p>
            <div className="mt-4 inline-flex items-center gap-1 text-slate-800 hover:text-slate-700 dark:text-slate-200 dark:hover:text-white text-sm">View Docs →</div>
          </a>
        </section>
        <section className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-4">
            <h2 className="font-semibold">Upload CSV</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Format: State, District, Location, Longitude, Latitude, Cd, Cr, Cu, Pb, Mn, Ni, Fe, Zn</p>
            <div className="mt-3 flex items-center gap-3">
              <input type="file" accept=".csv" onChange={onFile} className="text-sm" />
              <button
                type="button"
                onClick={() => parseCSVString(text)}
                className="rounded-md border border-black/10 dark:border-white/10 px-3 py-2 text-sm bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15"
              >Parse from textarea</button>
            </div>
            <textarea
              className="mt-3 w-full h-36 rounded-lg border border-black/10 dark:border-white/15 bg-white/70 dark:bg-slate-900/60 p-3 text-sm"
              placeholder="Paste CSV content here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
          </div>

          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-4 space-y-3">
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400">Units</label>
              <select value={units} onChange={(e) => setUnits(e.target.value as 'mg/L'|'µg/L')} className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white/80 dark:bg-slate-900/60 px-3 py-2 text-sm">
                <option value="mg/L">mg/L</option>
                <option value="µg/L">µg/L</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400">Standards</label>
              <select value={profile} onChange={(e) => setProfile(e.target.value as 'BIS (Acceptable)' | 'BIS (Permissible)' | 'WHO')} className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white/80 dark:bg-slate-900/60 px-3 py-2 text-sm">
                <option>BIS (Acceptable)</option>
                <option>BIS (Permissible)</option>
                <option>WHO</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={generateAISummary} disabled={!rows.length || aiLoading} className="flex-1 rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50">
                {aiLoading ? 'Generating…' : 'Generate AI Summary'}
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={downloadCSV} className="flex-1 rounded-lg bg-sky-600 dark:bg-teal-500 px-3 py-2 text-sm font-semibold hover:bg-sky-500 dark:hover:bg-teal-400">Download CSV</button>
              <button onClick={downloadPDF} className="flex-1 rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">Download PDF</button>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Rows parsed: {rows.length.toLocaleString()}</div>
          </div>
        </section>

        {rows.length > 0 && (
          <section ref={reportRef} className="space-y-6">
            {/* Report Header */}
            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white p-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-sky-700/90">HMPI Report</div>
                  <h1 className="text-xl font-bold text-slate-900">Automated Report with AI Summary</h1>
                </div>
                <div className="text-xs text-slate-600">
                  <div>Date: {new Date().toLocaleDateString()}</div>
                  <div>Rows: {rows.length.toLocaleString()}</div>
                  <div>Units: {units} • Standards: {profile}</div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <Summary title="HPI (avg)" value={average(computed.map(r => r.HPI))} hint="Weighted by standards" />
              <Summary title="HEI (avg)" value={average(computed.map(r => r.HEI))} hint="Σ(Mi/Si)" />
              <Summary title="CI (max)" value={Math.max(...computed.map(r => r.CI))} hint="max(Mi/Si)" />
            </div>

            {aiText && (
              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">AI Executive Summary</h3>
                <div
                  className="prose prose-slate prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(aiText) }}
                />
              </div>
            )}
            {aiError && <div className="text-sm text-red-500">{aiError}</div>}

            <div>
              <h3 className="text-lg font-semibold mb-2">Average concentration by metal ({units})</h3>
              <div className="w-full h-[360px] rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-slate-900/60">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={barData} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="key" />
                    <YAxis domain={[0, yMax]} />
                    <ReTooltip formatter={(val: number, name: string, ctx?: { payload?: { key?: MetalKey } }) => {
                      if (name === 'Average' && ctx?.payload?.key) {
                        const stdDisp = stdProfile[ctx.payload.key] * toDisplayFromMg;
                        const ratio = stdDisp ? val / stdDisp : 0;
                        return [`${val.toFixed(4)} ${units} (×${ratio.toFixed(1)})`, name];
                      }
                      return [`${val.toFixed(4)} ${units}`, name];
                    }} />
                    <Legend />
                    <Bar dataKey="value" name="Average" fill="#06b6d4" radius={[6,6,0,0]} />
                    {showStdLine && (
                      <Line type="monotone" dataKey="standard" name={`${profile} standard`} stroke="#64748b" strokeDasharray="4 2" dot={{ r: 3 }} />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="overflow-x-auto border border-black/10 dark:border-white/10 rounded-xl">
              <table className="min-w-full text-sm text-slate-900 dark:text-slate-100">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60">
                    {([...requiredHeaders, 'HPI','HEI','CI'] as string[]).map(h => (
                      <th key={h} className="p-2 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {computed.slice(0, 500).map((r, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/60 dark:bg-slate-800/50'}>
                      {requiredHeaders.map(h => <td key={h} className="p-2">{(r as unknown as Record<string, unknown>)[h] as string}</td>)}
                      <td className="p-2">{r.HPI.toFixed(2)}</td>
                      <td className="p-2">{r.HEI.toFixed(2)}</td>
                      <td className="p-2">{r.CI.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {computed.length > 500 && (
                <div className="text-xs text-slate-600 dark:text-slate-400 px-2 py-2">Showing first 500 rows.</div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function average(arr: number[]) { return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0; }

function Summary({ title, value, hint }: { title: string; value: number; hint?: string }) {
  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-4">
      <div className="text-xs text-slate-600 dark:text-slate-300">{title}</div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{Number.isFinite(value) ? value.toFixed(2) : '-'}</div>
      {hint && <div className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</div>}
    </div>
  );
}
