import india from '@svg-maps/india';

type Node = { id: string; name: string; path: string };
type MapData = { label: string; viewBox: string; locations: Node[] };

const mapData = india as unknown as MapData;

const nameIndex: Map<string, Node> = new Map(
  mapData.locations.map((n) => [normalizeName(n.name), n])
);

function normalizeName(n: string) {
  return n.toLowerCase().replace(/\s+/g, ' ').replace(/\./g, '').trim();
}

export const indiaViewBox = (() => {
  const parts = mapData.viewBox.split(/\s+/).map((v) => parseFloat(v));
  if (parts.length === 4 && parts.every((x) => Number.isFinite(x))) return parts as [number, number, number, number];
  return [0, 0, 1000, 800] as [number, number, number, number];
})();

export function findStatePath(stateName: string): string | null {
  // Direct
  const exact = nameIndex.get(normalizeName(stateName));
  if (exact) return exact.path;
  // Some common variants
  const variants = [
    stateName,
    stateName.replace(/ and /gi, ' & '),
    stateName.replace(/&/g, 'and'),
    stateName.replace(/\./g, ''),
  ];
  for (const v of variants) {
    const hit = nameIndex.get(normalizeName(v));
    if (hit) return hit.path;
  }
  // Loose include
  const target = normalizeName(stateName);
  for (const [key, node] of nameIndex) {
    if (key.includes(target) || target.includes(key)) return node.path;
  }
  return null;
}

export function isStateAvailable(stateName: string): boolean {
  return !!findStatePath(stateName);
}

export function listAvailableStates(): string[] {
  // Use the dataset-provided names directly
  return mapData.locations.map((n) => n.name);
}
