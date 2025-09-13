export type MetalKey = 'Cd' | 'Cr' | 'Cu' | 'Pb' | 'Mn' | 'Ni' | 'Fe' | 'Zn';

// Drinking water standards (mg/L). Values reflect common BIS/WHO guidelines.
export const standardsMgL: Record<MetalKey, number> = {
  Cd: 0.003,
  Cr: 0.05,
  Cu: 0.05, // health-based <=0.05; aesthetic higher
  Pb: 0.01,
  Mn: 0.1,
  Ni: 0.02,
  Fe: 0.3,
  Zn: 5.0,
};

export const metalLabels: Record<MetalKey, string> = {
  Cd: 'Cadmium (Cd)',
  Cr: 'Chromium (Cr)',
  Cu: 'Copper (Cu)',
  Pb: 'Lead (Pb)',
  Mn: 'Manganese (Mn)',
  Ni: 'Nickel (Ni)',
  Fe: 'Iron (Fe)',
  Zn: 'Zinc (Zn)',
};

export type Inputs = Partial<Record<MetalKey, number>>;

export function computeHPI(inputs: Inputs) {
  // Qi = 100 * (Mi - Ii) / (Si - Ii) ; Ii=0 for heavy metals, so Qi = 100 * Mi / Si
  // Wi = 1 / Si ; HPI = (Σ Wi*Qi) / Σ Wi
  const entries = Object.keys(standardsMgL) as MetalKey[];
  let sumW = 0;
  let sumWQ = 0;
  const details = entries.map((k) => {
    const Si = standardsMgL[k];
    const Mi = inputs[k] ?? 0;
    const Wi = 1 / Si;
    const Qi = (Mi / Si) * 100;
    sumW += Wi;
    sumWQ += Wi * Qi;
    return { key: k, Si, Mi, Wi, Qi, contribution: Wi * Qi };
  });
  const hpi = sumW > 0 ? sumWQ / sumW : 0;
  return { hpi, sumW, sumWQ, details };
}

export function categorizeHPI(hpi: number) {
  if (hpi <= 25) return { label: 'Good', color: '#22c55e' };
  if (hpi <= 50) return { label: 'Alert', color: '#eab308' };
  if (hpi <= 75) return { label: 'Poor', color: '#f97316' };
  if (hpi <= 100) return { label: 'Critical', color: '#ef4444' };
  return { label: 'Hazardous', color: '#991b1b' };
}

export function formatNumber(n: number, digits = 3) {
  return Number.isFinite(n) ? Number(n).toFixed(digits) : '-';
}

// HEI: Heavy metal evaluation index = Σ (Mi/Si)
export function computeHEI(inputs: Inputs) {
  const entries = Object.keys(standardsMgL) as MetalKey[];
  let sum = 0;
  const details = entries.map((k) => {
    const Si = standardsMgL[k];
    const Mi = inputs[k] ?? 0;
    const ratio = Mi / Si;
    sum += ratio;
    return { key: k, Si, Mi, ratio };
  });
  return { hei: sum, details };
}

// CI: Contamination index = max_i (Mi/Si)
export function computeCI(inputs: Inputs) {
  const entries = Object.keys(standardsMgL) as MetalKey[];
  let max = 0;
  const details = entries.map((k) => {
    const Si = standardsMgL[k];
    const Mi = inputs[k] ?? 0;
    const ratio = Mi / Si;
    if (ratio > max) max = ratio;
    return { key: k, Si, Mi, ratio };
  });
  return { ci: max, details };
}
