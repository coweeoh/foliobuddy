import { describe, expect, it } from "vitest";
import { correlationMatrix, dailyReturns, DAYS, lookThrough, pearson, weights } from "./engine";
import { capEtfs } from "./plan";

describe("FolioBuddy engine", () => {
  it("computes portfolio weights from amounts", () => {
    expect(weights([{ ticker: "SPY", amount: 3000 }, { ticker: "QQQ", amount: 1000 }])).toEqual({ SPY: 0.75, QQQ: 0.25 });
  });

  it("effective exposure is sum of w_i * h_ij across ETFs plus direct holdings", () => {
    // SPY NVDA 7%, QQQ NVDA 9.5%, plus 10% direct NVDA
    const { companies } = lookThrough({ SPY: 0.5, QQQ: 0.4, NVDA: 0.1 });
    const nvda = companies.find((c) => c.ticker === "NVDA")!;
    expect(nvda.weight).toBeCloseTo(0.5 * 0.07 + 0.4 * 0.095 + 0.1, 10);
    expect(nvda.sources["QQQ"]).toBeCloseTo(0.038, 10);
  });

  it("sector weights sum to 100%", () => {
    const { sectors } = lookThrough({ SPY: 0.6, XLK: 0.4 });
    expect(sectors.reduce((s, x) => s + x.weight, 0)).toBeCloseTo(1, 6);
  });

  it("correlation periods use that many days and keep the 1-year default stable", () => {
    expect(dailyReturns("SPY", 63)).toHaveLength(63);
    expect(dailyReturns("SPY", 756)).toHaveLength(756);
    expect(dailyReturns("SPY", 756).slice(0, DAYS)).toEqual(dailyReturns("SPY"));
    expect(correlationMatrix(["SPY", "QQQ"], 63)[0]![1]).not.toBeCloseTo(
      correlationMatrix(["SPY", "QQQ"])[0]![1]!,
      6,
    );
  });

  it("free plan analyses the first five ETFs and every stock", () => {
    const tickers = ["SPY", "AAPL", "QQQ", "VTI", "XLK", "XLV", "SMH", "NVDA"];
    const { included, excluded } = capEtfs(tickers.map((ticker) => ({ ticker, amount: 100 })), 5);
    expect(included.map((p) => p.ticker)).toEqual(["SPY", "AAPL", "QQQ", "VTI", "XLK", "XLV", "NVDA"]);
    expect(excluded).toEqual(["SMH"]);
    expect(capEtfs(tickers.map((ticker) => ({ ticker, amount: 100 })), Infinity).excluded).toEqual([]);
  });

  it("pearson correlation of perfectly linear series is 1", () => {
    expect(pearson([1, 2, 3, 4], [2, 4, 6, 8])).toBeCloseTo(1);
    expect(pearson([1, 2, 3, 4], [8, 6, 4, 2])).toBeCloseTo(-1);
  });
});
