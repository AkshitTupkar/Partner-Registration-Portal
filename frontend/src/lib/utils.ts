/** Joins class names, skipping falsy entries (atlas-frontend's `cn()`, minus tailwind-merge). */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** True when the visitor has asked the OS for less motion. */
export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Scroll behaviour that respects the reduced-motion setting. */
export const scrollBehavior = (): ScrollBehavior => (prefersReducedMotion() ? "auto" : "smooth");
