import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import { isSupabaseConfigured } from "../../lib/supabase";

/**
 * Server-enforced admin gate: RLS is the real enforcement;
 * this only controls which UI renders.
 */
export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading, mode } = useAuth();
  const location = useLocation();

  if (!isSupabaseConfigured() || mode === "demo") {
    return (
      <section className="bg-base text-fg">
        <div className="ds-container ds-section mx-auto max-w-xl pt-32 text-center">
          <p className="ds-annotation text-fgsoft">Admin</p>
          <h1 className="mt-4 font-display text-4xl">Backend not connected.</h1>
          <p className="mt-3 text-fgsoft">
            The admin dashboard needs Supabase. Add <span className="font-mono">VITE_SUPABASE_URL</span> and{" "}
            <span className="font-mono">VITE_SUPABASE_ANON_KEY</span>, run the migrations, then sign in as an admin.
          </p>
        </div>
      </section>
    );
  }
  if (loading) {
    return (
      <section className="bg-base text-fg">
        <div className="ds-container ds-section pt-32 text-center text-fgsoft">Checking access…</div>
      </section>
    );
  }
  if (!user) return <Navigate to="/account" state={{ from: location.pathname }} replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}
