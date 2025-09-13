import { mean, median, deviation, extent } from 'd3-array';
import { csvParse } from 'd3-dsv';
import { format as d3format } from 'd3-format';
import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

type Row = {
  State: string;
  District: string;
  Location: string;
  Longitude: string;
  Latitude: string;
  Cd: string; Cr: string; Cu: string; Pb: string; Mn: string; Ni: string; Fe: string; Zn: string;
};

type MetalKey = 'Cd'|'Cr'|'Cu'|'Pb'|'Mn'|'Ni'|'Fe'|'Zn';
const metalKeys: MetalKey[] = ['Cd','Cr','Cu','Pb','Mn','Ni','Fe','Zn'];

const num = (v: string) => {
  const n = parseFloat(v);
  return isNaN(n) ? undefined : n;
};

export default function StateData() {
  const [raw, setRaw] = useState<Row[] | null>(null);
  const [stateFilter, setStateFilter] = useState<string>('All');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [metal, setMetal] = useState<MetalKey>('Pb');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        // Use fetch to avoid bundling the 17k-line CSV in JS; Vite will serve it.
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

  const states = useMemo(() => {
    if (!raw) return [];
    return Array.from(new Set(raw.map(r => r.State).filter(Boolean))).sort();
  }, [raw]);

  const districts = useMemo(() => {
    if (!raw) return [];
    const filtered = stateFilter === 'All' ? raw : raw.filter(r => r.State === stateFilter);
    return Array.from(new Set(filtered.map(r => r.District).filter(Boolean))).sort();
  }, [raw, stateFilter]);

  const filtered = useMemo(() => {
    if (!raw) return [] as Row[];
    let out = raw;
    if (stateFilter !== 'All') out = out.filter(r => r.State === stateFilter);
    if (districtFilter !== 'All') out = out.filter(r => r.District === districtFilter);
    return out;
  }, [raw, stateFilter, districtFilter]);

  const perStateStats = useMemo(() => {
    if (!raw) return [] as { State: string }[];
    const byState = new Map<string, Row[]>();
    raw.forEach(r => {
      const k = r.State || 'Unknown';
      if (!byState.has(k)) byState.set(k, []);
      byState.get(k)!.push(r);
    });
    const rows = Array.from(byState.entries()).map(([st, rows]) => {
      const stats: Record<MetalKey, number | undefined> = { Cd: undefined, Cr: undefined, Cu: undefined, Pb: undefined, Mn: undefined, Ni: undefined, Fe: undefined, Zn: undefined };
      metalKeys.forEach(m => {
        const vals = rows.map(r => num(r[m])).filter((v): v is number => v !== undefined);
        stats[m] = vals.length ? mean(vals) : undefined;
      });
      return { State: st, ...stats };
    });
    return rows.sort((a, b) => (b[metal] ?? 0) - (a[metal] ?? 0));
  }, [raw, metal]);

  const summaryStats = useMemo(() => {
    const out: { key: MetalKey; mean?: number; median?: number; sd?: number; min?: number; max?: number }[] = [];
    metalKeys.forEach(m => {
      const vals = filtered.map(r => num(r[m])).filter((v): v is number => v !== undefined);
      const [minV, maxV] = extent(vals) as [number | undefined, number | undefined];
      out.push({
        key: m,
        mean: vals.length ? mean(vals) : undefined,
        median: vals.length ? median(vals) : undefined,
        sd: vals.length ? deviation(vals) : undefined,
        min: minV,
        max: maxV,
      });
    });
    return out;
  }, [filtered]);

  const districtSeries = useMemo(() => {
    if (stateFilter === 'All') return [] as { District: string; value: number }[];
    const byDistrict = new Map<string, Row[]>();
    filtered.forEach(r => {
      const k = r.District || 'Unknown';
      if (!byDistrict.has(k)) byDistrict.set(k, []);
      byDistrict.get(k)!.push(r);
    });
    const rows: { District: string; value: number }[] = Array.from(byDistrict.entries()).map(([d, rows]) => {
      const vals = rows.map(r => num(r[metal])).filter((v): v is number => v !== undefined);
      return { District: d, value: vals.length ? (mean(vals) || 0) : 0 };
    });
    return rows.sort((a, b) => (b.value || 0) - (a.value || 0)).slice(0, 25);
  }, [filtered, stateFilter, metal]);

  const fmt = d3format(',.3f');

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/cgwb_logo.png" onError={e => { (e.currentTarget as HTMLImageElement).src = '/logo.svg'; }} className="h-8 w-8 rounded-full ring-1 ring-black/10 bg-white" alt="CGWB Logo" />
            <span className="font-semibold tracking-tight text-cyan-700">Statewise Heavy Metals</span>
          </div>
          <a href="/" className="text-sm text-slate-600 hover:underline">← Home</a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <section className="flex flex-wrap gap-3 items-center">
          <select value={stateFilter} onChange={e => { setStateFilter(e.target.value); setDistrictFilter('All'); }} className="border rounded-lg px-3 py-2">
            <option value="All">All States</option>
            {states.map(s => (<option key={s} value={s}>{s}</option>))}
          </select>
          <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)} className="border rounded-lg px-3 py-2" disabled={stateFilter==='All'}>
            <option value="All">All Districts</option>
            {districts.map(d => (<option key={d} value={d}>{d}</option>))}
          </select>
          <select value={metal} onChange={e => setMetal(e.target.value as MetalKey)} className="border rounded-lg px-3 py-2">
            {metalKeys.map(m => (<option key={m} value={m}>{m}</option>))}
          </select>
        </section>

        {loading && <div className="text-slate-600">Loading data…</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && !error && (
          <>
            {/* Chart 1: Average per-state for selected metal */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Average {metal} by State (mg/L)</h2>
              <div className="w-full h-[420px] rounded-xl border border-black/10 bg-white/60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={perStateStats} margin={{ top: 10, right: 20, left: 0, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="State" angle={-45} textAnchor="end" interval={0} height={60} />
                    <YAxis tickFormatter={(v)=>d3format(',.2f')(v)} />
                    <ReTooltip formatter={(v)=>fmt(v as number)} />
                    <Legend />
                    <Bar dataKey={metal} name={`${metal} (avg)`} fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Chart 2: Top districts within selected state for selected metal */}
            {stateFilter !== 'All' && (
              <section>
                <h2 className="text-xl font-semibold mb-3">Top Districts in {stateFilter} — {metal} (avg)</h2>
                <div className="w-full h-[420px] rounded-xl border border-black/10 bg-white/60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={districtSeries} margin={{ top: 10, right: 20, left: 0, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="District" angle={-45} textAnchor="end" interval={0} height={80} />
                      <YAxis tickFormatter={(v)=>d3format(',.2f')(v)} />
                      <ReTooltip formatter={(v)=>fmt(v as number)} />
                      <Legend />
                      <Bar dataKey="value" name={`${metal} (avg)`} fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {/* Chart 3: Summary stats across metals under current filters */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Summary Statistics by Metal (filtered)</h2>
              <div className="w-full h-[360px] rounded-xl border border-black/10 bg-white/60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={summaryStats.map(s=>({
                    key: s.key,
                    mean: s.mean ?? 0,
                    median: s.median ?? 0,
                    sd: s.sd ?? 0,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="key" />
                    <YAxis tickFormatter={(v)=>d3format(',.2f')(v)} />
                    <ReTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="mean" stroke="#22c55e" />
                    <Line type="monotone" dataKey="median" stroke="#f59e0b" />
                    <Line type="monotone" dataKey="sd" stroke="#ef4444" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Details table (virtualized-lite by slicing) */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Records ({filtered.length.toLocaleString()})</h2>
              <div className="overflow-x-auto border border-black/10 rounded-xl">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-2 text-left">State</th>
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
                        <td className="p-2">{r.State}</td>
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
                  <div className="text-xs text-slate-600 px-2 py-2">Showing first 500 rows. Refine filters to see fewer rows.</div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
