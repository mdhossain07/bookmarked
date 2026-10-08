import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import defaultTheme from "tailwindcss/defaultTheme";

// <alpha-value> lets opacity modifiers work on tokens, for example bg-books/15.
const token = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    // The whole type scale: four sizes, so pages cannot drift to new ones.
    fontSize: {
      sm: ["0.875rem", { lineHeight: "1.25rem" }],
      base: ["1rem", { lineHeight: "1.5rem" }],
      lg: ["1.25rem", { lineHeight: "1.75rem" }],
      "2xl": ["2rem", { lineHeight: "2.5rem" }],
    },
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
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.22, 1, 0.36, 1)",
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
      keyframes: {
        enter: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        enter: "enter 250ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
      maxWidth: {
        content: "1200px",
      },
      boxShadow: {
        card: "0 1px 2px hsl(var(--shadow-color) / 0.06), 0 4px 12px hsl(var(--shadow-color) / 0.06)",
        "card-hover": "0 2px 4px hsl(var(--shadow-color) / 0.08), 0 12px 28px hsl(var(--shadow-color) / 0.12)",
        dialog: "0 8px 24px hsl(var(--shadow-color) / 0.14), 0 24px 64px hsl(var(--shadow-color) / 0.12)",
      },
    },
  },
  plugins: [animate],
};

export default config;
