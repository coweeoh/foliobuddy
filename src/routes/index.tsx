import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ExposureView } from "@/components/folio/ExposureView";
import { HoldingsView } from "@/components/folio/HoldingsView";
import { OverlapView } from "@/components/folio/OverlapView";
import { hue, PrimaryButton, PageTitle, Card } from "@/components/folio/shared";
import { Shell, VIEWS, type View } from "@/components/folio/Shell";
import { WhatIfView } from "@/components/folio/WhatIfView";
import { AS_OF, ETFS, SECURITIES } from "@/lib/folio/data";
import { DAYS, weights, type Position } from "@/lib/folio/engine";

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
const STORE = "foliobuddy:positions";
const KNOWN = [...Object.keys(ETFS), ...Object.keys(SECURITIES)];

function loadPositions(): Position[] | null {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed
      .filter((p): p is Position => typeof p?.ticker === "string" && typeof p?.amount === "number")
      .map((p) => ({ ticker: p.ticker.toUpperCase().slice(0, 8), amount: Math.max(0, p.amount) }));
  } catch {
    return null;
  }
}

function Index() {
  const { view = "holdings" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [positions, setPositions] = useState<Position[]>(SAMPLE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadPositions();
    if (saved) setPositions(saved);
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(STORE, JSON.stringify(positions));
  }, [positions, loaded]);

  const w = useMemo(() => weights(positions), [positions]);
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
            hueOf={hueOf}
            onNext={() => go("look-through")}
            onSample={() => setPositions(SAMPLE)}
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
        {!needsHoldings && view === "what-if" && <WhatIfView w={w} hueOf={hueOf} />}
      </div>

      <footer className="mt-14 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
        FolioBuddy is for information only. It isn't investment advice and doesn't place trades.
        Fund holdings are approximate top constituents as of {AS_OF}; the rest of each fund is
        spread across sectors by its published allocation. Correlations use {DAYS} days of simulated
        sample returns in this prototype. {KNOWN.length} tickers are in the dataset; any other
        ticker is counted as a single stock.
      </footer>
    </Shell>
  );
}
