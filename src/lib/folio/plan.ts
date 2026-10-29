import { ETFS } from "./data";
import { DAYS, type Position } from "./engine";

export type Plan = "free" | "premium";

export const PREMIUM_PRICE = "S$5.90";

export const LIMITS: Record<
  Plan,
  {
    etfs: number;
    portfolios: number;
    simulations: number;
    customPeriods: boolean;
    monitoring: boolean;
  }
> = {
  free: { etfs: 5, portfolios: 1, simulations: 3, customPeriods: false, monitoring: false },
  premium: {
    etfs: Infinity,
    portfolios: Infinity,
    simulations: Infinity,
    customPeriods: true,
    monitoring: true,
  },
};

export const FREE_PERIOD_DAYS = DAYS;

export const FEATURES: { label: string; free: string; premium: string }[] = [
  { label: "Portfolios", free: "1", premium: "Unlimited" },
  { label: "ETFs per portfolio", free: "Up to 5", premium: "Unlimited" },
  { label: "Company and sector look-through", free: "Included", premium: "Included" },
  { label: "Correlation period", free: "1 year", premium: "3M, 6M, 1Y or 3Y" },
  { label: "What-if comparisons", free: "3 a month", premium: "Unlimited" },
  { label: "Exposure monitoring", free: "—", premium: "Monthly check and alerts" },
];

/**
 * Keeps every stock but only the first `limit` distinct ETFs, in the order entered.
 * Returns the positions to analyse and the ETF tickers left out.
 */
export function capEtfs(positions: Position[], limit: number) {
  const kept = new Set<string>();
  const excluded: string[] = [];
  const included = positions.filter((p) => {
    if (!ETFS[p.ticker] || kept.has(p.ticker)) return true;
    if (kept.size < limit) {
      kept.add(p.ticker);
      return true;
    }
    if (!excluded.includes(p.ticker)) excluded.push(p.ticker);
    return false;
  });
  return { included, excluded };
}

export const monthKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
