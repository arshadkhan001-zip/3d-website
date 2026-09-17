import { useState } from "react";

/** Minimal newsletter signup (frontend-only; wire to provider later). */
export default function Newsletter({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={compact ? "" : "mx-auto max-w-xl text-center"}>
      {!compact && (
        <>
          <p className="ds-annotation text-mist">The dispatch</p>
          <h2 className="mt-4 font-display text-[clamp(1.8rem,4vw,2.8rem)] font-medium tracking-tight text-snow">
            First to know.
          </h2>
          <p className="mt-3 text-mist">Drops, restocks and studio notes. No noise.</p>
        </>
      )}
      {done ? (
        <p role="status" className="mt-6 inline-flex min-h-[44px] items-center rounded-full border border-ember/50 px-6 text-sm text-snow">
          You&apos;re on the list — welcome.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
              setError(true);
              return;
            }
            setError(false);
            setDone(true);
          }}
          className="mx-auto mt-6 flex max-w-md gap-2"
        >
          <label htmlFor={compact ? "nl-footer" : "nl-main"} className="sr-only">
            Email address
          </label>
          <input
            id={compact ? "nl-footer" : "nl-main"}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.in"
            className="h-12 min-w-0 flex-1 rounded-full border border-white/15 bg-transparent px-5 text-sm text-snow placeholder:text-mist/60 focus:border-white/40 focus:outline-none"
          />
          <button
            type="submit"
            className="h-12 shrink-0 rounded-full bg-snow px-6 text-sm font-medium text-ink transition-transform duration-200 hover:-translate-y-px"
          >
            Join
          </button>
        </form>
      )}
      {error && !done && (
        <p role="alert" className="mt-2 text-xs text-ember">
          Please enter a valid email address.
        </p>
      )}
    </div>
  );
}
