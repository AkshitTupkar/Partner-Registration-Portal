// Partner Status Master (BRD Section 12) — the subset reachable at S1.

export const LeadStatus = {
  /** Lead · Registered — submitted through the app, awaiting qualification. */
  REGISTERED: "ST-100",
  /** Lead · Pipeline — no partner requirement in the area right now (BR-01). */
  PIPELINE: "ST-101",
  /** On hold · Duplicate or blocked match — halted pending Super Admin review (BR-08). */
  ON_HOLD_BLOCKED: "ST-403",
} as const;

export type LeadStatusCode = (typeof LeadStatus)[keyof typeof LeadStatus];
