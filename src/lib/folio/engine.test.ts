import { describe, expect, it } from "vitest";
import { lookThrough, pearson, weights } from "./engine";

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

  it("pearson correlation of perfectly linear series is 1", () => {
    expect(pearson([1, 2, 3, 4], [2, 4, 6, 8])).toBeCloseTo(1);
    expect(pearson([1, 2, 3, 4], [8, 6, 4, 2])).toBeCloseTo(-1);
  });
});
