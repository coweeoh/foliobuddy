import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { ETFS } from "@/lib/folio/data";
import { lookThrough, type Exposure } from "@/lib/folio/engine";
import { cn } from "@/lib/utils";
import { PremiumTag, usePlan } from "./plan";
import {
  Card,
  CardHeader,
  Chip,
  Notice,
  pct,
  PageTitle,
  SecondaryButton,
  TextButton,
  type HueOf,
} from "./shared";

const TOP = 12;

export function ExposureView({ w, hueOf }: { w: Record<string, number>; hueOf: HueOf }) {
  const { companies, sectors, unknown } = useMemo(() => lookThrough(w), [w]);
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const held = Object.keys(w);
  const shown = showAll ? companies : companies.slice(0, TOP);
  const max = companies[0]?.weight ?? 1;
  const top5 = companies.slice(0, 5).reduce((s, c) => s + c.weight, 0);
  const overlapped = companies.filter((c) => Object.keys(c.sources).length > 1);
  const named = companies.reduce((s, c) => s + c.weight, 0);
  const lead = companies[0];

  return (
    <>
      <PageTitle
        title="What you really own"
        sub={
          lead ? (
            <>
              Looking through your funds, your biggest company is{" "}
              <b className="font-semibold text-ink">{lead.name}</b> at{" "}
              <b className="num font-semibold text-ink">{pct(lead.weight)}</b> of everything you
              hold, and your top five add up to{" "}
              <b className="num font-semibold text-ink">{pct(top5)}</b>.
            </>
          ) : (
            "Add holdings to see the companies inside them."
          )
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card style={{ ["--i" as string]: 1 }}>
          <CardHeader
            title="Companies"
            sub={`Share of your whole portfolio in each company, coloured by the holding it comes through. Named companies cover ${pct(named, 0)}; the rest is each fund's long tail.`}
          />
          <ul
            className="flex flex-wrap gap-x-5 gap-y-1.5 px-6 pb-4 text-sm"
            aria-label="Colour key"
          >
            {held.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <i
                  aria-hidden
                  className="h-2 w-2 rounded-full"
                  style={{ background: hueOf(t).mark }}
                />
                {t}
              </li>
            ))}
          </ul>
          <ol className="pb-2">
            {shown.map((c, i) => (
              <CompanyRow
                key={c.ticker}
                c={c}
                rank={i + 1}
                max={max}
                order={held}
                hueOf={hueOf}
                open={open === c.ticker}
                onToggle={() => setOpen(open === c.ticker ? null : c.ticker)}
              />
            ))}
          </ol>
          {companies.length > TOP && (
            <div className="border-t border-rule px-6 py-4">
              <TextButton onClick={() => setShowAll(!showAll)}>
                {showAll ? `Show top ${TOP} only` : `Show all ${companies.length} companies`}
              </TextButton>
            </div>
          )}
        </Card>

        <div className="grid gap-6">
          <Card style={{ ["--i" as string]: 2 }}>
            <CardHeader
              title="Overlap"
              sub={
                overlapped.length
                  ? `${overlapped.length} ${overlapped.length === 1 ? "company reaches" : "companies reach"} you through more than one holding.`
                  : held.length > 1
                    ? "None of your holdings share a named company."
                    : "Overlap appears once you hold two or more positions."
              }
            />
            {overlapped.length > 0 && (
              <ul className="px-6 pb-5">
                {overlapped.slice(0, 6).map((c) => (
                  <li
                    key={c.ticker}
                    className="flex items-start justify-between gap-3 border-t border-rule py-3 first:border-0 first:pt-0"
                  >
                    <span className="min-w-0">
                      <span className="block text-[15px] font-semibold">{c.name}</span>
                      <span className="mt-1.5 flex flex-wrap gap-1.5">
                        {held
                          .filter((t) => c.sources[t])
                          .map((t) => (
                            <Chip key={t} h={hueOf(t)}>
                              {t}
                            </Chip>
                          ))}
                      </span>
                    </span>
                    <span className="num pt-0.5 text-[15px] font-semibold">{pct(c.weight)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card style={{ ["--i" as string]: 3 }}>
            <CardHeader
              title="Sectors"
              sub="Across every company inside your funds, including the long tail."
            />
            <ul className="space-y-3.5 px-6 pb-6">
              {sectors
                .filter((s) => s.weight > 0.0005)
                .map((s, i) => (
                  <li key={s.sector}>
                    <div className="flex justify-between text-[15px]">
                      <span>{s.sector}</span>
                      <span className="num font-semibold">{pct(s.weight)}</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-muted">
                      <div
                        className="grow h-full rounded-full transition-[width] duration-500"
                        style={{
                          width: `${(s.weight / (sectors[0]?.weight || 1)) * 100}%`,
                          background:
                            s.sector === "Unclassified" ? "var(--bar-muted)" : "var(--bar)",
                          ["--i" as string]: i,
                        }}
                      />
                    </div>
                  </li>
                ))}
            </ul>
          </Card>

          <MonitorCard companies={companies} sectors={sectors} />

          {unknown.length > 0 && (
            <Notice>
              {unknown.join(", ")} {unknown.length === 1 ? "isn't" : "aren't"} in our data, so{" "}
              {unknown.length === 1 ? "it's" : "they're"} counted as a single stock with an unknown
              sector.
            </Notice>
          )}
        </div>
      </div>
    </>
  );
}

const MONITOR_KEY = "foliobuddy:monitor";
type Monitor = { on: boolean; company: number; sector: number };
const MONITOR_DEFAULT: Monitor = { on: true, company: 0.1, sector: 0.4 };

function MonitorCard({
  companies,
  sectors,
}: {
  companies: Exposure[];
  sectors: { sector: string; weight: number }[];
}) {
  const { isPremium, openPlans } = usePlan();
  const [cfg, setCfg] = useState<Monitor>(MONITOR_DEFAULT);
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(MONITOR_KEY) ?? "null",
      ) as Partial<Monitor> | null;
      if (saved) setCfg({ ...MONITOR_DEFAULT, ...saved });
    } catch {
      // Keep the defaults.
    }
  }, []);
  const update = (patch: Partial<Monitor>) => {
    const next = { ...cfg, ...patch };
    setCfg(next);
    localStorage.setItem(MONITOR_KEY, JSON.stringify(next));
  };

  const flags = [
    ...companies
      .filter((c) => c.weight > cfg.company)
      .map((c) => ({ name: c.name, weight: c.weight, limit: cfg.company })),
    ...sectors
      .filter((s) => s.sector !== "Unclassified" && s.weight > cfg.sector)
      .map((s) => ({ name: `${s.sector} sector`, weight: s.weight, limit: cfg.sector })),
  ];
  const now = new Date();
  const nextCheck = new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const select =
    "num h-9 rounded-[8px] border border-control bg-surface px-2 text-sm font-semibold text-ink outline-none focus:border-brand";

  if (!isPremium) {
    return (
      <Card style={{ ["--i" as string]: 4 }}>
        <CardHeader title="Exposure monitoring" aside={<PremiumTag />} />
        <div className="px-6 pb-6">
          <p className="text-[15px] text-muted-foreground">
            A monthly check that flags when one company or sector grows past a limit you set.
          </p>
          {flags.length > 0 && (
            <p className="mt-3 text-[15px]">
              Today it would flag{" "}
              <b className="font-semibold">
                {flags[0]!.name} at <span className="num">{pct(flags[0]!.weight)}</span>
              </b>
              {flags.length > 1 ? ` and ${flags.length - 1} more` : ""}.
            </p>
          )}
          <SecondaryButton
            className="mt-4"
            onClick={() =>
              openPlans(
                "Exposure monitoring is part of Premium: monthly checks against limits you set.",
              )
            }
          >
            See Premium
          </SecondaryButton>
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ ["--i" as string]: 4 }}>
      <CardHeader
        title="Exposure monitoring"
        aside={
          <Switch
            checked={cfg.on}
            onCheckedChange={(on) => update({ on })}
            aria-label="Monthly exposure check"
          />
        }
        sub={cfg.on ? `Monthly check on. Next check ${nextCheck}.` : "Monthly check off."}
      />
      <div className={cn("space-y-3 px-6 pb-5", !cfg.on && "opacity-50")}>
        <label className="flex items-center justify-between gap-3 text-[15px]">
          Any one company above
          <select
            className={select}
            value={cfg.company}
            disabled={!cfg.on}
            onChange={(e) => update({ company: Number(e.target.value) })}
          >
            {[0.05, 0.1, 0.15, 0.2].map((v) => (
              <option key={v} value={v}>
                {pct(v, 0)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center justify-between gap-3 text-[15px]">
          Any one sector above
          <select
            className={select}
            value={cfg.sector}
            disabled={!cfg.on}
            onChange={(e) => update({ sector: Number(e.target.value) })}
          >
            {[0.3, 0.4, 0.5, 0.6].map((v) => (
              <option key={v} value={v}>
                {pct(v, 0)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {cfg.on && (
        <ul className="border-t border-rule px-6 py-4">
          {flags.length ? (
            flags.map((f) => (
              <li key={f.name} className="flex justify-between gap-3 py-1 text-[15px]">
                <span>{f.name}</span>
                <span className="num font-semibold text-warning">
                  {pct(f.weight)} <span className="font-normal">over {pct(f.limit, 0)}</span>
                </span>
              </li>
            ))
          ) : (
            <li className="text-[15px] text-muted-foreground">
              Nothing is over your limits today.
            </li>
          )}
        </ul>
      )}
    </Card>
  );
}

function CompanyRow({
  c,
  rank,
  max,
  order,
  hueOf,
  open,
  onToggle,
}: {
  c: Exposure;
  rank: number;
  max: number;
  order: string[];
  hueOf: HueOf;
  open: boolean;
  onToggle: () => void;
}) {
  const src = order.filter((t) => c.sources[t]);
  return (
    <li>
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="group grid w-full grid-cols-[1.75rem_minmax(0,1fr)_4.5rem] items-center gap-x-3 gap-y-2 px-6 py-2.5 text-left transition-colors hover:bg-raised sm:grid-cols-[1.75rem_11rem_minmax(0,1fr)_4.5rem]"
      >
        <span className="num text-sm text-muted-foreground">{rank}.</span>
        <span className="min-w-0 truncate text-[15px]">
          <b className="font-semibold">{c.ticker}</b>{" "}
          <span className="text-muted-foreground">{c.name}</span>
        </span>
        <span className="col-span-3 col-start-1 row-start-2 sm:col-span-1 sm:col-start-3 sm:row-start-1">
          <span
            className="flex h-3 gap-[2px] overflow-hidden rounded-full transition-[width] duration-500"
            style={{ width: `${Math.max(2, (c.weight / max) * 100)}%` }}
          >
            {src.map((t, i) => (
              <span
                key={t}
                className="grow block h-full"
                style={{
                  flex: `${c.sources[t]! / c.weight} 1 0`,
                  background: hueOf(t).mark,
                  ["--i" as string]: rank + i,
                }}
              />
            ))}
          </span>
        </span>
        <span className="num col-start-3 row-start-1 flex items-center justify-end gap-1 text-[15px] font-semibold sm:col-start-4">
          {pct(c.weight, 2)}
          <ChevronDown
            aria-hidden
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </span>
      </button>
      {open && (
        <div className="flex flex-wrap items-center gap-2 px-6 pt-1 pb-3 text-sm text-muted-foreground sm:pl-[3.5rem]">
          {src.map((t, i) => (
            <span key={t} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden>+</span>}
              <Chip h={hueOf(t)}>
                {t} {ETFS[t] ? "" : "direct "}
                {pct(c.sources[t]!, 2)}
              </Chip>
            </span>
          ))}
        </div>
      )}
    </li>
  );
}
