import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { cn } from "../../lib/utilities/utils";

interface Note { id: string; type: string; title: string; message: string; read: boolean; order_id: string | null; created_at: string }

/** Store-wide notification inbox (new orders, cancellations, stock events). */
export default function Notifications() {
  const [rows, setRows] = useState<Note[]>([]);

  const load = async () => {
    const { data } = await supabase().from("notifications").select("*").order("created_at", { ascending: false }).limit(100);
    setRows((data ?? []) as Note[]);
  };
  useEffect(() => {
    void load();
  }, []);

  const mark = async (id: string, read: boolean) => {
    await supabase().from("notifications").update({ read }).eq("id", id);
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, read } : r)));
  };

  const markAll = async () => {
    await supabase().from("notifications").update({ read: true }).eq("read", false);
    void load();
  };

  const unread = rows.filter((r) => !r.read).length;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-fgsoft">{unread} unread</p>
        <button type="button" onClick={() => void markAll()} disabled={unread === 0}
          className="min-h-[44px] rounded-full border border-line px-5 text-sm disabled:opacity-40">
          Mark all as read
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="mt-6 border border-line px-6 py-16 text-center text-fgsoft">All quiet. New orders and events land here.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((n) => (
            <li key={n.id} className={cn("border p-4", n.read ? "border-line opacity-70" : "border-ember/50")}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{n.title}</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-fgsoft">{n.message}</p>
                  <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-fgsoft">
                    {n.type.replace(/_/g, " ")} · {new Date(n.created_at).toLocaleString("en-IN")}
                  </p>
                </div>
                <button type="button" onClick={() => void mark(n.id, !n.read)} aria-pressed={n.read}
                  className="shrink-0 rounded-full border border-line px-4 py-2 font-mono text-[0.62rem] uppercase">
                  {n.read ? "Unread" : "Read"}
                </button>
              </div>
              {n.order_id && (
                <Link to={`/admin/orders/${n.order_id}`} className="mt-2 inline-block text-sm underline underline-offset-4">
                  Open order →
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
