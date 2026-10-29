import { useEffect, useMemo, useRef, useState } from "react";
import type { Exposure } from "@/lib/folio/engine";
import { pct, type HueOf } from "./shared";

const OTHER = "__other";
const TAIL = "__tail";
const SLOT = 38;
const GAP = 6;

type Node = { key: string; label: string; v: number; y: number; h: number; slot: number };
type Ribbon = { from: string; to: string; v: number; ly: number; ry: number; t: number };

function stack(items: { key: string; label: string; v: number }[], k: number) {
  let y = 0;
  return items.map((it) => {
    const h = Math.max(it.v * k, 1.5);
    const slot = Math.max(h, SLOT);
    const node: Node = { ...it, h, slot, y: y + (slot - h) / 2 };
    y += slot + GAP;
    return node;
  });
}
const height = (nodes: Node[]) =>
  nodes.length
    ? nodes.at(-1)!.y - (nodes.at(-1)!.slot - nodes.at(-1)!.h) / 2 + nodes.at(-1)!.slot
    : 0;

export function LookThroughFlow({
  w,
  companies,
  hueOf,
}: {
  w: Record<string, number>;
  companies: Exposure[];
  hueOf: HueOf;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [focus, setFocus] = useState<string | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e!.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const narrow = width > 0 && width < 620;
  const n = narrow ? 5 : 8;

  const layout = useMemo(() => {
    const holdings = Object.keys(w).sort((a, b) => w[b]! - w[a]!);
    const top = companies.slice(0, n);
    const rest = companies.slice(n);
    const v = (h: string, to: string) => {
      if (to === OTHER) return rest.reduce((s, c) => s + (c.sources[h] ?? 0), 0);
      if (to === TAIL)
        return Math.max(0, w[h]! - companies.reduce((s, c) => s + (c.sources[h] ?? 0), 0));
      return companies.find((c) => c.ticker === to)?.sources[h] ?? 0;
    };
    const rightItems = [
      ...top.map((c) => ({ key: c.ticker, label: c.name, v: c.weight })),
      {
        key: OTHER,
        label: narrow ? `+${rest.length} more` : `${rest.length} more companies`,
        v: rest.reduce((s, c) => s + c.weight, 0),
      },
      {
        key: TAIL,
        label: narrow ? "Rest of funds" : "Rest of each fund",
        v: holdings.reduce((s, h) => s + v(h, TAIL), 0),
      },
    ].filter((x) => x.v > 0.0005);

    const leftItems = holdings.map((h) => ({ key: h, label: h, v: w[h]! }));
    const k = narrow ? 230 : 270;
    const left = stack(leftItems, k);
    const right = stack(rightItems, k);
    const H = Math.max(height(left), height(right));
    const offL = (H - height(left)) / 2;
    const offR = (H - height(right)) / 2;
    left.forEach((x) => (x.y += offL));
    right.forEach((x) => (x.y += offR));

    const lCursor = Object.fromEntries(left.map((x) => [x.key, x.y]));
    const rCursor = Object.fromEntries(right.map((x) => [x.key, x.y]));
    const ribbons: Ribbon[] = [];
    for (const l of left)
      for (const r of right) {
        const val = v(l.key, r.key);
        if (val <= 0) continue;
        const t = val * k;
        ribbons.push({
          from: l.key,
          to: r.key,
          v: val,
          ly: lCursor[l.key]!,
          ry: rCursor[r.key]!,
          t,
        });
        lCursor[l.key]! += t;
        rCursor[r.key]! += t;
      }
    return { left, right, ribbons, H };
  }, [w, companies, n, narrow]);

  const leftW = narrow ? 58 : 96;
  const rightW = narrow ? 132 : 230;
  const bar = 10;
  const x0 = leftW + bar;
  const x1 = Math.max(x0 + 40, width - rightW - bar);
  const mid = (x0 + x1) / 2;

  const lit = (r: Ribbon) => !focus || r.from === focus || r.to === focus;
  const neutral = (key: string) =>
    key === TAIL ? "var(--flow-tail)" : key === OTHER ? "var(--flow-other)" : "var(--text)";

  return (
    <div
      ref={box}
      className="relative w-full"
      style={{ minHeight: width ? undefined : 380 }}
      onMouseLeave={() => setFocus(null)}
    >
      {width > 0 && (
        <svg
          width={width}
          height={layout.H + 4}
          role="group"
          aria-label="How your holdings flow into the companies inside them"
          className="block overflow-visible"
        >
          <g className="reveal">
            {layout.ribbons.map((r) => (
              <path
                key={`${r.from}-${r.to}`}
                d={`M${x0},${r.ly} C${mid},${r.ly} ${mid},${r.ry} ${x1},${r.ry} L${x1},${r.ry + r.t} C${mid},${r.ry + r.t} ${mid},${r.ly + r.t} ${x0},${r.ly + r.t} Z`}
                fill={hueOf(r.from).mark}
                style={{
                  opacity: lit(r) ? (focus ? 0.62 : 0.3) : 0.06,
                  transition: "opacity 220ms ease",
                }}
                onMouseEnter={() => setFocus(r.from)}
              >
                <title>{`${r.from} → ${r.to === OTHER ? "other companies" : r.to === TAIL ? "rest of fund" : r.to}: ${pct(r.v, 2)}`}</title>
              </path>
            ))}
          </g>

          {layout.left.map((l) => {
            const h = hueOf(l.key);
            const dim =
              focus &&
              focus !== l.key &&
              !layout.ribbons.some((r) => r.to === focus && r.from === l.key);
            return (
              <g
                key={l.key}
                tabIndex={0}
                role="button"
                aria-label={`${l.key}, ${pct(l.v)} of your portfolio. Highlight its companies.`}
                onMouseEnter={() => setFocus(l.key)}
                onFocus={() => setFocus(l.key)}
                onBlur={() => setFocus(null)}
                onClick={() => setFocus(focus === l.key ? null : l.key)}
                className="cursor-pointer outline-none"
                style={{ opacity: dim ? 0.35 : 1, transition: "opacity 220ms ease" }}
              >
                <rect
                  x={leftW - 4}
                  y={l.y + l.h / 2 - SLOT / 2}
                  width={x0 - leftW + 8}
                  height={SLOT}
                  fill="transparent"
                />
                <rect x={leftW} y={l.y} width={bar} height={l.h} rx={2} fill={h.mark} />
                <text
                  x={leftW - 10}
                  y={l.y + l.h / 2 - 2}
                  textAnchor="end"
                  className="fill-ink text-[14px] font-semibold"
                >
                  {l.key}
                </text>
                <text
                  x={leftW - 10}
                  y={l.y + l.h / 2 + 14}
                  textAnchor="end"
                  className="num fill-muted-foreground text-[12px]"
                >
                  {pct(l.v)}
                </text>
              </g>
            );
          })}

          {layout.right.map((r) => {
            const named = r.key !== OTHER && r.key !== TAIL;
            const dim =
              focus &&
              focus !== r.key &&
              !layout.ribbons.some((x) => x.from === focus && x.to === r.key);
            const cy = r.y + r.h / 2;
            return (
              <g
                key={r.key}
                tabIndex={named ? 0 : -1}
                role={named ? "button" : undefined}
                aria-label={
                  named
                    ? `${r.label}, ${pct(r.v)} of your portfolio. Highlight where it comes from.`
                    : undefined
                }
                onMouseEnter={() => setFocus(r.key)}
                onFocus={() => setFocus(r.key)}
                onBlur={() => setFocus(null)}
                onClick={() => setFocus(focus === r.key ? null : r.key)}
                className="cursor-pointer outline-none"
                style={{ opacity: dim ? 0.35 : 1, transition: "opacity 220ms ease" }}
              >
                <rect
                  x={x1 - 4}
                  y={cy - SLOT / 2}
                  width={rightW + bar}
                  height={SLOT}
                  fill="transparent"
                />
                <rect x={x1} y={r.y} width={bar} height={r.h} rx={2} fill={neutral(r.key)} />
                <text
                  x={x1 + bar + 10}
                  y={cy - 2}
                  className={
                    named
                      ? "fill-ink text-[14px] font-semibold"
                      : "fill-muted-foreground text-[14px]"
                  }
                >
                  {narrow && r.label.length > 15 ? `${r.label.slice(0, 14)}…` : r.label}
                </text>
                <text
                  x={x1 + bar + 10}
                  y={cy + 14}
                  className="num fill-muted-foreground text-[12px]"
                >
                  {pct(r.v)}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
