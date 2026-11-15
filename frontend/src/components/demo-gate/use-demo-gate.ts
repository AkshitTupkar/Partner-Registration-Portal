import { useEffect, useState } from "react";
import { getDemoGate } from "@/services/demo-gate";

// The browser remembers a passed check, so a refresh doesn't ask again. This is a
// guard against stumbling on the demo link, not authentication (see the backend's
// routes/demo-gate.ts), so a flag in storage is enough.
const STORAGE_KEY = "po-demo-gate-passed";

function hasPassed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function rememberPassed() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Private mode or blocked storage: the check just runs again next visit.
  }
}

export type DemoGateState = "checking" | "locked" | "open";

/** Locked until the visitor passes the demo gate, when the server has one configured. */
export function useDemoGate() {
  const [state, setState] = useState<DemoGateState>(() => (hasPassed() ? "open" : "checking"));

  useEffect(() => {
    if (state !== "checking") return;
    const controller = new AbortController();
    getDemoGate(controller.signal).then(
      ({ enabled }) => {
        if (!controller.signal.aborted) setState(enabled ? "locked" : "open");
      },
      () => {
        // Can't reach the API: show the page, whose form reports the outage itself.
        if (!controller.signal.aborted) setState("open");
      },
    );
    return () => controller.abort();
  }, [state]);

  return [state, () => setState("open")] as const;
}
