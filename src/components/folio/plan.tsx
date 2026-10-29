import { Check, Lock, Sparkles } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { FEATURES, LIMITS, monthKey, PREMIUM_PRICE, type Plan } from "@/lib/folio/plan";
import { cn } from "@/lib/utils";
import { PrimaryButton, SecondaryButton, TextButton } from "./shared";

const PLAN_KEY = "foliobuddy:plan";
const SIMS_KEY = "foliobuddy:simulations";

type Ctx = {
  plan: Plan;
  limits: (typeof LIMITS)[Plan];
  isPremium: boolean;
  simsLeft: number;
  /** Counts one what-if comparison. Returns false when the plan has none left. */
  spendSimulation: () => boolean;
  openPlans: (reason?: string) => void;
};

const PlanContext = createContext<Ctx | null>(null);

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

function readSims(): number {
  try {
    const raw = JSON.parse(localStorage.getItem(SIMS_KEY) ?? "null") as {
      month?: string;
      used?: number;
    } | null;
    return raw?.month === monthKey() && typeof raw.used === "number" ? raw.used : 0;
  } catch {
    return 0;
  }
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlanState] = useState<Plan>("free");
  const [simsUsed, setSimsUsed] = useState(0);
  const [dialog, setDialog] = useState<{ open: boolean; reason?: string | undefined }>({
    open: false,
  });

  useEffect(() => {
    if (localStorage.getItem(PLAN_KEY) === "premium") setPlanState("premium");
    setSimsUsed(readSims());
  }, []);

  const setPlan = (p: Plan) => {
    setPlanState(p);
    localStorage.setItem(PLAN_KEY, p);
  };
  const saveSims = (used: number) => {
    setSimsUsed(used);
    localStorage.setItem(SIMS_KEY, JSON.stringify({ month: monthKey(), used }));
  };

  const limits = LIMITS[plan];
  const simsLeft = Math.max(0, limits.simulations - simsUsed);
  const spendSimulation = useCallback(() => {
    if (plan === "premium") return true;
    const used = readSims();
    if (used >= LIMITS.free.simulations) return false;
    saveSims(used + 1);
    return true;
  }, [plan]);
  const openPlans = useCallback((reason?: string) => setDialog({ open: true, reason }), []);

  return (
    <PlanContext.Provider
      value={{ plan, limits, isPremium: plan === "premium", simsLeft, spendSimulation, openPlans }}
    >
      {children}
      <PlansDialog
        open={dialog.open}
        reason={dialog.reason}
        plan={plan}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        onPlan={setPlan}
        onResetUsage={() => saveSims(0)}
      />
    </PlanContext.Provider>
  );
}

