import { Activity, Layers, SlidersHorizontal, Wallet, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AS_OF } from "@/lib/folio/data";
import { cn } from "@/lib/utils";
import { PlanBadge } from "./plan";
import { ThemeToggle } from "./theme";

export const VIEWS = ["holdings", "look-through", "overlap", "what-if"] as const;
export type View = (typeof VIEWS)[number];

const NAV: Record<View, { label: string; icon: LucideIcon }> = {
  holdings: { label: "Holdings", icon: Wallet },
  "look-through": { label: "Exposure", icon: Layers },
  overlap: { label: "Overlap", icon: Activity },
  "what-if": { label: "What-if", icon: SlidersHorizontal },
};

const asOf = new Date(`${AS_OF}T00:00:00`).toLocaleDateString("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function Shell({
  view,
  onView,
  children,
}: {
  view: View;
  onView: (v: View) => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ground">
      <nav
        aria-label="Sections"
        className="fixed inset-y-0 left-0 z-30 hidden w-[96px] flex-col items-center border-r border-border bg-surface py-5 md:flex"
      >
        <img
          src="/FolioBuddy.png?v=2"
          alt="FolioBuddy"
          width={40}
          height={40}
          className="mb-8 h-10 w-10 scale-[1.28] [clip-path:inset(11%_round_9px)]"
        />
        <ul className="flex flex-col gap-2">
          {VIEWS.map((v) => {
            const { label, icon: Icon } = NAV[v];
            const active = v === view;
            return (
              <li key={v}>
                <button
                  onClick={() => onView(v)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex w-[84px] flex-col whitespace-nowrap items-center gap-1 rounded-[12px] py-2.5 text-xs font-semibold transition-colors",
                    active
                      ? "bg-muted text-ink"
                      : "text-muted-foreground hover:bg-raised hover:text-ink",
                  )}
                >
                  <Icon
                    aria-hidden
                    className="h-5 w-5 transition-transform duration-200 group-active:scale-90"
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface px-4 md:hidden">
        <img
          src="/FolioBuddy.png?v=2"
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 scale-[1.28] [clip-path:inset(11%_round_6px)]"
        />
        <span className="text-[17px] font-semibold">FolioBuddy</span>
        <PlanBadge className="ml-auto" />
        <ThemeToggle />
      </header>

      <div className="md:pl-[96px]">
        <main className="mx-auto max-w-[1120px] px-4 pt-6 pb-28 sm:px-6 md:px-8 md:pt-10 md:pb-16">
          <div className="mb-8 hidden items-center justify-between md:flex">
            <span className="text-lg font-semibold">FolioBuddy</span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              Holdings data as of {asOf}
              <PlanBadge className="ml-2" />
              <ThemeToggle />
            </span>
          </div>
          {children}
        </main>
      </div>

      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {VIEWS.map((v) => {
          const { label, icon: Icon } = NAV[v];
          const active = v === view;
          return (
            <button
              key={v}
              onClick={() => onView(v)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors",
                active ? "text-ink" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-12 place-items-center rounded-full transition-colors",
                  active && "bg-muted",
                )}
              >
                <Icon aria-hidden className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
              </span>
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
