import { useEffect, useMemo, useState } from 'react';

import { findStatePath, indiaViewBox } from '../lib/indiaGeo';

type Props = { name: string; className?: string; bgClass?: string };

export default function StateThumb({ name, className, bgClass }: Props) {
  const [d, setD] = useState<string | null>(null);
  // projection instance not stored; we just use it to compute path

  const fallbackViewBox = '0 0 400 300';
  const width = 400;
  const height = 300;
  const [vb, setVb] = useState<string>(fallbackViewBox);

  useEffect(() => {
    const path = findStatePath(name);
    setD(path);
    if (!path) {
      setVb(fallbackViewBox);
      return;
    }
    // Compute tight bounds using a temporary path element
    const svgNS = 'http://www.w3.org/2000/svg';
    const tmp = document.createElementNS(svgNS, 'svg');
    const p = document.createElementNS(svgNS, 'path');
    p.setAttribute('d', path);
    tmp.appendChild(p);
    // Some browsers need attachment to compute bbox; hidden offscreen
    tmp.setAttribute('width', '0');
    tmp.setAttribute('height', '0');
    tmp.style.position = 'absolute';
    tmp.style.left = '-9999px';
    document.body.appendChild(tmp);
    try {
      const bbox = p.getBBox();
      const pad = Math.max(bbox.width, bbox.height) * 0.06;
      const x = bbox.x - pad;
      const y = bbox.y - pad;
      const w = bbox.width + pad * 2;
      const h = bbox.height + pad * 2;
      setVb(`${x} ${y} ${w} ${h}`);
    } catch {
      const [x, y, w, h] = indiaViewBox;
      setVb(`${x} ${y} ${w} ${h}`);
    } finally {
      document.body.removeChild(tmp);
    }
  }, [name]);

  const content = useMemo(() => {
    if (!d) return (
      <image href="/states/_placeholder.svg" x={0} y={0} width={width} height={height} preserveAspectRatio="xMidYMid meet" />
    );
    return (
      <>
        <path d={d} fill="url(#grad)" stroke="currentColor" strokeOpacity={0.5} strokeWidth={1} />
        <path d={d} fill="none" stroke="#0369a1" strokeOpacity={0.35} strokeWidth={2} />
      </>
    );
  }, [d]);

  return (
  <svg viewBox={vb} className={className} aria-label={`${name} boundary preview`}>
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#99f6e4" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={width} height={height} className={bgClass || 'fill-slate-200/60 dark:fill-slate-800/60'} />
      <g>
        {content}
      </g>
    </svg>
  );
}
