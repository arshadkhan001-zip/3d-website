import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase, isSupabaseConfigured } from "./supabase";

export interface AuthProfile {
  id: string;
  email: string;
  fullName: string;
  role: "customer" | "admin";
}

interface AuthValue {
  /** 'cloud' when Supabase is configured, else local demo mode. */
  mode: "cloud" | "demo";
  user: AuthProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

async function fetchProfile(userId: string, email: string): Promise<AuthProfile> {
  const { data } = await supabase().from("profiles").select("full_name,role").eq("id", userId).single();
  return {
    id: userId,
    email,
    fullName: (data?.full_name as string) ?? "",
    role: (data?.role as string) === "admin" ? "admin" : "customer",
  };
}

/** Supabase auth when configured; demo passthrough otherwise (never faked as real). */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const mode = isSupabaseConfigured() ? "cloud" : "demo";

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    supabase().auth.getSession().then(async ({ data }: { data: { session: { user: { id: string; email?: string } } | null } }) => {
      const u = data.session?.user;
      if (u) {
        try {
          setUser(await fetchProfile(u.id, u.email ?? ""));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    });
    const { data: sub } = supabase().auth.onAuthStateChange(async (_evt: string, session: { user: { id: string; email?: string } } | null) => {
      const u = session?.user;
      if (!u) {
        setUser(null);
        return;
      }
      try {
        setUser(await fetchProfile(u.id, u.email ?? ""));
      } catch {
        setUser(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase().auth.signInWithPassword({ email: email.trim(), password });
    return error ? { error: error.message } : {};
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const { data, error } = await supabase().auth.signUp({ email: email.trim(), password });
    if (error) return { error: error.message };
    if (data.user) {
      // Profile row: role locked to customer by RLS (escalation impossible).
      await supabase().from("profiles").insert({
        id: data.user.id,
        full_name: name.trim(),
        email: email.trim(),
        role: "customer",
      });
    }
    return {};
  }, []);

  const signOut = useCallback(async () => {
    await supabase().auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ mode, user, loading, isAdmin: user?.role === "admin", signIn, signUp, signOut }),
    [mode, user, loading, signIn, signUp, signOut]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
