import { startTransition, useEffect, useState } from "react";
import { getMasters } from "@/services/registration";
import type { Masters } from "@/types/registration";

export type MastersState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; masters: Masters };

/**
 * Loads the product and area masters for the form, with a retry. The request is
 * cancelled on unmount, so StrictMode's double mount leaves one live request.
 */
export function useMasters() {
  const [state, setState] = useState<MastersState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getMasters(controller.signal).then(
      (masters) => {
        if (controller.signal.aborted) return;
        // A transition, so the form fades in over the loading state.
        startTransition(() => setState({ status: "ready", masters }));
      },
      () => {
        if (!controller.signal.aborted) setState({ status: "error" });
      },
    );
    return () => controller.abort();
  }, [attempt]);

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  };

  return [state, retry] as const;
}
