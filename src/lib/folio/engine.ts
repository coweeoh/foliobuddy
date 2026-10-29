import { ETFS, SECURITIES, factorsFor, type Sector } from "./data";

export type Position = { ticker: string; amount: number };
export type Portfolio = { id: string; name: string; positions: Position[] };

export const OTHER = "OTHER";

export function weights(positions: Position[]): Record<string, number> {
  const valid = positions.filter((p) => p.ticker && p.amount > 0);
  const total = valid.reduce((s, p) => s + p.amount, 0);
  const w: Record<string, number> = {};
  if (total <= 0) return w;
  for (const p of valid) w[p.ticker] = (w[p.ticker] ?? 0) + p.amount / total;
  return w;
}

export type Exposure = {
  ticker: string;
  name: string;
  sector: Sector;
  weight: number;
  sources: Record<string, number>; // holding ticker -> contribution
};

/** E_j = Σ_i w_i · h_ij, aggregated across ETFs and direct stock holdings. */
export function lookThrough(w: Record<string, number>) {
  const companies: Record<string, Exposure> = {};
  const sectors: Record<string, { weight: number; sources: Record<string, number> }> = {};
  const addSector = (s: Sector, v: number, src: string) => {
    sectors[s] ??= { weight: 0, sources: {} };
    sectors[s].weight += v;
    sectors[s].sources[src] = (sectors[s].sources[src] ?? 0) + v;
  };
  const addCompany = (t: string, v: number, src: string) => {
    const info = SECURITIES[t] ?? { name: t, sector: "Unclassified" as Sector };
    companies[t] ??= { ticker: t, name: info.name, sector: info.sector, weight: 0, sources: {} };
    companies[t].weight += v;
    companies[t].sources[src] = (companies[t].sources[src] ?? 0) + v;
    addSector(info.sector, v, src);
  };
  const unknown: string[] = [];
  for (const [t, wi] of Object.entries(w)) {
    const fund = ETFS[t];
    if (fund) {
      let covered = 0;
      for (const [j, h] of Object.entries(fund.holdings)) {
        addCompany(j, wi * h, t);
        covered += h;
      }
      const rest = wi * (1 - covered);
      for (const [s, f] of Object.entries(fund.otherSectors)) addSector(s as Sector, rest * (f ?? 0), t);
    } else {
      if (!SECURITIES[t]) unknown.push(t);
      addCompany(t, wi, t);
    }
  }
  return {
    companies: Object.values(companies).sort((a, b) => b.weight - a.weight),
    sectors: Object.entries(sectors)
      .map(([sector, v]) => ({ sector, ...v }))
      .sort((a, b) => b.weight - a.weight),
    unknown,
  };
}

// ---------- returns & correlation (deterministic simulated sample series) ----------
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}
function gaussian(r: () => number) {
  const u = Math.max(r(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
}
function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return h;
}

export const DAYS = 252;

/** Lookback windows in trading days. Series run newest-first, so a window is a prefix. */
export const PERIODS = [
  { label: "3M", name: "3 months", days: 63 },
  { label: "6M", name: "6 months", days: 126 },
  { label: "1Y", name: "1 year", days: 252 },
  { label: "3Y", name: "3 years", days: 756 },
] as const;
const HISTORY = Math.max(...PERIODS.map((p) => p.days));

const factorSeries = (() => {
  const r = rng(42);
  return Array.from({ length: HISTORY }, () => [gaussian(r) * 0.01, gaussian(r) * 0.007, gaussian(r) * 0.005]);
})();

export function dailyReturns(ticker: string, days = DAYS): number[] {
  const [m, g, v, idio] = factorsFor(ticker);
  const r = rng(hash(ticker));
  return factorSeries
    .slice(0, Math.min(days, HISTORY))
    .map(([fm, fg, fv]) => m * fm! + g * fg! + v * fv! + gaussian(r) * idio);
}

export function pearson(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let ma = 0, mb = 0;
  for (let i = 0; i < n; i++) { ma += a[i]!; mb += b[i]!; }
  ma /= n; mb /= n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i]! - ma, y = b[i]! - mb;
    num += x * y; da += x * x; db += y * y;
  }
  return da && db ? num / Math.sqrt(da * db) : 0;
}

export function correlationMatrix(tickers: string[], days = DAYS) {
  const series = tickers.map((t) => dailyReturns(t, days));
  return tickers.map((_, i) => tickers.map((_, j) => (i === j ? 1 : pearson(series[i]!, series[j]!))));
}
