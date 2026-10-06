import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import defaultTheme from "tailwindcss/defaultTheme";

// <alpha-value> lets opacity modifiers work on tokens, for example bg-books/15.
const token = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: token("border"),
        input: token("input"),
        ring: token("ring"),
        background: token("background"),
        foreground: token("foreground"),
        primary: { DEFAULT: token("primary"), foreground: token("primary-foreground") },
        secondary: { DEFAULT: token("secondary"), foreground: token("secondary-foreground") },
        destructive: { DEFAULT: token("destructive"), foreground: token("destructive-foreground") },
        muted: { DEFAULT: token("muted"), foreground: token("muted-foreground") },
        accent: { DEFAULT: token("accent"), foreground: token("accent-foreground") },
        popover: { DEFAULT: token("popover"), foreground: token("popover-foreground") },
        card: { DEFAULT: token("card"), foreground: token("card-foreground") },
        brass: { DEFAULT: token("brass"), text: token("brass-text") },
        books: token("books"),
        movies: token("movies"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        display: ["var(--font-display)", "Georgia", ...defaultTheme.fontFamily.serif],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 1px 2px hsl(var(--shadow-color) / 0.06), 0 4px 12px hsl(var(--shadow-color) / 0.06)",
        dialog: "0 8px 24px hsl(var(--shadow-color) / 0.14), 0 24px 64px hsl(var(--shadow-color) / 0.12)",
      },
    },
  },
  plugins: [animate],
};

export default config;