function PlansDialog({
  open,
  reason,
  plan,
  onOpenChange,
  onPlan,
  onResetUsage,
}: {
  open: boolean;
  reason?: string | undefined;
  plan: Plan;
  onOpenChange: (open: boolean) => void;
  onPlan: (p: Plan) => void;
  onResetUsage: () => void;
}) {
  const [step, setStep] = useState<"compare" | "checkout" | "done">("compare");
  useEffect(() => {
    if (open) setStep("compare");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-xl gap-0 overflow-y-auto rounded-[20px] border-border bg-surface p-0">
        {step === "compare" && (
          <>
            <header className="px-6 pt-6 pb-4">
              <DialogTitle className="text-[22px] font-semibold tracking-[-0.02em]">
                {plan === "premium" ? "You're on Premium" : "Free and Premium"}
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-[15px] text-muted-foreground">
                {reason ??
                  (plan === "premium"
                    ? "Every limit is lifted. You can switch back to Free at any time."
                    : "Free covers the core look-through. Premium is for investors who review and adjust often.")}
              </DialogDescription>
            </header>

            <table className="w-full text-[15px]">
              <thead>
                <tr className="border-y border-rule text-left text-sm text-muted-foreground">
                  <th className="py-2.5 pl-6 font-medium">Feature</th>
                  <th className={cn("px-3 py-2.5 font-medium", plan === "free" && "text-ink")}>
                    Free
                  </th>
                  <th className={cn("py-2.5 pr-6 font-medium", plan === "premium" && "text-ink")}>
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f) => (
                  <tr key={f.label} className="border-b border-rule last:border-0">
                    <th scope="row" className="py-2.5 pl-6 text-left font-normal">
                      {f.label}
                    </th>
                    <td className="px-3 py-2.5 text-muted-foreground">{f.free}</td>
                    <td className="py-2.5 pr-6 font-semibold">{f.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-rule px-6 py-5">
              {plan === "premium" ? (
                <>
                  <TextButton onClick={() => onPlan("free")}>Switch back to Free</TextButton>
                  <PrimaryButton onClick={() => onOpenChange(false)}>Done</PrimaryButton>
                </>
              ) : (
                <>
                  <p>
                    <span className="num text-[22px] font-semibold">{PREMIUM_PRICE}</span>
                    <span className="text-muted-foreground"> / month</span>
                  </p>
                  <PrimaryButton onClick={() => setStep("checkout")}>
                    <Sparkles aria-hidden className="h-4 w-4" /> Upgrade to Premium
                  </PrimaryButton>
                </>
              )}
            </footer>
            <div className="border-t border-rule px-6 py-3 text-right">
              <TextButton onClick={onResetUsage} className="text-[13px]">
                Reset demo usage
              </TextButton>
            </div>
          </>
        )}

        {step === "checkout" && (
          <div className="p-6">
            <DialogTitle className="text-[22px] font-semibold tracking-[-0.02em]">
              Confirm your upgrade
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-[15px] text-muted-foreground">
              FolioBuddy Premium, billed monthly. Cancel any time.
            </DialogDescription>
            <dl className="mt-5 rounded-[14px] border border-border">
              <div className="flex justify-between px-4 py-3">
                <dt>Premium (monthly)</dt>
                <dd className="num font-semibold">{PREMIUM_PRICE}</dd>
              </div>
              <div className="flex justify-between border-t border-rule px-4 py-3 text-muted-foreground">
                <dt>Due today</dt>
                <dd className="num">{PREMIUM_PRICE}</dd>
              </div>
            </dl>
            <p className="mt-4 rounded-[10px] border border-[var(--warning-border)] bg-warning-soft px-4 py-3 text-sm text-warning">
              Demo checkout: no card is needed and nothing is charged.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <SecondaryButton className="h-11" onClick={() => setStep("compare")}>
                Back
              </SecondaryButton>
              <PrimaryButton
                onClick={() => {
                  onPlan("premium");
                  setStep("done");
                }}
              >
                Confirm upgrade
              </PrimaryButton>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="p-6 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-brand-ink">
              <Check aria-hidden className="h-7 w-7" />
            </span>
            <DialogTitle className="mt-4 text-[22px] font-semibold tracking-[-0.02em]">
              Welcome to Premium
            </DialogTitle>
            <DialogDescription className="mx-auto mt-1.5 max-w-sm text-[15px] text-muted-foreground">
              Unlimited portfolios and ETFs, every correlation period, unlimited what-ifs and
              monthly exposure checks are now on.
            </DialogDescription>
            <PrimaryButton className="mt-6" onClick={() => onOpenChange(false)}>
              Continue
            </PrimaryButton>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Plan pill for the app header: opens the plans dialog. */
export function PlanBadge({ className }: { className?: string }) {
  const { isPremium, openPlans } = usePlan();
  return (
    <button
      type="button"
      onClick={() => openPlans()}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition-colors",
        isPremium
          ? "bg-brand-soft text-brand-ink"
          : "bg-secondary text-ink hover:bg-secondary-hover",
        className,
      )}
    >
      <Sparkles aria-hidden className="h-3.5 w-3.5" />
      {isPremium ? "Premium" : "Free · Upgrade"}
    </button>
  );
}

/** Small marker beside a feature that Free doesn't include. */
export function PremiumTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-full bg-brand-soft px-2 text-[11px] font-semibold text-brand-ink",
        className,
      )}
    >
      <Lock aria-hidden className="h-3 w-3" />
      Premium
    </span>
  );
}
