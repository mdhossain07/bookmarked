"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { UserDocument } from "@/shared";
import * as authClient from "@/lib/auth-client";
import { authToasts } from "@/lib/toast-helpers";

interface AuthContextValue {
  user: UserDocument;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Holds the signed-in user. The `(app)` layout loads `initialUser` on the server. */
export function AuthProvider({ initialUser, children }: { initialUser: UserDocument; children: ReactNode }) {
  const [user, setUser] = useState(initialUser);
  const queryClient = useQueryClient();
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    setUser(await authClient.getProfile());
  }, []);

  const logout = useCallback(async () => {
    try {
      await authClient.logout();
    } catch (error) {
      console.warn("Logout request failed:", error);
    }
    queryClient.clear();
    authToasts.logoutSuccess();
    router.replace("/login");
    router.refresh();
  }, [queryClient, router]);

  const value = useMemo(() => ({ user, refreshUser, logout }), [user, refreshUser, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
