import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AS_OF, ETFS, SECURITIES } from "@/lib/folio/data";
import { correlationMatrix, DAYS, lookThrough, weights, type Position } from "@/lib/folio/engine";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FolioBuddy — See what your ETFs really own" },
      { name: "description", content: "Look through your ETFs to reveal hidden company and sector overlap, return correlations, and what-if allocations." },
      { property: "og:title", content: "FolioBuddy — See what your ETFs really own" },
      { property: "og:description", content: "Portfolio look-through, overlap, correlation and allocation simulation for retail investors." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;
const PALETTE = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--muted-foreground)"];
const KNOWN = [...Object.keys(ETFS), ...Object.keys(SECURITIES)];

const STEPS = ["Portfolio", "Exposure", "Correlation", "Simulate"] as const;
type Step = (typeof STEPS)[number];

function Index() {
  const [positions, setPositions] = useState<Position[]>([
    { ticker: "SPY", amount: 5000 },
    { ticker: "QQQ", amount: 3000 },
    { ticker: "VTI", amount: 2000 },
    { ticker: "NVDA", amount: 1000 },
  ]);
  const [step, setStep] = useState<Step>("Portfolio");
  const w = useMemo(() => weights(positions), [positions]);
  const tickers = Object.keys(w);
  const colorOf = (t: string) => PALETTE[Math.max(0, tickers.indexOf(t)) % PALETTE.length]!;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-2xl font-semibold text-primary">FolioBuddy</span>
            <span className="hidden text-sm text-muted-foreground sm:inline">see what your ETFs really own</span>
          </div>
          <span className="num text-xs text-muted-foreground">data as of {AS_OF}</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <nav className="mb-10 grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`border-t-2 pt-3 text-left transition-colors ${step === s ? "border-primary text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              <span className="num text-xs">0{i + 1}</span>
              <span className="block font-display text-lg">{s}</span>
            </button>
          ))}
        </nav>

        {step === "Portfolio" && <PortfolioStep positions={positions} setPositions={setPositions} w={w} onNext={() => setStep("Exposure")} />}
        {step === "Exposure" && <ExposureStep w={w} colorOf={colorOf} />}
        {step === "Correlation" && <CorrelationStep tickers={tickers} />}
        {step === "Simulate" && <SimulateStep w={w} />}

        <footer className="mt-16 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
          FolioBuddy provides information only — not investment advice, and it does not execute trades. Holdings are approximate
          top constituents as of {AS_OF}; remaining fund weight is spread across sectors by fund-level allocation. Correlations
          use {DAYS} days of simulated sample returns in this prototype. Supported tickers: {KNOWN.join(", ")}.
        </footer>
      </main>
    </div>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-3xl">{title}</h2>
      {sub && <p className="mt-1 max-w-2xl text-muted-foreground">{sub}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function PortfolioStep({ positions, setPositions, w, onNext }: { positions: Position[]; setPositions: (p: Position[]) => void; w: Record<string, number>; onNext: () => void }) {
  const update = (i: number, patch: Partial<Position>) => setPositions(positions.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  return (
    <Section title="What do you hold?" sub="Enter your ETFs and stocks with the amount invested. We'll work out each one's weight.">
      <datalist id="tickers">{KNOWN.map((t) => <option key={t} value={t}>{ETFS[t]?.name ?? SECURITIES[t]?.name}</option>)}</datalist>
      <div className="rounded-lg border border-border bg-card">
        <div className="grid grid-cols-[1fr_1fr_6rem_2.5rem] gap-3 border-b border-border px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">
          <span>Ticker</span><span>Amount</span><span className="text-right">Weight</span><span />
        </div>
        {positions.map((p, i) => {
          const name = ETFS[p.ticker]?.name ?? SECURITIES[p.ticker]?.name;
          return (
            <div key={i} className="grid grid-cols-[1fr_1fr_6rem_2.5rem] items-center gap-3 border-b border-border px-4 py-3 last:border-0">
              <div>
                <input list="tickers" value={p.ticker} onChange={(e) => update(i, { ticker: e.target.value.toUpperCase().trim() })}
                  className="num w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
                <span className={`mt-1 block text-xs ${name ? "text-muted-foreground" : "text-destructive"}`}>{name ?? (p.ticker ? "Not in dataset — counted as a direct holding" : " ")}</span>
              </div>
              <input type="number" min={0} value={p.amount || ""} onChange={(e) => update(i, { amount: Number(e.target.value) })}
                className="num w-full self-start rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
              <span className="num self-start pt-2 text-right">{w[p.ticker] ? pct(w[p.ticker]!) : "—"}</span>
              <button aria-label="Remove" onClick={() => setPositions(positions.filter((_, j) => j !== i))} className="self-start pt-2 text-muted-foreground hover:text-destructive">✕</button>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex gap-3">
        <button onClick={() => setPositions([...positions, { ticker: "", amount: 0 }])} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary">+ Add holding</button>
        <button onClick={onNext} disabled={!Object.keys(w).length} className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40">Look through →</button>
      </div>
    </Section>
  );
}

function SourceBar({ sources, total, colorOf }: { sources: Record<string, number>; total: number; colorOf: (t: string) => string }) {
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
      {Object.entries(sources).map(([t, v]) => <div key={t} title={`${t}: ${pct(v, 2)}`} style={{ width: `${(v / total) * 100}%`, background: colorOf(t) }} />)}
    </div>
  );
}

function ExposureStep({ w, colorOf }: { w: Record<string, number>; colorOf: (t: string) => string }) {
  const { companies, sectors, unknown } = useMemo(() => lookThrough(w), [w]);
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? companies : companies.slice(0, 12);
  const max = companies[0]?.weight ?? 1;
  const overlapped = companies.filter((c) => Object.keys(c.sources).length > 1);
  return (
    <>
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <Stat label="Top company" value={companies[0] ? `${companies[0].ticker} ${pct(companies[0].weight)}` : "—"} />
      <Stat label="Top 5 companies combined" value={pct(companies.slice(0, 5).reduce((s, c) => s + c.weight, 0))} />
      <Stat label="Held through 2+ positions" value={`${overlapped.length} companies`} />
      </div>
      <div className="mb-6 flex flex-wrap gap-4 text-xs">
        {Object.keys(w).map((t) => <span key={t} className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: colorOf(t) }} />{t}</span>)}
      </div>
      <Section title="Your real company exposure" sub="Each bar shows the share of your whole portfolio in that company, coloured by which of your holdings it comes from.">
        <div className="space-y-3">
          {shown.map((c) => (
            <div key={c.ticker} className="grid grid-cols-[9rem_1fr_4.5rem] items-center gap-4">
              <span className="truncate text-sm"><b className="num font-medium">{c.ticker}</b> <span className="text-muted-foreground">{c.name}</span></span>
              <div style={{ width: `${(c.weight / max) * 100}%` }}><SourceBar sources={c.sources} total={c.weight} colorOf={colorOf} /></div>
              <span className="num text-right text-sm">{pct(c.weight, 2)}</span>
            </div>
          ))}
        </div>
        {companies.length > 12 && (
          <button onClick={() => setShowAll(!showAll)} className="mt-4 rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary">
            {showAll ? "Show top 12 only" : `Show all ${companies.length} companies`}
          </button>
        )}
      </Section>
      <Section title="Sector allocation" sub="Combined across every fund's underlying holdings.">
        <div className="h-80 rounded-lg border border-border bg-card p-4">
          <ResponsiveContainer>
            <BarChart data={sectors.map((s) => ({ name: s.sector, v: +(s.weight * 100).toFixed(2) }))} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid horizontal={false} stroke="var(--border)" />
              <XAxis type="number" unit="%" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={12} width={110} />
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
              <Bar dataKey="v" radius={[0, 4, 4, 0]}>{sectors.map((s, i) => <Cell key={i} fill={s.sector === "Unclassified" ? "var(--muted-foreground)" : "var(--chart-1)"} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {unknown.length > 0 && <p className="mt-3 text-sm text-destructive">Typed tickers not in our dataset are treated as direct holdings (sector unknown): {unknown.join(", ")}</p>}
      </Section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="num mt-2 block text-2xl text-primary">{value}</span>
    </div>
  );
}

function CorrelationStep({ tickers }: { tickers: string[] }) {
  const m = useMemo(() => correlationMatrix(tickers), [tickers]);
  const pairs = tickers.flatMap((a, i) => tickers.slice(i + 1).map((b, k) => ({ a, b, r: m[i]![i + 1 + k]! }))).sort((x, y) => y.r - x.r);
  const top = pairs[0];
  return (
    <Section title="Do your holdings move together?" sub="Pearson correlation of daily returns. Near 1 means they rise and fall together — less diversification than it looks.">
      <div className="overflow-x-auto">
        <table className="num border-separate border-spacing-1 text-sm">
          <thead><tr><th />{tickers.map((t) => <th key={t} className="px-2 font-medium">{t}</th>)}</tr></thead>
          <tbody>
            {tickers.map((t, i) => (
              <tr key={t}>
                <th className="pr-2 text-right font-medium">{t}</th>
                {m[i]!.map((r, j) => (
                  <td key={j} className="h-14 w-16 rounded-md text-center"
                    style={{ background: `color-mix(in oklab, ${r >= 0 ? "var(--chart-2)" : "var(--chart-3)"} ${Math.abs(r) * 90}%, var(--card))` }}>
                    {r.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {top && (
        <p className="mt-6 max-w-2xl">
          Your most similar pair is <b>{top.a}</b> and <b>{top.b}</b> at <span className="num">{top.r.toFixed(2)}</span>
          {top.r > 0.8 ? " — historically they behave almost like the same investment." : "."}
        </p>
      )}
    </Section>
  );
}

function SimulateStep({ w }: { w: Record<string, number> }) {
  const [sim, setSim] = useState<Record<string, number>>(() => Object.fromEntries(Object.entries(w).map(([k, v]) => [k, Math.round(v * 100)])));
  const simW = useMemo(() => {
    const total = Object.values(sim).reduce((s, v) => s + v, 0) || 1;
    return Object.fromEntries(Object.entries(sim).map(([k, v]) => [k, v / total]));
  }, [sim]);
  const before = useMemo(() => lookThrough(w), [w]);
  const after = useMemo(() => lookThrough(simW), [simW]);
  const extra = Object.keys(ETFS).filter((t) => !(t in sim));

  const compare = (a: { key: string; weight: number }[], b: { key: string; weight: number }[], n: number) => {
    const keys = [...new Set([...a.slice(0, n), ...b.slice(0, n)].map((x) => x.key))];
    const get = (arr: typeof a, k: string) => arr.find((x) => x.key === k)?.weight ?? 0;
    return keys.map((k) => ({ name: k, Current: +(get(a, k) * 100).toFixed(2), Simulated: +(get(b, k) * 100).toFixed(2) })).sort((x, y) => y.Current - x.Current);
  };
  const comp = compare(before.companies.map((c) => ({ key: c.ticker, weight: c.weight })), after.companies.map((c) => ({ key: c.ticker, weight: c.weight })), 8);
  const sect = compare(before.sectors.map((s) => ({ key: s.sector, weight: s.weight })), after.sectors.map((s) => ({ key: s.sector, weight: s.weight })), 10);

  return (
    <Section title="What if you rebalanced?" sub="Drag the sliders to try a different mix. Nothing is traded — we just recalculate your exposure.">
      <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-5 rounded-lg border border-border bg-card p-5">
          {Object.entries(sim).map(([t, v]) => (
            <label key={t} className="block">
              <span className="flex justify-between text-sm"><b className="num font-medium">{t}</b><span className="num text-muted-foreground">{pct(simW[t] ?? 0)}</span></span>
              <input type="range" min={0} max={100} value={v} onChange={(e) => setSim({ ...sim, [t]: Number(e.target.value) })} className="mt-2 w-full accent-primary" />
            </label>
          ))}
          {extra.length > 0 && (
            <select value="" onChange={(e) => e.target.value && setSim({ ...sim, [e.target.value]: 10 })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">+ Try adding an ETF…</option>
              {extra.map((t) => <option key={t} value={t}>{t} — {ETFS[t]!.name}</option>)}
            </select>
          )}
        </div>
        <div className="space-y-8">
          <CompareChart title="Top companies" data={comp} />
          <CompareChart title="Sectors" data={sect} />
        </div>
      </div>
    </Section>
  );
}

function CompareChart({ title, data }: { title: string; data: { name: string; Current: number; Simulated: number }[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg">{title}</h3>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-chart-1" />Current</span>
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-chart-2" />Simulated</span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} interval={0} angle={-25} textAnchor="end" height={50} />
            <YAxis unit="%" stroke="var(--muted-foreground)" fontSize={11} />
            <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
            <Bar dataKey="Current" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Simulated" fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
