import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthState>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check current session
    supabase.auth.getUser().then(({ data }) => {
      setState({
        user: data.user ?? null,
        isLoading: false,
        isAuthenticated: !!data.user,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        isLoading: false,
        isAuthenticated: !!session?.user,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
  );
}
