import { ArrowRight, ChevronDown, Lock, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ETFS, SECURITIES } from "@/lib/folio/data";
import { lookThrough, type Portfolio, type Position } from "@/lib/folio/engine";
import { cn } from "@/lib/utils";
import { PremiumTag, usePlan } from "./plan";
import {
  Card,
  CardHeader,
  Chip,
  money,
  nameOf,
  pct,
  PageTitle,
  PrimaryButton,
  SecondaryButton,
  TextButton,
  TickerTile,
  type HueOf,
} from "./shared";
import { TickerPicker } from "./TickerPicker";

export function HoldingsView({
  positions,
  setPositions,
  w,
  excluded,
  hueOf,
  onNext,
  onSample,
  portfolios,
  activeId,
  onSwitch,
  onCreate,
  onDelete,
}: {
  positions: Position[];
  setPositions: (p: Position[]) => void;
  w: Record<string, number>;
  excluded: string[];
  hueOf: HueOf;
  onNext: () => void;
  onSample: () => void;
  portfolios: Portfolio[];
  activeId: string;
  onSwitch: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}) {
  const { isPremium, limits, openPlans } = usePlan();
  const [focusRow, setFocusRow] = useState<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const total = positions.reduce(
    (s, p) => s + (p.ticker && p.amount > 0 && !excluded.includes(p.ticker) ? p.amount : 0),
    0,
  );
  const held = Object.keys(w);
  const { companies, sectors } = useMemo(() => lookThrough(w), [w]);
  const namedSectors = sectors.filter(
    (s) => s.sector !== "Unclassified" && s.weight > 0.001,
  ).length;

  useEffect(() => {
    if (focusRow === null) return;
    const el = listRef.current?.querySelector<HTMLInputElement>(`[data-amount="${focusRow}"]`);
    el?.focus();
    el?.select();
    setFocusRow(null);
  }, [focusRow]);

  const update = (i: number, patch: Partial<Position>) =>
    setPositions(positions.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const add = (ticker: string) => {
    setPositions([...positions, { ticker, amount: 1000 }]);
    setFocusRow(positions.length);
  };

  return (
    <>
      <PageTitle
        title="Your holdings"
        sub="Add the ETFs and stocks you own with how much is in each. We look inside every fund to show what you actually own."
      />

      <div
        className="rise mb-6 flex flex-wrap items-center gap-2"
        aria-label="Portfolios"
        style={{ ["--i" as string]: 1 }}
      >
        {portfolios.map((p, i) => {
          const locked = i >= limits.portfolios;
          const current = p.id === activeId;
          return (
            <button
              key={p.id}
              aria-pressed={current}
              onClick={() =>
                locked
                  ? openPlans("Free includes one portfolio. Premium keeps as many as you like.")
                  : onSwitch(p.id)
              }
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors",
                current
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-ink hover:bg-secondary-hover",
                locked && "text-muted-foreground",
              )}
            >
              {locked && <Lock aria-hidden className="h-3.5 w-3.5" />}
              {p.name}
            </button>
          );
        })}
        <button
          onClick={() =>
            portfolios.length < limits.portfolios
              ? onCreate()
              : openPlans(
                  "Free includes one portfolio. Premium lets you analyse several, like a retirement account and a trading account.",
                )
          }
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-dashed border-control px-4 text-sm font-semibold text-muted-foreground transition-colors hover:border-control-hover hover:text-ink"
        >
          <Plus aria-hidden className="h-4 w-4" /> New portfolio
          {!isPremium && <PremiumTag />}
        </button>
      </div>

      <div className="grid gap-6">
        <Card className="p-6" style={{ ["--i" as string]: 1 }}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-[15px] font-medium text-muted-foreground">Total invested</h2>
              <p className="num mt-1 text-[36px] leading-none font-semibold tracking-[-0.02em]">
                {money(total)}
              </p>
              <p className="mt-3 text-[15px] text-muted-foreground">
                {held.length ? (
                  <>
                    {held.length} {held.length === 1 ? "holding" : "holdings"} ·{" "}
                    <span className="text-ink">{companies.length} named companies</span> across{" "}
                    {namedSectors} sectors underneath
                  </>
                ) : (
                  "Add a holding with an amount to get started"
                )}
              </p>
            </div>
            <PrimaryButton
              onClick={onNext}
              disabled={!held.length}
              className="self-start lg:self-auto"
            >
              See what you really own <ArrowRight aria-hidden className="h-4 w-4" />
            </PrimaryButton>
          </div>

          {held.length > 0 && (
            <div className="mt-6">
              <div
                className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full"
                role="img"
                aria-label={held.map((t) => `${t} ${pct(w[t]!)}`).join(", ")}
              >
                {held.map((t, i) => (
                  <div
                    key={t}
                    className="grow h-full transition-[flex-grow] duration-500"
                    style={{ flex: `${w[t]} 1 0`, background: hueOf(t).mark, ["--i" as string]: i }}
                  />
                ))}
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
                {held.map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <i
                      aria-hidden
                      className="h-2 w-2 rounded-full"
                      style={{ background: hueOf(t).mark }}
                    />
                    <span className="font-semibold">{t}</span>
                    <span className="num text-muted-foreground">{pct(w[t]!)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card style={{ ["--i" as string]: 2 }}>
          <CardHeader
            title="Positions"
            aside={
              <TickerPicker onPick={add} label="Add a holding">
                <SecondaryButton>
                  <Plus aria-hidden className="h-4 w-4" /> Add holding
                </SecondaryButton>
              </TickerPicker>
            }
          />

          {positions.length === 0 ? (
            <div className="mx-6 mb-6 rounded-[10px] border border-dashed border-control px-5 py-8 text-center">
              <p className="text-base font-semibold">No holdings yet</p>
              <p className="mt-1 text-[15px] text-muted-foreground">
                Add your first ETF or stock, or start from a typical mix.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <TickerPicker onPick={add} label="Add your first holding">
                  <PrimaryButton>
                    <Plus aria-hidden className="h-4 w-4" /> Add a holding
                  </PrimaryButton>
                </TickerPicker>
                <SecondaryButton onClick={onSample} className="h-11">
                  Use a sample portfolio
                </SecondaryButton>
              </div>
            </div>
          ) : (
            <>
              {excluded.length > 0 && (
                <div className="mx-6 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[var(--warning-border)] bg-warning-soft px-4 py-3 text-sm text-warning">
                  <p className="min-w-0 flex-1">
                    Free analyses up to {limits.etfs} ETFs per portfolio, so{" "}
                    <b className="font-semibold">{excluded.join(", ")}</b>{" "}
                    {excluded.length === 1 ? "isn't" : "aren't"} in your results yet.
                  </p>
                  <SecondaryButton
                    className="h-9 shrink-0"
                    onClick={() =>
                      openPlans(
                        `Free analyses up to ${limits.etfs} ETFs per portfolio. Premium includes every fund you hold.`,
                      )
                    }
                  >
                    See Premium
                  </SecondaryButton>
                </div>
              )}
              <div className="hidden grid-cols-[minmax(0,1fr)_10rem_5rem_2.5rem] gap-4 px-6 pb-2 text-xs font-medium text-muted-foreground sm:grid">
                <span>Holding</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Share</span>
                <span />
              </div>
              <ul ref={listRef} className="pb-2">
                {positions.map((p, i) => (
                  <Row
                    key={i}
                    index={i}
                    p={p}
                    share={w[p.ticker]}
                    capped={excluded.includes(p.ticker)}
                    hueOf={hueOf}
                    onTicker={(ticker) => update(i, { ticker })}
                    onAmount={(amount) => update(i, { amount })}
                    onRemove={() => setPositions(positions.filter((_, j) => j !== i))}
                  />
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-rule px-6 py-4">
                <span className="text-sm text-muted-foreground">
                  Changes save on this device automatically.
                </span>
                <span className="flex shrink-0 gap-4">
                  {isPremium && portfolios.length > 1 && (
                    <TextButton onClick={() => onDelete(activeId)}>Delete portfolio</TextButton>
                  )}
                  <TextButton onClick={() => setPositions([])}>Clear all</TextButton>
                </span>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}

function Row({
  index,
  p,
  share,
  capped,
  hueOf,
  onTicker,
  onAmount,
  onRemove,
}: {
  index: number;
  p: Position;
  share: number | undefined;
  capped: boolean;
  hueOf: HueOf;
  onTicker: (t: string) => void;
  onAmount: (n: number) => void;
  onRemove: () => void;
}) {
  const fund = ETFS[p.ticker];
  const stock = SECURITIES[p.ticker];
  const name = nameOf(p.ticker);
  const h = hueOf(p.ticker);
  const detail = fund
    ? `ETF · ${Object.keys(fund.holdings).length} top holdings`
    : stock
      ? `Stock · ${stock.sector}`
      : null;

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_4.5rem_2.5rem] items-center gap-x-4 gap-y-2 px-5 py-3 transition-colors hover:bg-raised sm:grid-cols-[minmax(0,1fr)_10rem_5rem_2.5rem] sm:gap-y-3 sm:px-6">
      <TickerPicker onPick={onTicker} label={`Change ${p.ticker || "ticker"}`}>
        <button className="group col-span-2 flex min-w-0 items-center gap-4 rounded-[10px] text-left sm:col-span-1">
          <TickerTile ticker={p.ticker} h={h} />
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 text-base font-semibold">
              {p.ticker || "Choose a ticker"}
              <ChevronDown
                aria-hidden
                className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-y-0.5"
              />
            </span>
            <span className="block truncate text-sm text-muted-foreground">
              {name}
              {detail ? <span className="hidden sm:inline"> · {detail}</span> : null}
            </span>
            {p.ticker && !name && (
              <Chip
                h={{ mark: "", soft: "var(--warning-soft)", ink: "var(--warning)" }}
                className="mt-1"
              >
                Not in our data · counted as a single stock
              </Chip>
            )}
            {capped && (
              <Chip
                h={{ mark: "", soft: "var(--warning-soft)", ink: "var(--warning)" }}
                className="mt-1"
              >
                Over the Free ETF limit · not analysed
              </Chip>
            )}
          </span>
        </button>
      </TickerPicker>

      <button
        aria-label={`Remove ${p.ticker || "row"}`}
        onClick={onRemove}
        className="col-start-3 row-start-1 grid h-10 w-10 place-items-center justify-self-end rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-ink sm:col-start-4"
      >
        <X aria-hidden className="h-4 w-4" />
      </button>

      <label className="col-start-1 row-start-2 ml-[60px] block sm:col-start-2 sm:row-start-1 sm:ml-0">
        <span className="sr-only">Amount for {p.ticker || "this holding"}</span>
        <span className="relative block w-full">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-muted-foreground"
          >
            $
          </span>
          <input
            data-amount={index}
            type="number"
            inputMode="decimal"
            min={0}
            step={100}
            value={p.amount || ""}
            placeholder="0"
            onChange={(e) => onAmount(Math.max(0, Number(e.target.value)))}
            className="num h-11 w-full rounded-[10px] border border-control bg-surface pr-3 pl-7 text-right text-base font-medium outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 hover:border-control-hover focus:border-brand focus:shadow-[0_0_0_3px_var(--brand-soft)] focus-visible:outline-none"
          />
        </span>
      </label>

      <span className="num col-start-2 row-start-2 text-right text-base font-semibold sm:col-start-3 sm:row-start-1">
        <span className="sr-only">Share of portfolio </span>
        {share ? pct(share) : <span className="text-muted-foreground">—</span>}
      </span>
    </li>
  );
}
