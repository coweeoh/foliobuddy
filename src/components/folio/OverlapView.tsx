import { Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { correlationMatrix, PERIODS } from "@/lib/folio/engine";
import { FREE_PERIOD_DAYS } from "@/lib/folio/plan";
import { cn } from "@/lib/utils";
import { usePlan } from "./plan";
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

// Lowest band first, matching the legend order.
const BANDS = [
  { min: -Infinity, label: "lower correlation", bg: "var(--corr-low)", ink: "var(--corr-low-ink)" },
  { min: 0.4, label: "moderate", bg: "var(--corr-mid)", ink: "var(--corr-mid-ink)" },
  { min: 0.7, label: "moves together", bg: "var(--corr-high)", ink: "var(--corr-high-ink)" },
];
const bandOf = (r: number) => BANDS.filter((b) => r >= b.min).at(-1)!;

export function OverlapView({ tickers, hueOf }: { tickers: string[]; hueOf: HueOf }) {
  const { limits, openPlans } = usePlan();
  const [days, setDays] = useState(FREE_PERIOD_DAYS);
  const period = limits.customPeriods ? days : FREE_PERIOD_DAYS;
  const m = useMemo(() => correlationMatrix(tickers, period), [tickers, period]);
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
              title="Correlation matrix"
              aside={
                <div
                  role="group"
                  aria-label="Correlation period"
                  className="inline-flex rounded-full bg-secondary p-1"
                >
                  {PERIODS.map((p) => {
                    const locked = !limits.customPeriods && p.days !== FREE_PERIOD_DAYS;
                    const on = p.days === period;
                    return (
                      <button
                        key={p.label}
                        aria-pressed={on}
                        title={locked ? "Premium" : undefined}
                        onClick={() =>
                          locked
                            ? openPlans(
                                "Free shows one year of history. Premium lets you compare 3 months, 6 months, 1 year or 3 years.",
                              )
                            : setDays(p.days)
                        }
                        className={cn(
                          "num inline-flex h-8 items-center gap-1 rounded-full px-3 text-[13px] font-semibold transition-colors",
                          on
                            ? "bg-surface text-ink shadow-sm"
                            : "text-muted-foreground hover:text-ink",
                        )}
                      >
                        {locked && <Lock aria-hidden className="h-3 w-3" />}
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              }
              sub="1.00 means two holdings move in lockstep; 0 means they're unrelated. Darker squares add less diversification."
            />
            <div className="overflow-x-auto px-6 pb-4">
              <table className="num border-separate border-spacing-1.5 text-[15px]">
                <thead>
                  <tr>
                    <th />
                    {tickers.map((t) => (
                      <th
                        key={t}
                        scope="col"
                        className="px-1 pb-1 text-base font-semibold text-muted-foreground"
                      >
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tickers.map((t, i) => (
                    <tr key={t}>
                      <th
                        scope="row"
                        className="pr-3 text-right text-base font-semibold text-muted-foreground"
                      >
                        {t}
                      </th>
                      {tickers.map((u, j) => {
                        if (j > i) return <td key={u} />;
                        const r = m[i]![j]!;
                        const band = bandOf(r);
                        return (
                          <td
                            key={u}
                            title={`${t} and ${u}: ${r.toFixed(2)} (${band.label})`}
                            className="h-14 w-16 min-w-14 rounded-[8px] text-center font-bold transition-transform duration-150 hover:scale-105"
                            style={{ background: band.bg, color: band.ink }}
                          >
                            {r.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-rule px-6 py-4 text-sm text-muted-foreground">
              {BANDS.map((b) => (
                <span key={b.label} className="flex items-center gap-2">
                  <i aria-hidden className="h-4 w-4 rounded-[4px]" style={{ background: b.bg }} />
                  {b.label}
                </span>
              ))}
              <span className="ml-auto">
                {PERIODS.find((p) => p.days === period)?.name ?? `${period} days`} of simulated
                sample returns
              </span>
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
