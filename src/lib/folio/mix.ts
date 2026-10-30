/** Integer percents that sum to 100. Remainder goes to the largest fractional parts. */
export function toPercents(w: Record<string, number>): Record<string, number> {
  const rows = Object.entries(w).map(([k, v]) => {
    const exact = Math.max(0, v) * 100;
    const base = Math.floor(exact + 1e-9);
    return { k, base, frac: exact - base };
  });
  let used = rows.reduce((s, r) => s + r.base, 0);
  const spare = [...rows].sort((a, b) => b.frac - a.frac || a.k.localeCompare(b.k));
  let i = 0;
  while (used < 100 && spare.length > 0 && i < 100) {
    spare[i % spare.length]!.base += 1;
    used += 1;
    i += 1;
  }
  return Object.fromEntries(rows.map((r) => [r.k, r.base]));
}

/** Scales the current percents so they add up to 100. */
export function balancePercents(current: Record<string, number>): Record<string, number> {
  const total = Object.values(current).reduce((s, v) => s + Math.max(0, v), 0);
  const keys = Object.keys(current);
  if (keys.length === 0) return current;
  if (total <= 0) return toPercents(Object.fromEntries(keys.map((k) => [k, 1])));
  return toPercents(
    Object.fromEntries(Object.entries(current).map(([k, v]) => [k, Math.max(0, v) / total])),
  );
}

/**
 * Sets one holding to an exact integer percent.
 * The other holdings share whatever is left, in proportion to their current percents.
 */
export function setExactPercent(
  current: Record<string, number>,
  ticker: string,
  next: number,
): Record<string, number> {
  if (!(ticker in current)) return current;
  const free = Object.keys(current).filter((k) => k !== ticker);
  const value = Math.min(100, Math.max(0, Math.round(next)));
  const remaining = 100 - value;
  const out: Record<string, number> = { ...current, [ticker]: value };
  if (free.length === 0) return out;

  const freeSum = free.reduce((s, k) => s + current[k]!, 0);
  const parts = free.map((k) => {
    const exact = freeSum > 0 ? (current[k]! / freeSum) * remaining : remaining / free.length;
    const base = Math.floor(exact + 1e-9);
    return { k, base, frac: exact - base };
  });
  let used = parts.reduce((s, p) => s + p.base, 0);
  const order = [...parts].sort((a, b) => b.frac - a.frac || a.k.localeCompare(b.k));
  let i = 0;
  while (used < remaining && i < 100) {
    order[i % order.length]!.base += 1;
    used += 1;
    i += 1;
  }
  for (const p of parts) out[p.k] = p.base;
  return out;
}
