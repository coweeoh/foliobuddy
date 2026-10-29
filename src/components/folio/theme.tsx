import { Moon, Sun } from "lucide-react";

const KEY = "foliobuddy:theme";

/** Runs before first paint so the saved theme never flashes the other one. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${KEY}");var dark=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",dark)}catch(e){}})()`;

export function ThemeToggle() {
  const toggle = () => {
    const dark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(KEY, dark ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle colour theme"
      className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-ink"
    >
      <Sun aria-hidden className="hidden h-[18px] w-[18px] dark:block" />
      <Moon aria-hidden className="h-[18px] w-[18px] dark:hidden" />
    </button>
  );
}
