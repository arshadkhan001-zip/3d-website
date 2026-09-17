import { useEffect, useState } from "react";
import { ANNOUNCEMENTS } from "../../data/site";
import { isReducedMotion } from "../../lib/utilities/utils";

/** Rotating shipping/offer messages. Scrolls away (not sticky). */
export default function AnnouncementBar() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (isReducedMotion()) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % ANNOUNCEMENTS.length), 4000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="relative z-[60] bg-ember px-4 py-2 text-center">
      <p key={i} className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-white">
        {ANNOUNCEMENTS[i]}
      </p>
    </div>
  );
}
