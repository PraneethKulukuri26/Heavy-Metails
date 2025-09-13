import { mean } from 'd3-array';
import { csvParse } from 'd3-dsv';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

import StateThumb from '../components/StateThumb';
import { computeCI, computeHEI, computeHPI, metalLabels, standardsMgL, type MetalKey } from '../lib/hmpi';

const metalKeys: MetalKey[] = ['Cd','Cr','Cu','Pb','Mn','Ni','Fe','Zn'];

function deslugify(slug: string) {
  const name = slug.replace(/-/g, ' ');
  return name.replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function StateDetail() {
  const params = useParams();
  const slug = params.slug || '';
  const displayName = useMemo(() => deslugify(slug), [slug]);

  type Row = {
    State: string;
    District: string;
    Location: string;
    Longitude: string;
    Latitude: string;
    Cd: string; Cr: string; Cu: string; Pb: string; Mn: string; Ni: string; Fe: string; Zn: string;
  };
  const toNum = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const [raw, setRaw] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [metal, setMetal] = useState<MetalKey>('Pb');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
  const res = await fetch('/src/2023_with_metals_random.csv');
        if (!res.ok) throw new Error('Failed to load CSV');
        const text = await res.text();
        if (cancelled) return;
        const rows = csvParse(text) as unknown as Row[];
        setRaw(rows);
        setError(null);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Could not load data';
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const stateRows = useMemo(() => {
    if (!raw) return [] as Row[];
    return raw.filter(r => (r.State || '').trim().toLowerCase() === displayName.trim().toLowerCase());
  }, [raw, displayName]);

  const districts = useMemo(() => {
    const set = new Set(stateRows.map(r => r.District).filter(Boolean));
    return Array.from(set).sort();
  }, [stateRows]);

  const filtered = useMemo(() => {
    let out = stateRows;
    if (districtFilter !== 'All') out = out.filter(r => r.District === districtFilter);
    return out;
  }, [stateRows, districtFilter]);

  const avgByMetal = useMemo(() => {
    const res: Record<MetalKey, number> = { Cd: 0, Cr: 0, Cu: 0, Pb: 0, Mn: 0, Ni: 0, Fe: 0, Zn: 0 };
    const counts: Record<MetalKey, number> = { Cd: 0, Cr: 0, Cu: 0, Pb: 0, Mn: 0, Ni: 0, Fe: 0, Zn: 0 };
    filtered.forEach(r => {
      metalKeys.forEach(m => {
        const v = toNum(r[m]);
        if (v !== undefined) { res[m] += v; counts[m] += 1; }
      });
    });
    metalKeys.forEach(m => { res[m] = counts[m] ? res[m] / counts[m] : 0; });
    return res;
  }, [filtered]);

  const seriesTopDistricts = useMemo(() => {
    const by = new Map<string, number[]>();
    filtered.forEach(r => {
      const d = r.District || 'Unknown';
      const v = toNum(r[metal]);
      if (v === undefined) return;
      if (!by.has(d)) by.set(d, []);
      by.get(d)!.push(v);
    });
    const rows = Array.from(by.entries()).map(([d, arr]) => ({ District: d, value: mean(arr) || 0 }));
    return rows.sort((a, b) => b.value - a.value).slice(0, 20);
  }, [filtered, metal]);

  const hmpiInputs = useMemo(() => avgByMetal, [avgByMetal]);
  const { hpi } = useMemo(() => computeHPI(hmpiInputs), [hmpiInputs]);
  const { hei } = useMemo(() => computeHEI(hmpiInputs), [hmpiInputs]);
  const { ci } = useMemo(() => computeCI(hmpiInputs), [hmpiInputs]);

  const barData = useMemo(
    () => metalKeys.map(m => ({ key: m, value: avgByMetal[m], standard: standardsMgL[m] })),
    [avgByMetal]
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-black/10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/states" className="rounded-md border border-black/10 px-2 py-1 text-xs hover:bg-black/5">← All States</Link>
            <span className="font-semibold tracking-tight">{displayName}</span>
          </div>
          <div className="text-xs flex items-center gap-3">
            <Link to="/state-data" className="hover:underline">Statewise Data</Link>
            <Link to="/hmpi" className="hover:underline">HMPI Calculator</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        <section className="grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-1">
            <StateThumb name={displayName} className="w-full h-auto" />
          </div>
          <div className="md:col-span-2 space-y-3">
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <div className="text-sm text-slate-600">Records: {filtered.length.toLocaleString()}</div>
            <div className="flex flex-wrap gap-2 items-center">
              <label className="text-sm">District:</label>
              <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)} className="border rounded-lg px-3 py-2">
                <option value="All">All</option>
                {districts.map(d => (<option key={d} value={d}>{d}</option>))}
              </select>
              <label className="text-sm ml-2">Metal:</label>
              <select value={metal} onChange={e => setMetal(e.target.value as MetalKey)} className="border rounded-lg px-3 py-2">
                {metalKeys.map(m => (<option key={m} value={m}>{metalLabels[m]}</option>))}
              </select>
            </div>
            {loading && <div className="text-slate-600">Loading data…</div>}
            {error && <div className="text-red-600">{error}</div>}
            {!loading && !error && (
              <div className="grid sm:grid-cols-3 gap-3">
                <Summary title="HPI" value={hpi} hint="Weighted by standards" tag={hpi <= 25 ? 'Good' : hpi <= 50 ? 'Alert' : hpi <= 75 ? 'Poor' : hpi <= 100 ? 'Critical' : 'Hazardous'} color={hpi <= 25 ? '#22c55e' : hpi <= 50 ? '#eab308' : hpi <= 75 ? '#f97316' : hpi <= 100 ? '#ef4444' : '#991b1b'} />
                <Summary title="HEI" value={hei} hint="Σ(Mi/Si)" tag={hei <= 10 ? 'Low' : hei <= 20 ? 'Medium' : 'High'} color={hei <= 10 ? '#22c55e' : hei <= 20 ? '#f59e0b' : '#ef4444'} />
                <Summary title="CI" value={ci} hint="max(Mi/Si)" tag={ci <= 1 ? 'Within limit' : 'Exceeds'} color={ci <= 1 ? '#22c55e' : '#ef4444'} />
              </div>
            )}
          </div>
        </section>

        {!loading && !error && (
          <>
            <section>
              <h2 className="text-lg font-semibold mb-2">Average concentration by metal (mg/L)</h2>
              <div className="w-full h-[380px] rounded-xl border border-black/10 bg-white/60">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={barData} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="key" />
                    <YAxis />
                    <ReTooltip formatter={(val: number, name: string, ctx?: { payload?: { key?: MetalKey } }) => {
                      if (name === 'Average' && ctx?.payload?.key) {
                        const std = standardsMgL[ctx.payload.key];
                        const ratio = std ? val / std : 0;
                        return [`${val.toFixed(4)} (×${ratio.toFixed(1)})`, name];
                      }
                      return [val.toFixed(4), name];
                    }} />
                    <Legend />
                    <defs>
                      <linearGradient id="avgFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.65} />
                      </linearGradient>
                    </defs>
                    <Bar dataKey="value" name="Average" fill="url(#avgFill)" radius={[6,6,0,0]} />
                    <Line type="monotone" dataKey="standard" name="Standard" stroke="#64748b" strokeDasharray="4 2" dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Top districts — {metalLabels[metal]} (avg)</h2>
              <div className="w-full h-[420px] rounded-xl border border-black/10 bg-white/60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={seriesTopDistricts} margin={{ top: 10, right: 20, left: 0, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="District" angle={-45} textAnchor="end" interval={0} height={80} />
                    <YAxis />
                    <ReTooltip formatter={(val: number) => {
                      const std = standardsMgL[metal];
                      const ratio = std ? val / std : 0;
                      return [`${val.toFixed(4)} (×${ratio.toFixed(1)})`, `${metal} (avg)`];
                    }} />
                    <Legend />
                    <ReferenceLine y={standardsMgL[metal]} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Standard', position: 'top', fill: '#ef4444', fontSize: 12 }} />
                    <Bar dataKey="value" name={`${metal} (avg)`} radius={[6,6,0,0]} fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">First 500 records</h2>
              <div className="overflow-x-auto border border-black/10 rounded-xl">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-2 text-left">District</th>
                      <th className="p-2 text-left">Location</th>
                      <th className="p-2 text-left">Longitude</th>
                      <th className="p-2 text-left">Latitude</th>
                      {metalKeys.map(m => (<th key={m} className="p-2 text-right">{m}</th>))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 500).map((r, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                        <td className="p-2">{r.District}</td>
                        <td className="p-2">{r.Location}</td>
                        <td className="p-2">{r.Longitude}</td>
                        <td className="p-2">{r.Latitude}</td>
                        {metalKeys.map(m => (<td key={m} className="p-2 text-right">{r[m]}</td>))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length > 500 && (
                  <div className="text-xs text-slate-600 px-2 py-2">Showing first 500 rows. Narrow by district to see fewer rows.</div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Summary({ title, value, hint, tag, color }: { title: string; value: number; hint?: string; tag?: string; color?: string }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white/70 p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-600">{title}</div>
        {tag && (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-black/5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: color || '#64748b' }} />
            {tag}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold">{Number.isFinite(value) ? value.toFixed(2) : '-'}</div>
      {hint && <div className="text-[11px] text-slate-500">{hint}</div>}
    </div>
  );
}
