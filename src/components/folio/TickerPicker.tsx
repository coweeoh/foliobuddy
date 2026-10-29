import { useState, type ReactNode } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ETFS, SECURITIES } from "@/lib/folio/data";

const ETF_LIST = Object.entries(ETFS).map(([t, f]) => ({ t, name: f.name }));
const STOCK_LIST = Object.entries(SECURITIES)
  .map(([t, s]) => ({ t, name: s.name }))
  .sort((a, b) => a.t.localeCompare(b.t));

const clean = (q: string) =>
  q
    .toUpperCase()
    .replace(/[^A-Z0-9.]/g, "")
    .slice(0, 8);

export function TickerPicker({
  children,
  onPick,
  etfOnly = false,
  exclude = [],
  label,
}: {
  children: ReactNode;
  onPick: (ticker: string) => void;
  etfOnly?: boolean;
  exclude?: string[];
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const typed = clean(q);
  const known = typed in ETFS || typed in SECURITIES;
  const pick = (t: string) => {
    onPick(t);
    setOpen(false);
    setQ("");
  };
  const etfs = ETF_LIST.filter((x) => !exclude.includes(x.t));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild aria-label={label}>
        {children}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-2rem))] rounded-[14px] p-0 shadow-[0_12px_32px_rgba(16,24,40,0.12)]"
      >
        <Command className="rounded-[14px]">
          <CommandInput
            value={q}
            onValueChange={setQ}
            placeholder={etfOnly ? "Search ETFs" : "Ticker or company, e.g. VOO"}
            className="h-12 text-[15px]"
          />
          <CommandList className="max-h-[320px]">
            <CommandEmpty className="px-4 py-6 text-center text-sm text-muted-foreground">
              {etfOnly ? "No ETF in our data matches that." : "Type a ticker to add it."}
            </CommandEmpty>
            {!etfOnly && typed && !known && (
              <CommandGroup>
                <CommandItem
                  value={`__custom ${typed}`}
                  onSelect={() => pick(typed)}
                  className="rounded-[8px] px-3 py-2.5"
                >
                  <span className="font-semibold">Add “{typed}”</span>
                  <span className="ml-auto text-[13px] text-muted-foreground">
                    as a single stock
                  </span>
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup heading="ETFs">
              {etfs.map((x) => (
                <CommandItem
                  key={x.t}
                  value={`${x.t} ${x.name}`}
                  onSelect={() => pick(x.t)}
                  className="rounded-[8px] px-3 py-2.5"
                >
                  <span className="w-14 shrink-0 font-semibold">{x.t}</span>
                  <span className="truncate text-muted-foreground">{x.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {!etfOnly && (
              <CommandGroup heading="Stocks">
                {STOCK_LIST.map((x) => (
                  <CommandItem
                    key={x.t}
                    value={`${x.t} ${x.name}`}
                    onSelect={() => pick(x.t)}
                    className="rounded-[8px] px-3 py-2.5"
                  >
                    <span className="w-14 shrink-0 font-semibold">{x.t}</span>
                    <span className="truncate text-muted-foreground">{x.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
