import type { CSSProperties, ReactNode } from "react";
import { ETFS, SECURITIES } from "@/lib/folio/data";
import { cn } from "@/lib/utils";

export const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;
export const pts = (v: number, d = 1) =>
  `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v * 100).toFixed(d)} pts`;
export const money = (v: number) =>
  v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const nameOf = (t: string) => ETFS[t]?.name ?? SECURITIES[t]?.name;

export type Hue = { mark: string; soft: string; ink: string };
const HUE_COUNT = 6;
export const hue = (i: number): Hue => {
  const n = (Math.max(0, i) % HUE_COUNT) + 1;
  return { mark: `var(--h${n})`, soft: `var(--h${n}-soft)`, ink: `var(--h${n}-ink)` };
};
export type HueOf = (ticker: string) => Hue;

export function TickerTile({ ticker, h, size = 44 }: { ticker: string; h: Hue; size?: number }) {
  const label = ticker.slice(0, 4) || "?";
  return (
    <span
      aria-hidden
      className="num grid shrink-0 place-items-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        background: h.soft,
        color: h.ink,
        fontSize: Math.max(11, label.length > 3 ? size * 0.26 : size * 0.3),
        letterSpacing: label.length > 3 && size < 40 ? "-0.03em" : undefined,
      }}
    >
      {label}
    </span>
  );
}

export function Chip({
  h,
  children,
  className,
}: {
  h: Hue;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "num inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-[13px] font-medium",
        className,
      )}
      style={{ background: h.soft, color: h.ink }}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section
      className={cn("rise rounded-[20px] border border-border bg-surface", className)}
      style={style}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  aside,
  sub,
}: {
  title: string;
  aside?: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <header className="px-6 pt-5 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        {aside}
      </div>
      {sub && <p className="mt-1 max-w-prose text-[15px] text-muted-foreground">{sub}</p>}
    </header>
  );
}

export function PageTitle({ title, sub }: { title: string; sub: ReactNode }) {
  return (
    <div className="rise mb-6">
      <h1 className="text-[26px] leading-tight font-semibold sm:text-[28px]">{title}</h1>
      <p className="mt-1.5 max-w-2xl text-base text-muted-foreground">{sub}</p>
    </div>
  );
}

export function PrimaryButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-[15px] font-semibold text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary-hover active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
    />
  );
}

export function SecondaryButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-secondary px-4 text-sm font-semibold text-ink transition-[background-color,transform] duration-150 hover:bg-secondary-hover active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
    />
  );
}

export function TextButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "rounded-md text-sm font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-ink hover:underline",
        className,
      )}
    />
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <p className="rise rounded-[10px] border border-[var(--warning-border)] bg-warning-soft px-4 py-3 text-sm text-warning">
      {children}
    </p>
  );
}
