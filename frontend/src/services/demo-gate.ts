import { postJson, request } from "@/lib/api";
import type { DemoGateStatus } from "@/types/demo-gate";

/** Whether the hosted demo asks for its email and password first. */
export const getDemoGate = (signal?: AbortSignal) => request<DemoGateStatus>("/demo-gate", { signal });

/** Checks the demo email and password. Rejects with a 401 ApiError when they don't match. */
export const passDemoGate = (email: string, password: string) =>
  postJson<{ ok: true }>("/demo-gate", { email, password });
