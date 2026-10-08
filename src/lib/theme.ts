export type Theme = "light" | "dark" | "system";

export const THEME_KEY = "bookmarked-ui-theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

export function storedTheme(): Theme {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

export function applyTheme(theme: Theme): void {
  const dark = theme === "dark" || (theme === "system" && matchMedia(DARK_QUERY).matches);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // private mode: the choice lasts until reload
  }
  applyTheme(theme);
}

/** Runs before first paint so the page never flashes the wrong theme. Same logic as `applyTheme`. */
export const themeScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});var d=t==="dark"||(t!=="light"&&matchMedia(${JSON.stringify(DARK_QUERY)}).matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light"}catch(e){}})()`;

/** Follows the operating system while the theme is "system". Returns the cleanup. */
export function followSystemTheme(): () => void {
  const query = matchMedia(DARK_QUERY);
  const onChange = () => {
    if (storedTheme() === "system") applyTheme("system");
  };
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
