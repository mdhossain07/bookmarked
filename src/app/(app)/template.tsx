import type { ReactNode } from "react";

// A template remounts on every navigation, so each page fades in once.
export default function AppTemplate({ children }: { children: ReactNode }) {
  return <div className="motion-safe:animate-enter">{children}</div>;
}
