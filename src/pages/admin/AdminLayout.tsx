import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { cn } from "../../lib/utilities/utils";
import { useDocumentTitle } from "../../lib/seo";

const NAV = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/inventory", label: "Inventory" },
  { to: "/admin/coupons", label: "Coupons" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/notifications", label: "Notifications" },
  { to: "/admin/settings", label: "Settings" },
];

/** Admin shell: sidebar nav + notification bell + outlet. */
export default function AdminLayout() {
  useDocumentTitle("Admin", "Cover King Panipat store management.");
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let live = true;
    supabase()
      .from("notifications")
      .select("id", { count: "exact" })
      .eq("read", false)
      .then(({ count }) => {
        if (live) setUnread(count ?? 0);
      });
    const ch = supabase()
      .channel("admin-notifs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () =>
        setUnread((n) => n + 1)
      )
      .subscribe();
    return () => {
      live = false;
      void supabase().removeChannel(ch);
    };
  }, []);

  return (
    <div className="bg-base text-fg">
      <div className="ds-container ds-section pt-24 md:pt-28">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="ds-annotation text-fgsoft">Cover King Panipat</p>
            <h1 className="mt-2 font-display text-3xl font-medium tracking-tight">Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/notifications"
              aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-line text-fgsoft hover:text-fg"
            >
              <Bell size={18} aria-hidden="true" />
              {unread > 0 && (
                <span aria-hidden="true" className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1 font-mono text-[0.6rem] text-white">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>
            <Link to="/" className="hidden min-h-[44px] items-center rounded-full border border-line px-5 text-sm sm:inline-flex">
              Storefront
            </Link>
            <button
              type="button"
              onClick={() => void signOut().then(() => navigate("/"))}
              className="inline-flex min-h-[44px] items-center rounded-full border border-line px-5 text-sm"
            >
              Sign out
            </button>
          </div>
        </div>

        <nav aria-label="Admin" className="no-scrollbar -mx-6 mt-8 flex gap-2 overflow-x-auto border-b border-line px-6 pb-0">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  "shrink-0 border-b-2 px-4 py-3 text-sm",
                  isActive ? "border-fg text-fg" : "border-transparent text-fgsoft hover:text-fg"
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="py-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
