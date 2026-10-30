import { describe, expect, it } from "vitest";
import { balancePercents, setExactPercent, toPercents } from "./mix";

const sum = (m: Record<string, number>) => Object.values(m).reduce((s, v) => s + v, 0);

describe("what-if percents", () => {
  it("turns weights into integers that add up to 100", () => {
    expect(toPercents({ SPY: 0.3, QQQ: 0.25, VTI: 0.2, XLV: 0.1, AAPL: 0.15 })).toEqual({
      SPY: 30,
      QQQ: 25,
      VTI: 20,
      XLV: 10,
      AAPL: 15,
    });
    expect(
      sum(
        toPercents({ SPY: 5000 / 11000, QQQ: 3000 / 11000, VTI: 2000 / 11000, NVDA: 1000 / 11000 }),
      ),
    ).toBe(100);
  });

  it("keeps the edited percent and makes the others fill 100", () => {
    const next = setExactPercent({ SPY: 30, QQQ: 25, VTI: 20, XLV: 10, AAPL: 15 }, "QQQ", 10);
    expect(next["QQQ"]).toBe(10);
    expect(sum(next)).toBe(100);
    expect(next).toEqual({ SPY: 36, QQQ: 10, VTI: 24, XLV: 12, AAPL: 18 });
  });

  it("scales a partial mix back to 100", () => {
    const next = balancePercents({ SPY: 30, QQQ: 10, VTI: 20, XLV: 30, AAPL: 10 });
    expect(sum(next)).toBe(100);
    expect(next["XLV"]).toBeGreaterThan(next["QQQ"]!);
  });
});
