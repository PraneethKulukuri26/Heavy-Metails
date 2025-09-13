import { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';

type ContourChartProps = {
  year: number;
  width?: number;
  height?: number;
};

// Deterministic pseudo-random generator based on xorshift32
function xorshift32(seed: number) {
  let x = seed | 0;
  return function next() {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 0xffffffff;
  };
}

// Create a smooth field using a few radial basis bumps
function makeField(n: number, m: number, seed: number) {
  const rand = xorshift32(seed);
  const bumps = Array.from({ length: 6 }, () => ({
    x: rand(),
    y: rand(),
    r: 0.1 + rand() * 0.35,
    a: (rand() * 2 - 1) * 1.2,
  }));

  const values = new Float64Array(n * m);
  for (let j = 0; j < m; j++) {
    for (let i = 0; i < n; i++) {
      const px = i / (n - 1);
      const py = j / (m - 1);
      let v = 0;
      for (const b of bumps) {
        const dx = px - b.x;
        const dy = py - b.y;
        const dist2 = dx * dx + dy * dy;
        v += b.a * Math.exp(-dist2 / (2 * b.r * b.r));
      }
      values[j * n + i] = v;
    }
  }
  return values;
}

export default function ContourChart({ year, width = 640, height = 420 }: ContourChartProps) {
  const ref = useRef<SVGSVGElement | null>(null);

  const data = useMemo(() => {
    // Fix grid resolution for responsiveness via viewBox
    const cols = 120;
    const rows = Math.round((cols * height) / width);
    // Seed from year for deterministic output
    return makeField(cols, rows, year * 2654435761);
  }, [year, width, height]);

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const w = width;
    const h = height;
    svg.attr('viewBox', `0 0 ${w} ${h}`).attr('preserveAspectRatio', 'xMidYMid meet');

    const cols = 120;
    const rows = Math.round((cols * h) / w);

    // Compute contour thresholds
    const vmin = d3.min(data) ?? -1;
    const vmax = d3.max(data) ?? 1;
  const thresholds = d3.range(10).map((i: number) => vmin + ((i + 1) * (vmax - vmin)) / 10);

    const contours = d3
      .contours()
      .size([cols, rows])
      .thresholds(thresholds as unknown as number[])(Array.from(data));

    // Color scale
    const color = d3
      .scaleSequential(d3.interpolateTurbo)
      .domain([vmin, vmax]);

    const g = svg.append('g');

    g.selectAll('path')
      .data(contours)
      .join('path')
      .attr('d', d3.geoPath(d3.geoIdentity().scale(w / cols)))
      .attr('fill', (d: any) => color(d.value))
      .attr('stroke', 'rgba(0,0,0,0.15)')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.9);

    // Legend (simple gradient)
    const gradId = `grad-${year}`;
    const defs = svg.append('defs');
    const grad = defs.append('linearGradient').attr('id', gradId).attr('x1', '0%').attr('x2', '100%');
    const stops = 8;
    for (let i = 0; i <= stops; i++) {
      const t = i / stops;
      grad.append('stop').attr('offset', `${t * 100}%`).attr('stop-color', color(vmin + t * (vmax - vmin)) as string);
    }
    const legendW = Math.min(220, w * 0.6);
    const legendX = (w - legendW) / 2;
    svg
      .append('rect')
      .attr('x', legendX)
      .attr('y', h - 16)
      .attr('width', legendW)
      .attr('height', 8)
      .attr('rx', 4)
      .attr('fill', `url(#${gradId})`)
      .attr('opacity', 0.9);
  }, [data, height, width, year]);

  return (
    <div className="w-full h-full">
      <svg ref={ref} className="block w-full h-full rounded-xl" />
    </div>
  );
}
