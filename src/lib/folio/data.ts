// Sample dataset bundled for the prototype. Holdings are approximate top constituents
// (as of the AS_OF date); any remaining weight is grouped as "Other holdings" and
// spread across sectors by fund-level allocation. Any ticker outside this list can
// still be typed — it is treated as a direct stock holding with an unclassified sector.
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
  | "Materials"
  | "Real Estate"
  | "Unclassified";

export const SECURITIES: Record<string, { name: string; sector: Sector }> = {
  // Technology
  AAPL: { name: "Apple", sector: "Technology" },
  MSFT: { name: "Microsoft", sector: "Technology" },
  NVDA: { name: "NVIDIA", sector: "Technology" },
  AVGO: { name: "Broadcom", sector: "Technology" },
  ORCL: { name: "Oracle", sector: "Technology" },
  CRM: { name: "Salesforce", sector: "Technology" },
  AMD: { name: "AMD", sector: "Technology" },
  CSCO: { name: "Cisco", sector: "Technology" },
  ADBE: { name: "Adobe", sector: "Technology" },
  IBM: { name: "IBM", sector: "Technology" },
  TXN: { name: "Texas Instruments", sector: "Technology" },
  QCOM: { name: "Qualcomm", sector: "Technology" },
  INTC: { name: "Intel", sector: "Technology" },
  MU: { name: "Micron Technology", sector: "Technology" },
  AMAT: { name: "Applied Materials", sector: "Technology" },
  LRCX: { name: "Lam Research", sector: "Technology" },
  KLAC: { name: "KLA", sector: "Technology" },
  MRVL: { name: "Marvell Technology", sector: "Technology" },
  TSM: { name: "Taiwan Semiconductor (ADR)", sector: "Technology" },
  ASML: { name: "ASML (ADR)", sector: "Technology" },
  PLTR: { name: "Palantir", sector: "Technology" },
  GOOGL: { name: "Alphabet (class A)", sector: "Communication" },
  GOOG: { name: "Alphabet (class C)", sector: "Communication" },
  META: { name: "Meta Platforms", sector: "Communication" },
  NFLX: { name: "Netflix", sector: "Communication" },
  DIS: { name: "Walt Disney", sector: "Communication" },
  T: { name: "AT&T", sector: "Communication" },
  VZ: { name: "Verizon", sector: "Communication" },
  CMCSA: { name: "Comcast", sector: "Communication" },
  TMUS: { name: "T-Mobile US", sector: "Communication" },
  // Consumer
  AMZN: { name: "Amazon", sector: "Consumer Disc." },
  TSLA: { name: "Tesla", sector: "Consumer Disc." },
  HD: { name: "Home Depot", sector: "Consumer Disc." },
  MCD: { name: "McDonald's", sector: "Consumer Disc." },
  NKE: { name: "Nike", sector: "Consumer Disc." },
  LOW: { name: "Lowe's", sector: "Consumer Disc." },
  SBUX: { name: "Starbucks", sector: "Consumer Disc." },
  TJX: { name: "TJX Companies", sector: "Consumer Disc." },
  BKNG: { name: "Booking Holdings", sector: "Consumer Disc." },
  GM: { name: "General Motors", sector: "Consumer Disc." },
  F: { name: "Ford Motor", sector: "Consumer Disc." },
  TGT: { name: "Target", sector: "Consumer Disc." },
  PG: { name: "Procter & Gamble", sector: "Consumer Staples" },
  KO: { name: "Coca-Cola", sector: "Consumer Staples" },
  PEP: { name: "PepsiCo", sector: "Consumer Staples" },
  WMT: { name: "Walmart", sector: "Consumer Staples" },
  COST: { name: "Costco", sector: "Consumer Staples" },
  PM: { name: "Philip Morris", sector: "Consumer Staples" },
  CL: { name: "Colgate-Palmolive", sector: "Consumer Staples" },
  MO: { name: "Altria", sector: "Consumer Staples" },
  // Financials
  JPM: { name: "JPMorgan Chase", sector: "Financials" },
  V: { name: "Visa", sector: "Financials" },
  BRKB: { name: "Berkshire Hathaway", sector: "Financials" },
  GS: { name: "Goldman Sachs", sector: "Financials" },
  MS: { name: "Morgan Stanley", sector: "Financials" },
  BAC: { name: "Bank of America", sector: "Financials" },
  WFC: { name: "Wells Fargo", sector: "Financials" },
  BLK: { name: "BlackRock", sector: "Financials" },
  SCHW: { name: "Charles Schwab", sector: "Financials" },
  AXP: { name: "American Express", sector: "Financials" },
  SPGI: { name: "S&P Global", sector: "Financials" },
  C: { name: "Citigroup", sector: "Financials" },
  PYPL: { name: "PayPal", sector: "Financials" },
  ICE: { name: "Intercontinental Exchange", sector: "Financials" },
  COIN: { name: "Coinbase", sector: "Financials" },
  // Healthcare
  LLY: { name: "Eli Lilly", sector: "Healthcare" },
  UNH: { name: "UnitedHealth", sector: "Healthcare" },
  JNJ: { name: "Johnson & Johnson", sector: "Healthcare" },
  ABBV: { name: "AbbVie", sector: "Healthcare" },
  PFE: { name: "Pfizer", sector: "Healthcare" },
  MRK: { name: "Merck", sector: "Healthcare" },
  AMGN: { name: "Amgen", sector: "Healthcare" },
  ABT: { name: "Abbott Laboratories", sector: "Healthcare" },
  TMO: { name: "Thermo Fisher Scientific", sector: "Healthcare" },
  // Industrials
  CAT: { name: "Caterpillar", sector: "Industrials" },
  GE: { name: "GE Aerospace", sector: "Industrials" },
  RTX: { name: "RTX", sector: "Industrials" },
  UNP: { name: "Union Pacific", sector: "Industrials" },
  HON: { name: "Honeywell", sector: "Industrials" },
  ETN: { name: "Eaton", sector: "Industrials" },
  UPS: { name: "UPS", sector: "Industrials" },
  DE: { name: "Deere", sector: "Industrials" },
  BA: { name: "Boeing", sector: "Industrials" },
  LMT: { name: "Lockheed Martin", sector: "Industrials" },
  MMM: { name: "3M", sector: "Industrials" },
  FDX: { name: "FedEx", sector: "Industrials" },
  // Energy
  XOM: { name: "Exxon Mobil", sector: "Energy" },
  CVX: { name: "Chevron", sector: "Energy" },
  COP: { name: "ConocoPhillips", sector: "Energy" },
  SLB: { name: "SLB", sector: "Energy" },
  PSX: { name: "Phillips 66", sector: "Energy" },
  OXY: { name: "Occidental Petroleum", sector: "Energy" },
  WMB: { name: "Williams Companies", sector: "Energy" },
  KMI: { name: "Kinder Morgan", sector: "Energy" },
  // Materials
  LIN: { name: "Linde", sector: "Materials" },
  SHW: { name: "Sherwin-Williams", sector: "Materials" },
  FCX: { name: "Freeport-McMoRan", sector: "Materials" },
  APD: { name: "Air Products", sector: "Materials" },
  NEM: { name: "Newmont", sector: "Materials" },
  DOW: { name: "Dow", sector: "Materials" },
  // Utilities
  NEE: { name: "NextEra Energy", sector: "Utilities" },
  DUK: { name: "Duke Energy", sector: "Utilities" },
  SO: { name: "Southern Company", sector: "Utilities" },
  EXC: { name: "Exelon", sector: "Utilities" },
  AEP: { name: "American Electric Power", sector: "Utilities" },
  D: { name: "Dominion Energy", sector: "Utilities" },
  XEL: { name: "Xcel Energy", sector: "Utilities" },
  // Real Estate
  PLD: { name: "Prologis", sector: "Real Estate" },
  AMT: { name: "American Tower", sector: "Real Estate" },
  EQIX: { name: "Equinix", sector: "Real Estate" },
  SPG: { name: "Simon Property Group", sector: "Real Estate" },
  O: { name: "Realty Income", sector: "Real Estate" },
};

