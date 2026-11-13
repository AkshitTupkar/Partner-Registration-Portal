import { useEffect, useState } from "react";

/**
 * Whole seconds left until `deadline` (epoch ms), ticking once a second and
 * stopping at zero. Mount it with `key={deadline}` so a new deadline starts
 * from the current time instead of the last tick.
 */
export function useSecondsUntil(deadline: number): number {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (Date.now() >= deadline) return;
    const id = window.setInterval(() => {
      const tick = Date.now();
      setNow(tick);
      if (tick >= deadline) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [deadline]);

  return Math.max(0, Math.ceil((deadline - now) / 1000));
}
