import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ExposureView } from "@/components/folio/ExposureView";
import { HoldingsView } from "@/components/folio/HoldingsView";
import { OverlapView } from "@/components/folio/OverlapView";
import { PlanProvider, usePlan } from "@/components/folio/plan";
import { hue, PrimaryButton, PageTitle, Card } from "@/components/folio/shared";
import { Shell, VIEWS, type View } from "@/components/folio/Shell";
import { WhatIfView } from "@/components/folio/WhatIfView";
import { AS_OF, ETFS, SECURITIES } from "@/lib/folio/data";
import { DAYS, weights, type Portfolio, type Position } from "@/lib/folio/engine";
import { capEtfs } from "@/lib/folio/plan";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { view?: View } => {
    const v = search["view"] as View;
    return VIEWS.includes(v) && v !== "holdings" ? { view: v } : {};
  },
  head: () => ({
    meta: [
      { title: "FolioBuddy — See what your ETFs really own" },
      {
        name: "description",
        content:
          "Look through your ETFs to reveal hidden company and sector overlap, return correlations, and what-if allocations.",
      },
      { property: "og:title", content: "FolioBuddy — See what your ETFs really own" },
      {
        property: "og:description",
        content:
          "Portfolio look-through, overlap, correlation and allocation simulation for retail investors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SAMPLE: Position[] = [
  { ticker: "SPY", amount: 5000 },
  { ticker: "QQQ", amount: 3000 },
  { ticker: "VTI", amount: 2000 },
  { ticker: "NVDA", amount: 1000 },
];
const LEGACY_STORE = "foliobuddy:positions";
const STORE = "foliobuddy:portfolios";
const KNOWN = [...Object.keys(ETFS), ...Object.keys(SECURITIES)];
const FIRST: Portfolio = { id: "main", name: "Main portfolio", positions: SAMPLE };

function cleanPositions(raw: unknown): Position[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p): p is Position => typeof p?.ticker === "string" && typeof p?.amount === "number")
    .map((p) => ({ ticker: p.ticker.toUpperCase().slice(0, 8), amount: Math.max(0, p.amount) }));
}

function loadPortfolios(): { list: Portfolio[]; active: string } | null {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) {
      const parsed = JSON.parse(raw) as { list?: unknown; active?: unknown };
      const list = (Array.isArray(parsed.list) ? parsed.list : [])
        .filter((p): p is Portfolio => typeof p?.id === "string" && typeof p?.name === "string")
        .map((p) => ({
          id: p.id,
          name: p.name.slice(0, 40),
          positions: cleanPositions(p.positions),
        }));
      if (list.length) {
        const active = list.some((p) => p.id === parsed.active)
          ? (parsed.active as string)
          : list[0]!.id;
        return { list, active };
      }
    }
    const legacy = localStorage.getItem(LEGACY_STORE);
    if (legacy)
      return {
        list: [{ ...FIRST, positions: cleanPositions(JSON.parse(legacy)) }],
        active: FIRST.id,
      };
  } catch {
    // Fall through to the sample portfolio.
  }
  return null;
}

function Index() {
  return (
    <PlanProvider>
      <App />
    </PlanProvider>
  );
}

function App() {
  const { view = "holdings" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { isPremium, limits } = usePlan();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([FIRST]);
  const [activeId, setActiveId] = useState(FIRST.id);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadPortfolios();
    if (saved) {
      setPortfolios(saved.list);
      setActiveId(saved.active);
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(STORE, JSON.stringify({ list: portfolios, active: activeId }));
  }, [portfolios, activeId, loaded]);

  // Free opens only the first portfolio; the others stay saved for when Premium returns.
  const active = (isPremium && portfolios.find((p) => p.id === activeId)) || portfolios[0]!;
  const positions = active.positions;
  const setPositions = (next: Position[]) =>
    setPortfolios((list) => list.map((p) => (p.id === active.id ? { ...p, positions: next } : p)));
  const createPortfolio = () => {
    const id = `p${Date.now().toString(36)}`;
    setPortfolios((list) => [...list, { id, name: `Portfolio ${list.length + 1}`, positions: [] }]);
    setActiveId(id);
  };
  const deletePortfolio = (id: string) => {
    const rest = portfolios.filter((p) => p.id !== id);
    if (!rest.length) return;
    setPortfolios(rest);
    if (id === active.id) setActiveId(rest[0]!.id);
  };

  const { included, excluded } = useMemo(
    () => capEtfs(positions, limits.etfs),
    [positions, limits.etfs],
  );
  const w = useMemo(() => weights(included), [included]);
  const tickers = Object.keys(w);
  const order = useMemo(
    () => [...new Set(positions.map((p) => p.ticker).filter(Boolean))],
    [positions],
  );
  const extra = useMemo(() => Object.keys(ETFS).filter((t) => !order.includes(t)), [order]);
  const hueOf = (t: string) => {
    const i = order.indexOf(t);
    return hue(i >= 0 ? i : order.length + extra.indexOf(t));
  };

  const go = (v: View) => {
    navigate({ search: v === "holdings" ? {} : { view: v } });
    window.scrollTo({ top: 0 });
  };

  const needsHoldings = view !== "holdings" && tickers.length === 0;

  return (
    <Shell view={view} onView={go}>
      <div key={view}>
        {view === "holdings" && (
          <HoldingsView
            positions={positions}
            setPositions={setPositions}
            w={w}
            excluded={excluded}
            hueOf={hueOf}
            onNext={() => go("look-through")}
            onSample={() => setPositions(SAMPLE)}
            portfolios={portfolios}
            activeId={active.id}
            onSwitch={setActiveId}
            onCreate={createPortfolio}
            onDelete={deletePortfolio}
          />
        )}
        {needsHoldings && (
          <>
            <PageTitle
              title="Nothing to look through yet"
              sub="Add at least one holding with an amount, and this view fills in."
            />
            <Card className="p-6">
              <PrimaryButton onClick={() => go("holdings")}>Go to your holdings</PrimaryButton>
            </Card>
          </>
        )}
        {!needsHoldings && view === "look-through" && <ExposureView w={w} hueOf={hueOf} />}
        {!needsHoldings && view === "overlap" && <OverlapView tickers={tickers} hueOf={hueOf} />}
        {!needsHoldings && view === "what-if" && (
          <WhatIfView key={`${active.id}-${loaded}`} w={w} hueOf={hueOf} />
        )}
      </div>

      <footer className="mt-14 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
        FolioBuddy is for information only. It isn't investment advice and doesn't place trades.
        Fund holdings are approximate top constituents as of {AS_OF}; the rest of each fund is
        spread across sectors by its published allocation. Correlations use simulated sample returns
        in this prototype ({DAYS} trading days on Free). Plans and upgrades are a demo: no payment
        is taken. {KNOWN.length} tickers are in the dataset; any other ticker is counted as a single
        stock.
      </footer>
    </Shell>
  );
}