export type Fund = {
  name: string;
  holdings: Record<string, number>; // ticker -> weight (0-1)
  otherSectors: Partial<Record<Sector, number>>; // sector split of remainder (sums to 1)
};

export const ETFS: Record<string, Fund> = {
  // Broad market
  SPY: {
    name: "SPDR S&P 500 ETF",
    holdings: { NVDA: 0.07, MSFT: 0.065, AAPL: 0.06, AMZN: 0.04, META: 0.03, AVGO: 0.025, GOOGL: 0.035, TSLA: 0.02, BRKB: 0.017, JPM: 0.015, LLY: 0.012, V: 0.011, XOM: 0.009, UNH: 0.008 },
    otherSectors: { Technology: 0.18, Financials: 0.16, Healthcare: 0.14, Industrials: 0.14, "Consumer Disc.": 0.1, "Consumer Staples": 0.08, Energy: 0.05, Utilities: 0.04, Communication: 0.04, Unclassified: 0.07 },
  },
  VOO: {
    name: "Vanguard S&P 500 ETF",
    holdings: { NVDA: 0.07, MSFT: 0.065, AAPL: 0.06, AMZN: 0.04, META: 0.032, AVGO: 0.025, GOOGL: 0.034, TSLA: 0.02, BRKB: 0.017, JPM: 0.015, LLY: 0.012, V: 0.011, XOM: 0.009, UNH: 0.008 },
    otherSectors: { Technology: 0.18, Financials: 0.16, Healthcare: 0.14, Industrials: 0.14, "Consumer Disc.": 0.1, "Consumer Staples": 0.08, Energy: 0.05, Utilities: 0.04, Communication: 0.04, Unclassified: 0.07 },
  },
  IVV: {
    name: "iShares Core S&P 500 ETF",
    holdings: { NVDA: 0.07, MSFT: 0.066, AAPL: 0.06, AMZN: 0.04, META: 0.031, AVGO: 0.025, GOOGL: 0.034, TSLA: 0.02, BRKB: 0.017, JPM: 0.015, LLY: 0.012, V: 0.011, XOM: 0.009, UNH: 0.008 },
    otherSectors: { Technology: 0.18, Financials: 0.16, Healthcare: 0.14, Industrials: 0.14, "Consumer Disc.": 0.1, "Consumer Staples": 0.08, Energy: 0.05, Utilities: 0.04, Communication: 0.04, Unclassified: 0.07 },
  },
  VTI: {
    name: "Vanguard Total Stock Market ETF",
    holdings: { NVDA: 0.062, MSFT: 0.058, AAPL: 0.055, AMZN: 0.036, META: 0.027, AVGO: 0.022, GOOGL: 0.031, TSLA: 0.018, BRKB: 0.015, JPM: 0.013, LLY: 0.011, V: 0.01, XOM: 0.008 },
    otherSectors: { Technology: 0.17, Financials: 0.16, Healthcare: 0.13, Industrials: 0.16, "Consumer Disc.": 0.1, "Consumer Staples": 0.07, Energy: 0.05, Utilities: 0.04, Communication: 0.04, Unclassified: 0.08 },
  },
  DIA: {
    name: "SPDR Dow Jones Industrial Average ETF",
    holdings: { GS: 0.05, MCD: 0.05, UNH: 0.05, HON: 0.045, CAT: 0.045, MSFT: 0.04, HD: 0.04, AMGN: 0.04, CVX: 0.035, JNJ: 0.035, V: 0.03, PG: 0.03, KO: 0.025, NKE: 0.02, BA: 0.02, WMT: 0.02, AAPL: 0.02, MRK: 0.02, AMZN: 0.015, NVDA: 0.015, JPM: 0.015, DIS: 0.015 },
    otherSectors: { Financials: 0.12, Healthcare: 0.1, Industrials: 0.12, "Consumer Disc.": 0.1, "Consumer Staples": 0.08, Technology: 0.12, Energy: 0.05, Communication: 0.06, Utilities: 0.05, Materials: 0.03, "Real Estate": 0.02, Unclassified: 0.15 },
  },
  IWM: {
    name: "iShares Russell 2000 ETF",
    holdings: { PLTR: 0.008, COIN: 0.007, MRVL: 0.005, MU: 0.005, F: 0.005, GM: 0.004, TGT: 0.004, DOW: 0.004, KMI: 0.004, OXY: 0.004 },
    otherSectors: { Financials: 0.19, Technology: 0.13, Healthcare: 0.14, Industrials: 0.13, "Consumer Disc.": 0.12, "Consumer Staples": 0.05, Energy: 0.04, Materials: 0.05, Utilities: 0.04, "Real Estate": 0.06, Communication: 0.04, Unclassified: 0.01 },
  },
  IJH: {
    name: "iShares Core S&P Mid-Cap ETF",
    holdings: { PLTR: 0.01, COIN: 0.009, MRVL: 0.007, MU: 0.007, TGT: 0.006, UPS: 0.006, LRCX: 0.006, KLAC: 0.006, NEM: 0.005, DOW: 0.005, OXY: 0.005, GM: 0.005, F: 0.005 },
    otherSectors: { Technology: 0.16, Financials: 0.17, Industrials: 0.15, "Consumer Disc.": 0.13, Healthcare: 0.13, "Consumer Staples": 0.06, Energy: 0.05, Materials: 0.05, Utilities: 0.04, "Real Estate": 0.05, Communication: 0.03, Unclassified: 0.03 },
  },
  IJR: {
    name: "iShares Core S&P Small-Cap ETF",
    holdings: { F: 0.004, GM: 0.004, TGT: 0.004, DOW: 0.004, KMI: 0.004, OXY: 0.003 },
    otherSectors: { Financials: 0.18, Technology: 0.12, Industrials: 0.14, "Consumer Disc.": 0.13, Healthcare: 0.13, "Consumer Staples": 0.05, Energy: 0.04, Materials: 0.05, Utilities: 0.04, "Real Estate": 0.07, Communication: 0.04, Unclassified: 0.01 },
  },
  VUG: {
    name: "Vanguard Growth ETF",
    holdings: { NVDA: 0.09, MSFT: 0.08, AAPL: 0.07, AMZN: 0.06, AVGO: 0.05, META: 0.045, GOOGL: 0.045, TSLA: 0.03, NFLX: 0.02, LLY: 0.02, COST: 0.02, V: 0.018, ORCL: 0.018, AMD: 0.015, PLTR: 0.015, ADBE: 0.012 },
    otherSectors: { Technology: 0.55, "Consumer Disc.": 0.13, Communication: 0.12, Healthcare: 0.08, Industrials: 0.05, Financials: 0.03, "Consumer Staples": 0.02, Unclassified: 0.02 },
  },
  VTV: {
    name: "Vanguard Value ETF",
    holdings: { BRKB: 0.045, JPM: 0.03, XOM: 0.025, UNH: 0.025, PG: 0.02, V: 0.02, CVX: 0.018, KO: 0.016, ABBV: 0.016, JNJ: 0.016, WMT: 0.016, HD: 0.015, T: 0.015, VZ: 0.012, CAT: 0.012, BAC: 0.012, PEP: 0.012, CSCO: 0.012 },
    otherSectors: { Financials: 0.3, Healthcare: 0.14, Industrials: 0.12, "Consumer Staples": 0.1, Energy: 0.09, Technology: 0.07, Utilities: 0.06, Communication: 0.05, "Real Estate": 0.04, "Consumer Disc.": 0.02, Unclassified: 0.01 },
  },
  VYM: {
    name: "Vanguard High Dividend Yield ETF",
    holdings: { BRKB: 0.03, JPM: 0.02, XOM: 0.02, CVX: 0.018, ABBV: 0.018, KO: 0.016, PEP: 0.016, PG: 0.015, VZ: 0.015, T: 0.014, WMT: 0.014, HD: 0.013, CAT: 0.013, CSCO: 0.012, TXN: 0.012, COP: 0.011, DUK: 0.011, SO: 0.01, BLK: 0.01 },
    otherSectors: { Financials: 0.22, Energy: 0.14, "Consumer Staples": 0.14, Healthcare: 0.12, Industrials: 0.14, Technology: 0.08, Utilities: 0.08, "Consumer Disc.": 0.04, Communication: 0.04 },
  },
  // Sector funds
  XLK: {
    name: "Technology Select Sector SPDR",
    holdings: { NVDA: 0.14, MSFT: 0.13, AAPL: 0.125, AVGO: 0.05, ORCL: 0.035, CRM: 0.025, AMD: 0.025, CSCO: 0.025 },
    otherSectors: { Technology: 0.96, Unclassified: 0.04 },
  },
  SMH: {
    name: "VanEck Semiconductor ETF",
    holdings: { NVDA: 0.2, AVGO: 0.11, TSM: 0.1, ASML: 0.05, AMD: 0.055, QCOM: 0.05, TXN: 0.045, INTC: 0.03, MU: 0.03, AMAT: 0.025, LRCX: 0.025, KLAC: 0.022, MRVL: 0.02 },
    otherSectors: { Technology: 0.96, Unclassified: 0.04 },
  },
  XLF: {
    name: "Financial Select Sector SPDR",
    holdings: { BRKB: 0.13, JPM: 0.11, V: 0.075, MS: 0.05, BAC: 0.05, GS: 0.05, WFC: 0.045, BLK: 0.04, SCHW: 0.04, AXP: 0.035, SPGI: 0.03, C: 0.025, PYPL: 0.02, ICE: 0.02, COIN: 0.015 },
    otherSectors: { Financials: 0.94, Technology: 0.02, Unclassified: 0.04 },
  },
  XLE: {
    name: "Energy Select Sector SPDR",
    holdings: { XOM: 0.21, CVX: 0.16, COP: 0.05, SLB: 0.04, PSX: 0.03, OXY: 0.03, WMB: 0.028, KMI: 0.025 },
    otherSectors: { Energy: 0.96, Unclassified: 0.04 },
  },
  XLY: {
    name: "Consumer Discretionary Select Sector SPDR",
    holdings: { AMZN: 0.23, TSLA: 0.18, HD: 0.06, MCD: 0.06, LOW: 0.04, BKNG: 0.04, SBUX: 0.03, TJX: 0.03, NKE: 0.03, GM: 0.02, TGT: 0.02 },
    otherSectors: { "Consumer Disc.": 0.94, Unclassified: 0.06 },
  },
  XLP: {
    name: "Consumer Staples Select Sector SPDR",
    holdings: { PG: 0.15, KO: 0.1, PEP: 0.1, COST: 0.1, WMT: 0.08, PM: 0.05, CL: 0.04, MO: 0.04 },
    otherSectors: { "Consumer Staples": 0.95, Unclassified: 0.05 },
  },
  XLI: {
    name: "Industrial Select Sector SPDR",
    holdings: { GE: 0.06, RTX: 0.055, UNP: 0.05, HON: 0.05, CAT: 0.05, ETN: 0.05, UPS: 0.045, DE: 0.045, BA: 0.04, LMT: 0.04, MMM: 0.03, FDX: 0.03 },
    otherSectors: { Industrials: 0.95, Unclassified: 0.05 },
  },
  XLU: {
    name: "Utilities Select Sector SPDR",
    holdings: { NEE: 0.13, DUK: 0.07, SO: 0.065, EXC: 0.05, AEP: 0.045, D: 0.045, XEL: 0.04 },
    otherSectors: { Utilities: 0.95, Unclassified: 0.05 },
  },
  XLB: {
    name: "Materials Select Sector SPDR",
    holdings: { LIN: 0.16, SHW: 0.08, FCX: 0.05, APD: 0.05, NEM: 0.04, DOW: 0.03 },
    otherSectors: { Materials: 0.95, Unclassified: 0.05 },
  },
  XLC: {
    name: "Communication Services Select Sector SPDR",
    holdings: { META: 0.18, GOOGL: 0.14, GOOG: 0.07, NFLX: 0.09, DIS: 0.07, TMUS: 0.04, VZ: 0.04, T: 0.04, CMCSA: 0.04 },
    otherSectors: { Communication: 0.94, Unclassified: 0.06 },
  },
  VNQ: {
    name: "Vanguard Real Estate ETF",
    holdings: { PLD: 0.13, AMT: 0.11, EQIX: 0.08, SPG: 0.06, O: 0.06 },
    otherSectors: { "Real Estate": 0.95, Unclassified: 0.05 },
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
  VOO: [1, 0.25, 0.2, 0.002],
  IVV: [1, 0.25, 0.2, 0.002],
  VTI: [1, 0.22, 0.22, 0.0025],
  DIA: [0.85, 0.1, 0.4, 0.003],
  IWM: [1.15, 0.1, 0.1, 0.006],
  IJH: [1.05, 0.15, 0.1, 0.004],
  IJR: [1.1, 0.05, 0.15, 0.005],
  VUG: [1.05, 0.7, -0.15, 0.003],
  VTV: [0.85, -0.2, 0.6, 0.003],
  VYM: [0.75, -0.3, 0.8, 0.004],
  QQQ: [1, 0.8, -0.1, 0.004],
  XLK: [1, 1, -0.2, 0.005],
  SMH: [1.1, 1.1, -0.3, 0.006],
  XLF: [0.95, -0.1, 0.5, 0.004],
  XLE: [0.6, -0.5, 0.6, 0.008],
  XLY: [1.15, 0.4, 0, 0.004],
  XLP: [0.45, -0.4, 0.8, 0.003],
  XLI: [1.0, 0.1, 0.2, 0.003],
  XLU: [0.5, -0.5, 0.7, 0.006],
  XLB: [0.9, -0.1, 0.4, 0.005],
  XLC: [1.0, 0.6, -0.1, 0.004],
  VNQ: [0.8, -0.3, 0.4, 0.007],
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
