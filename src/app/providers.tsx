"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { makeQueryClient } from "@/lib/query-client";

export function Providers({ children }: { children: ReactNode }) {
  // One client per browser session; a module-level client would be shared across server requests.
  const [queryClient] = useState(makeQueryClient);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="bookmarked-ui-theme">
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
        {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
