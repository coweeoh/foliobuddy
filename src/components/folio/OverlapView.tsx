import { useMemo } from "react";
import { correlationMatrix, DAYS } from "@/lib/folio/engine";
import { Card, CardHeader, PageTitle, TickerTile, type HueOf } from "./shared";

function describe(r: number) {
  if (r >= 0.9) return { label: "Nearly the same", tone: "warn" as const };
  if (r >= 0.7) return { label: "Move together", tone: "neutral" as const };
  if (r >= 0.4) return { label: "Somewhat related", tone: "neutral" as const };
  if (r > -0.2) return { label: "Mostly independent", tone: "good" as const };
  return { label: "Tend to offset", tone: "good" as const };
}

const TONE = {
  warn: { background: "var(--warning-soft)", color: "var(--warning)" },
  neutral: { background: "var(--pill-neutral-bg)", color: "var(--pill-neutral-ink)" },
  good: { background: "var(--brand-soft)", color: "var(--brand-ink)" },
};

// The ramp's colours and steepness come from the theme (--heat-*), so both modes keep 4.5:1.
const STRONG = 0.6;
const cellBg = (r: number) => {
  const a = Math.abs(r);
  const amount =
    a < STRONG
      ? `calc((var(--heat-lo) + ${(a / STRONG).toFixed(3)} * var(--heat-span)) * 1%)`
      : `calc((var(--heat-strong-start) + ${((a - STRONG) / (1 - STRONG)).toFixed(3)} * var(--heat-strong-span)) * 1%)`;
  return `color-mix(in oklab, ${r >= 0 ? "var(--heat-pos)" : "var(--heat-neg)"} ${amount}, var(--heat-base))`;
};
const cellInk = (r: number) => (Math.abs(r) >= STRONG ? "var(--heat-strong-ink)" : "var(--text)");

export function OverlapView({ tickers, hueOf }: { tickers: string[]; hueOf: HueOf }) {
  const m = useMemo(() => correlationMatrix(tickers), [tickers]);
  const pairs = tickers
    .flatMap((a, i) => tickers.slice(i + 1).map((b, k) => ({ a, b, r: m[i]![i + 1 + k]! })))
    .sort((x, y) => y.r - x.r);
  const top = pairs[0];

  return (
    <>
      <PageTitle
        title="How your holdings move together"
        sub={
          top ? (
            <>
              <b className="font-semibold text-ink">{top.a}</b> and{" "}
              <b className="font-semibold text-ink">{top.b}</b> are your most alike pair at{" "}
              <b className="num font-semibold text-ink">{top.r.toFixed(2)}</b>
              {top.r >= 0.9 ? ": they rise and fall almost as one investment." : "."}
            </>
          ) : (
            "Add a second holding to see whether they rise and fall together."
          )
        }
      />

      {tickers.length < 2 ? (
        <Card className="p-6" style={{ ["--i" as string]: 1 }}>
          <p className="text-base font-semibold">You need at least two holdings to compare</p>
          <p className="mt-1 text-[15px] text-muted-foreground">
            Correlation compares the daily ups and downs of each pair you hold.
          </p>
        </Card>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Card style={{ ["--i" as string]: 1 }}>
            <CardHeader
              title="Correlation"
              sub="1.00 means two holdings move in lockstep; 0 means they're unrelated; below 0 means one tends to rise when the other falls."
            />
            <div className="overflow-x-auto px-6 pb-4">
              <table className="num border-separate border-spacing-1.5 text-sm">
                <thead>
                  <tr>
                    <th />
                    {tickers.slice(0, -1).map((t) => (
                      <th key={t} scope="col" className="px-1 pb-1 font-semibold">
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tickers.slice(1).map((t, ri) => {
                    const i = ri + 1;
                    return (
                      <tr key={t}>
                        <th scope="row" className="pr-2 text-right font-semibold">
                          {t}
                        </th>
                        {tickers.slice(0, -1).map((u, j) => {
                          if (j >= i) return <td key={u} />;
                          const r = m[i]![j]!;
                          return (
                            <td
                              key={u}
                              title={`${t} and ${u}: ${r.toFixed(2)}`}
                              className="h-14 w-16 min-w-14 rounded-[8px] text-center text-[15px] font-semibold transition-transform duration-150 hover:scale-105"
                              style={{
                                background: cellBg(r),
                                color: cellInk(r),
                              }}
                            >
                              {r.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-rule px-6 py-4 text-sm text-muted-foreground">
              {[-0.6, 0, 0.5, 1].map((r) => (
                <span key={r} className="flex items-center gap-2">
                  <i
                    aria-hidden
                    className="h-3.5 w-5 rounded-[4px]"
                    style={{ background: cellBg(r) }}
                  />
                  <span className="num">{r.toFixed(1)}</span>
                </span>
              ))}
              <span className="ml-auto">From {DAYS} days of simulated sample returns</span>
            </div>
          </Card>

          <Card style={{ ["--i" as string]: 2 }}>
            <CardHeader
              title="Every pair"
              sub="Most alike first. Pairs near 1 add less diversification than they seem to."
            />
            <ul className="pb-3">
              {pairs.map(({ a, b, r }) => {
                const d = describe(r);
                return (
                  <li key={`${a}-${b}`} className="flex items-center gap-3 px-6 py-2.5">
                    <span className="flex gap-1">
                      <TickerTile ticker={a} h={hueOf(a)} size={34} />
                      <TickerTile ticker={b} h={hueOf(b)} size={34} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold">
                        {a} + {b}
                      </span>
                      <span
                        className="mt-0.5 inline-flex h-6 items-center rounded-full px-2.5 text-[13px] font-medium"
                        style={TONE[d.tone]}
                      >
                        {d.label}
                      </span>
                    </span>
                    <span className="num text-base font-semibold">{r.toFixed(2)}</span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      )}
    </>
  );
}
