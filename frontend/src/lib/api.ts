// Fetch wrapper for the partner onboarding API (backend/). In dev, Vite proxies
// /api to :4000. Errors use the backend shape { error: { code, message, fields? } }.
// Endpoint calls live in src/services/.

/** An error response from the API, or a network failure (status 0). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields: Readonly<Record<string, string>> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Reads the error envelope defensively: a proxy or gateway page can send anything. */
function toApiError(status: number, body: unknown): ApiError {
  const error = isRecord(body) && isRecord(body.error) ? body.error : {};
  const fields: Record<string, string> = {};
  if (isRecord(error.fields)) {
    for (const [key, message] of Object.entries(error.fields)) {
      if (typeof message === "string") fields[key] = message;
    }
  }
  return new ApiError(
    status,
    typeof error.code === "string" ? error.code : "UNKNOWN",
    typeof error.message === "string" ? error.message : "Request failed",
    fields,
  );
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch (err) {
    // A cancelled request is the caller's doing, not a network failure.
    if (init?.signal?.aborted) throw err;
    throw new ApiError(0, "NETWORK", "Network error");
  }

  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) throw toApiError(res.status, body);
  // A 2xx that isn't JSON came from something other than our API (e.g. a misrouted proxy).
  if (body === null) throw new ApiError(0, "NETWORK", "Unexpected response");
  // Success bodies come from our own same-origin API; their shapes are in src/types.
  return body as T;
}

export const postJson = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });
