import { createContext, useContext, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetAuthMe, getGetAuthMeQueryKey, useAuthLogout } from "@workspace/api-client-react";
import type { AuthUser } from "@workspace/api-client-react";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useGetAuthMe({
    query: {
      queryKey: getGetAuthMeQueryKey(),
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  });

  const logoutMutation = useAuthLogout();

  const logout = async () => {
    await logoutMutation.mutateAsync();
    queryClient.clear();
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
