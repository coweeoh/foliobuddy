import { Plus, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { ETFS } from "@/lib/folio/data";
import { lookThrough } from "@/lib/folio/engine";
import {
  Card,
  CardHeader,
  nameOf,
  PageTitle,
  pct,
  pts,
  SecondaryButton,
  TextButton,
  TickerTile,
  type HueOf,
} from "./shared";
import { TickerPicker } from "./TickerPicker";

const toSliders = (w: Record<string, number>) =>
  Object.fromEntries(Object.entries(w).map(([k, v]) => [k, Math.round(v * 100)]));

type Row = { key: string; label: string; now: number; next: number };

function compare(
  a: { key: string; label: string; weight: number }[],
  b: { key: string; label: string; weight: number }[],
  n: number,
): Row[] {
  const keys = [...new Set([...a.slice(0, n), ...b.slice(0, n)].map((x) => x.key))];
  const get = (arr: typeof a, k: string) => arr.find((x) => x.key === k);
  return keys
    .map((k) => ({
      key: k,
      label: (get(a, k) ?? get(b, k))!.label,
      now: get(a, k)?.weight ?? 0,
      next: get(b, k)?.weight ?? 0,
    }))
    .sort((x, y) => y.next - x.next)
    .slice(0, n);
}

export function WhatIfView({ w, hueOf }: { w: Record<string, number>; hueOf: HueOf }) {
  const [sim, setSim] = useState<Record<string, number>>(() => toSliders(w));
  const simW = useMemo(() => {
    const total = Object.values(sim).reduce((s, v) => s + v, 0) || 1;
    return Object.fromEntries(Object.entries(sim).map(([k, v]) => [k, v / total]));
  }, [sim]);
  const before = useMemo(() => lookThrough(w), [w]);
  const after = useMemo(() => lookThrough(simW), [simW]);
  const changed = JSON.stringify(sim) !== JSON.stringify(toSliders(w));

  const top10 = (x: typeof before) => x.companies.slice(0, 10).reduce((s, c) => s + c.weight, 0);
  const sectorOf = (x: typeof before, name: string) =>
    x.sectors.find((s) => s.sector === name)?.weight ?? 0;
  const bigSector = before.sectors.find((s) => s.sector !== "Unclassified")?.sector ?? "Technology";
  const summary = [
    { label: "Top 10 companies", now: top10(before), next: top10(after) },
    {
      label: `${bigSector} sector`,
      now: sectorOf(before, bigSector),
      next: sectorOf(after, bigSector),
    },
    {
      label: `Largest company (${after.companies[0]?.ticker ?? "—"})`,
      now: before.companies.find((c) => c.ticker === after.companies[0]?.ticker)?.weight ?? 0,
      next: after.companies[0]?.weight ?? 0,
    },
  ];

  const companies = compare(
    before.companies.map((c) => ({ key: c.ticker, label: c.name, weight: c.weight })),
    after.companies.map((c) => ({ key: c.ticker, label: c.name, weight: c.weight })),
    8,
  );
  const sectors = compare(
    before.sectors.map((s) => ({ key: s.sector, label: s.sector, weight: s.weight })),
    after.sectors.map((s) => ({ key: s.sector, label: s.sector, weight: s.weight })),
    8,
  );

  return (
    <>
      <PageTitle
        title="Try a different mix"
        sub="Move the sliders to rebalance on paper. Nothing is traded; we recalculate what you'd own underneath."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="lg:sticky lg:top-8" style={{ ["--i" as string]: 1 }}>
          <CardHeader
            title="Your mix"
            aside={
              <TextButton
                onClick={() => setSim(toSliders(w))}
                disabled={!changed}
                className="flex items-center gap-1.5 disabled:opacity-40"
              >
                <RotateCcw aria-hidden className="h-3.5 w-3.5" /> Reset
              </TextButton>
            }
          />
          <div className="space-y-5 px-6 pb-5">
            {Object.entries(sim).map(([t, v]) => {
              const h = hueOf(t);
              const share = simW[t] ?? 0;
              return (
                <label key={t} className="block">
                  <span className="flex items-center gap-3">
                    <TickerTile ticker={t} h={h} size={32} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold">{t}</span>
                      <span className="block truncate text-[13px] text-muted-foreground">
                        {nameOf(t) ?? "Single stock"}
                      </span>
                    </span>
                    <span className="num text-right">
                      <span className="block text-base font-semibold">{pct(share)}</span>
                      <span className="block text-[13px] text-muted-foreground">
                        now {pct(w[t] ?? 0)}
                      </span>
                    </span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={v}
                    aria-label={`Weight for ${t}`}
                    aria-valuetext={pct(share)}
                    onChange={(e) => setSim({ ...sim, [t]: Number(e.target.value) })}
                    className="range mt-2"
                    style={{ ["--fill" as string]: `${v}%`, ["--mark" as string]: h.mark }}
                  />
                </label>
              );
            })}
          </div>
          <div className="border-t border-rule px-6 py-4">
            <TickerPicker
              etfOnly
              exclude={Object.keys(sim)}
              onPick={(t) => setSim({ ...sim, [t]: 10 })}
              label="Try adding an ETF"
            >
              <SecondaryButton className="w-full">
                <Plus aria-hidden className="h-4 w-4" /> Try adding an ETF
              </SecondaryButton>
            </TickerPicker>
            <p className="mt-3 text-[13px] text-muted-foreground">
              {Object.keys(ETFS).length} ETFs available to try.
            </p>
          </div>
        </Card>

        <div className="grid gap-6">
          <Card style={{ ["--i" as string]: 2 }}>
            <dl className="grid divide-y divide-rule sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {summary.map((s) => (
                <div key={s.label} className="px-6 py-5">
                  <dt className="text-sm text-muted-foreground">{s.label}</dt>
                  <dd className="num mt-1 text-[28px] leading-tight font-semibold">
                    {pct(s.next)}
                  </dd>
                  <dd className="num mt-1 text-sm text-muted-foreground">
                    {Math.abs(s.next - s.now) < 0.0005 ? (
                      "No change"
                    ) : (
                      <>
                        from {pct(s.now)} ·{" "}
                        <span className="font-semibold text-ink">{pts(s.next - s.now)}</span>
                      </>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          <ShiftCard title="Top companies after the change" rows={companies} index={3} />
          <ShiftCard title="Sectors after the change" rows={sectors} index={4} />
        </div>
      </div>
    </>
  );
}

function ShiftCard({ title, rows, index }: { title: string; rows: Row[]; index: number }) {
  const max = Math.max(...rows.flatMap((r) => [r.now, r.next]), 0.0001);
  return (
    <Card style={{ ["--i" as string]: index }}>
      <CardHeader
        title={title}
        aside={
          <span className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <i aria-hidden className="h-2 w-4 rounded-full bg-brand" />
              New mix
            </span>
            <span className="flex items-center gap-2">
              <i aria-hidden className="h-3.5 w-0.5 bg-ink" />
              Today
            </span>
          </span>
        }
      />
      <ul className="space-y-3 px-6 pb-6">
        {rows.map((r) => {
          const d = r.next - r.now;
          return (
            <li
              key={r.key}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 sm:grid-cols-[10rem_minmax(0,1fr)_7.5rem]"
            >
              <span className="truncate text-[15px]">{r.label}</span>
              <span className="relative col-span-2 row-start-2 h-2.5 rounded-full bg-muted sm:col-span-1 sm:col-start-2 sm:row-start-1">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-brand transition-[width] duration-300 ease-out"
                  style={{ width: `${(r.next / max) * 100}%` }}
                />
                <span
                  aria-hidden
                  className="absolute -top-1 -bottom-1 w-0.5 rounded-full bg-ink transition-[left] duration-300"
                  style={{ left: `calc(${(r.now / max) * 100}% - 1px)` }}
                />
              </span>
              <span className="num text-right text-[15px]">
                <b className="font-semibold">{pct(r.next)}</b>{" "}
                <span className="text-[13px] text-muted-foreground">
                  {Math.abs(d) < 0.0005 ? "same" : pts(d)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
