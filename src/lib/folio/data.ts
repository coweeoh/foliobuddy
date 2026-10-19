// Sample dataset bundled for the prototype. Holdings are approximate top constituents
// (as of the AS_OF date); any remaining weight is grouped as "Other holdings".
export const AS_OF = "2026-09-30";

export type Sector =
  | "Technology"
  | "Communication"
  | "Consumer Disc."
  | "Financials"
  | "Healthcare"
  | "Consumer Staples"
  | "Energy"
  | "Industrials"
  | "Utilities"
  | "Unclassified";

export const SECURITIES: Record<string, { name: string; sector: Sector }> = {
  AAPL: { name: "Apple", sector: "Technology" },
  MSFT: { name: "Microsoft", sector: "Technology" },
  NVDA: { name: "NVIDIA", sector: "Technology" },
  AVGO: { name: "Broadcom", sector: "Technology" },
  AMZN: { name: "Amazon", sector: "Consumer Disc." },
  TSLA: { name: "Tesla", sector: "Consumer Disc." },
  META: { name: "Meta Platforms", sector: "Communication" },
  GOOGL: { name: "Alphabet", sector: "Communication" },
  NFLX: { name: "Netflix", sector: "Communication" },
  JPM: { name: "JPMorgan Chase", sector: "Financials" },
  V: { name: "Visa", sector: "Financials" },
  BRKB: { name: "Berkshire Hathaway", sector: "Financials" },
  LLY: { name: "Eli Lilly", sector: "Healthcare" },
  UNH: { name: "UnitedHealth", sector: "Healthcare" },
  JNJ: { name: "Johnson & Johnson", sector: "Healthcare" },
  ABBV: { name: "AbbVie", sector: "Healthcare" },
  PG: { name: "Procter & Gamble", sector: "Consumer Staples" },
  KO: { name: "Coca-Cola", sector: "Consumer Staples" },
  PEP: { name: "PepsiCo", sector: "Consumer Staples" },
  XOM: { name: "Exxon Mobil", sector: "Energy" },
  CVX: { name: "Chevron", sector: "Energy" },
  HD: { name: "Home Depot", sector: "Consumer Disc." },
  ORCL: { name: "Oracle", sector: "Technology" },
  CRM: { name: "Salesforce", sector: "Technology" },
  AMD: { name: "AMD", sector: "Technology" },
  CSCO: { name: "Cisco", sector: "Technology" },
  COST: { name: "Costco", sector: "Consumer Staples" },
  CAT: { name: "Caterpillar", sector: "Industrials" },
  NEE: { name: "NextEra Energy", sector: "Utilities" },
};

export type Fund = {
  name: string;
  holdings: Record<string, number>; // ticker -> weight (0-1)
  otherSectors: Partial<Record<Sector, number>>; // sector split of remainder (sums to 1)
};

export const ETFS: Record<string, Fund> = {
  SPY: {
    name: "SPDR S&P 500 ETF",
    holdings: { NVDA: 0.07, MSFT: 0.065, AAPL: 0.06, AMZN: 0.04, META: 0.03, AVGO: 0.025, GOOGL: 0.035, TSLA: 0.02, BRKB: 0.017, JPM: 0.015, LLY: 0.012, V: 0.011, XOM: 0.009, UNH: 0.008 },
    otherSectors: { Technology: 0.18, Financials: 0.16, Healthcare: 0.14, Industrials: 0.14, "Consumer Disc.": 0.1, "Consumer Staples": 0.08, Energy: 0.05, Utilities: 0.04, Communication: 0.04, Unclassified: 0.07 },
  },
  VTI: {
    name: "Vanguard Total Stock Market ETF",
    holdings: { NVDA: 0.062, MSFT: 0.058, AAPL: 0.055, AMZN: 0.036, META: 0.027, AVGO: 0.022, GOOGL: 0.031, TSLA: 0.018, BRKB: 0.015, JPM: 0.013, LLY: 0.011, V: 0.01, XOM: 0.008 },
    otherSectors: { Technology: 0.17, Financials: 0.16, Healthcare: 0.13, Industrials: 0.16, "Consumer Disc.": 0.1, "Consumer Staples": 0.07, Energy: 0.05, Utilities: 0.04, Communication: 0.04, Unclassified: 0.08 },
  },
  QQQ: {
    name: "Invesco QQQ Trust",
    holdings: { NVDA: 0.095, MSFT: 0.085, AAPL: 0.08, AMZN: 0.055, AVGO: 0.05, META: 0.045, GOOGL: 0.05, TSLA: 0.03, NFLX: 0.025, COST: 0.025, AMD: 0.015, CSCO: 0.014, PEP: 0.012 },
    otherSectors: { Technology: 0.4, Communication: 0.12, "Consumer Disc.": 0.12, Healthcare: 0.12, Industrials: 0.1, "Consumer Staples": 0.06, Utilities: 0.03, Unclassified: 0.05 },
  },
  XLK: {
    name: "Technology Select Sector SPDR",
    holdings: { NVDA: 0.14, MSFT: 0.13, AAPL: 0.125, AVGO: 0.05, ORCL: 0.035, CRM: 0.025, AMD: 0.025, CSCO: 0.025 },
    otherSectors: { Technology: 0.96, Unclassified: 0.04 },
  },
  SCHD: {
    name: "Schwab US Dividend Equity ETF",
    holdings: { ABBV: 0.042, CVX: 0.041, KO: 0.04, PEP: 0.04, HD: 0.039, CSCO: 0.039, XOM: 0.038 },
    otherSectors: { Financials: 0.18, Industrials: 0.2, "Consumer Staples": 0.14, Healthcare: 0.14, Energy: 0.1, "Consumer Disc.": 0.08, Technology: 0.08, Utilities: 0.04, Unclassified: 0.04 },
  },
  XLV: {
    name: "Health Care Select Sector SPDR",
    holdings: { LLY: 0.13, UNH: 0.08, JNJ: 0.07, ABBV: 0.065 },
    otherSectors: { Healthcare: 0.97, Unclassified: 0.03 },
  },
};

// Simulated return model factors (exposure to market, tech, value/defensive) used to
// generate deterministic sample daily returns for correlation demo.
export const FACTORS: Record<string, [number, number, number, number]> = {
  // [market, growth/tech, value/defensive, idiosyncratic vol]
  SPY: [1, 0.25, 0.2, 0.002],
  VTI: [1, 0.22, 0.22, 0.0025],
  QQQ: [1, 0.8, -0.1, 0.004],
  XLK: [1, 1, -0.2, 0.005],
  SCHD: [0.7, -0.4, 0.9, 0.005],
  XLV: [0.6, -0.3, 0.7, 0.007],
};

export function factorsFor(ticker: string): [number, number, number, number] {
  if (FACTORS[ticker]) return FACTORS[ticker];
  const s = SECURITIES[ticker]?.sector;
  if (s === "Technology" || s === "Communication") return [1.1, 0.9, -0.2, 0.014];
  if (s === "Consumer Disc.") return [1.2, 0.6, 0, 0.018];
  if (s === "Consumer Staples" || s === "Utilities" || s === "Healthcare") return [0.5, -0.3, 0.8, 0.011];
  return [0.9, 0, 0.5, 0.013];
}
