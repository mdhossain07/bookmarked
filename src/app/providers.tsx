"use client";

import { useEffect, useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/toaster";
import { makeQueryClient } from "@/lib/query-client";
import { followSystemTheme } from "@/lib/theme";

export function Providers({ children }: { children: ReactNode }) {
  // One client per browser session; a module-level client would be shared across server requests.
  const [queryClient] = useState(makeQueryClient);

  useEffect(followSystemTheme, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
