import { scrollBehavior } from "@/lib/utils";

/** Element id of the registration card, the target of every "Get started" button. */
export const REGISTER_ANCHOR = "register";

/** Scrolls to the registration card and puts the cursor in its first field. */
export function goToRegistration() {
  const card = document.getElementById(REGISTER_ANCHOR);
  if (!card) return;
  card.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  card.querySelector<HTMLElement>("input, select, button")?.focus({ preventScroll: true });
}
