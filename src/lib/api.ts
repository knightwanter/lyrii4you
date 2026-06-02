import { authHeaders, clearAuth } from "./auth";

/**
 * NOTE: auth has migrated to httpOnly cookies. The legacy `authHeaders()`
 * Bearer token is still sent for backwards compatibility while old client
 * sessions roll over, but the server will accept either source.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

interface ApiOptions extends RequestInit {
  json?: unknown;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Smart GET cache with per-resource TTLs and request deduplication

/** Resource-specific TTLs. Volatile data gets shorter TTLs. */
function getTtl(endpoint: string): number {
  if (endpoint.startsWith("/me/unread-count")) return 5_000;
  if (endpoint.startsWith("/messages")) return 4_000;
  if (endpoint.startsWith("/notifications")) return 10_000;
  if (endpoint.startsWith("/whispers")) return 10_000;
  if (endpoint.startsWith("/secret-crush")) return 15_000;
  if (endpoint.startsWith("/unsent-messages")) return 20_000;
  if (endpoint.startsWith("/verse-exchange")) return 15_000;
  if (endpoint.startsWith("/bottles")) return 20_000;
  if (endpoint.startsWith("/prompts")) return 60_000;
  if (endpoint.startsWith("/found-words")) return 60_000;
  if (endpoint.startsWith("/admin")) return 10_000;
  if (endpoint.startsWith("/explore")) return 30_000;
  if (endpoint.startsWith("/posts")) return 30_000;
  if (endpoint.startsWith("/social/profile")) return 30_000;
  if (endpoint.startsWith("/auth/me")) return 120_000;
  return 30_000;
}

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_CACHE_ENTRIES = 300;
const cache = new Map<string, { data: unknown; expiresAt: number }>();
const inflight = new Map<string, Promise<unknown>>();

/**
 * Endpoints that require a valid authenticated session.
 * 401 responses on these paths mean the user's session is dead → full logout.
 * All other endpoints (public search, explore, posts, profiles, etc.) will
 * surface the 401 to the caller without nuking auth state. This prevents
 * a single public read failure from destroying the session and triggering
 * cascading ChunkLoadErrors during normal operation or HA failover.
 */
const AUTH_CLEAR_PREFIXES = [
  "/auth/me",
  "/messages",
  "/notifications",
  "/admin",
  "/settings",
  "/journals",
  "/collections",
  "/bottles",
  "/unsent-messages",
  "/secret-crush",
  "/verse-exchange",
  "/me/unread-count",
];

function normalizeEndpoint(endpoint: string): string {
  const [path, query = ""] = endpoint.split("?");
  if (!query) return path;

  const params = new URLSearchParams(query);
  const sortedEntries = [...params.entries()].sort(([aKey, aVal], [bKey, bVal]) => {
    if (aKey === bKey) return aVal.localeCompare(bVal);
    return aKey.localeCompare(bKey);
  });

  const normalized = new URLSearchParams();
  for (const [key, value] of sortedEntries) {
    normalized.append(key, value);
  }

  const normalizedQuery = normalized.toString();
  return normalizedQuery ? `${path}?${normalizedQuery}` : path;
}

function pruneCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (value.expiresAt <= now) cache.delete(key);
  }

  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value as string | undefined;
    if (!oldestKey) break;
    cache.delete(oldestKey);
  }
}

function getCached<T>(endpoint: string): T | undefined {
  const key = normalizeEndpoint(endpoint);
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.data as T;
  if (entry) cache.delete(key);
  return undefined;
}

function setCache(endpoint: string, data: unknown) {
  const key = normalizeEndpoint(endpoint);
  cache.set(key, { data, expiresAt: Date.now() + getTtl(key) });
  pruneCache();
}

/** Invalidate cache entries matching prefixes derived from the mutation endpoint. */
function smartInvalidate(endpoint: string) {
  const normalized = normalizeEndpoint(endpoint);
  const [path] = normalized.split("?");

  const prefixes: string[] = [];

  if (path.startsWith("/posts")) {
    prefixes.push("/posts", "/explore", "/social/profile", "/admin/posts", "/found-words");
  } else if (path.startsWith("/messages")) {
    prefixes.push("/messages", "/me/unread-count");
  } else if (path.startsWith("/notifications")) {
    prefixes.push("/notifications", "/me/unread-count");
  } else if (path.startsWith("/social/follow") || path.startsWith("/social/unfollow")) {
    prefixes.push("/social/profile", "/social/users/search");
  } else if (path.startsWith("/social")) {
    prefixes.push("/social/profile");
  } else if (path.startsWith("/admin/prompts")) {
    prefixes.push("/admin/prompts", "/prompts", "/explore/featured");
  } else if (path.startsWith("/admin/posts")) {
    prefixes.push("/admin/posts", "/posts", "/explore", "/social/profile");
  } else if (path.startsWith("/admin")) {
    prefixes.push("/admin");
  } else if (path.startsWith("/auth")) {
    prefixes.push("/auth");
  } else if (path.startsWith("/whispers")) {
    prefixes.push("/whispers");
  } else if (path.startsWith("/secret-crush")) {
    prefixes.push("/secret-crush");
  } else if (path.startsWith("/unsent-messages")) {
    prefixes.push("/unsent-messages");
  } else if (path.startsWith("/verse-exchange")) {
    prefixes.push("/verse-exchange");
  } else if (path.startsWith("/bottles")) {
    prefixes.push("/bottles");
  } else if (path.startsWith("/journals")) {
    prefixes.push("/journals");
  } else if (path.startsWith("/collections")) {
    prefixes.push("/collections");
  } else if (path.startsWith("/prompts")) {
    prefixes.push("/prompts", "/explore/featured");
  } else if (path.startsWith("/found-words")) {
    prefixes.push("/found-words");
  }

  if (prefixes.length === 0) {
    cache.clear();
    inflight.clear();
    return;
  }

  for (const key of [...cache.keys()]) {
    if (prefixes.some((prefix) => key.startsWith(prefix))) {
      cache.delete(key);
    }
  }

  for (const key of [...inflight.keys()]) {
    if (prefixes.some((prefix) => key.startsWith(prefix))) {
      inflight.delete(key);
    }
  }
}

async function request<T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { json, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    ...authHeaders(),
    ...(customHeaders as Record<string, string>),
  };

  if (json) {
    headers["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...rest,
      headers,
      credentials: "include",
      body: json ? JSON.stringify(json) : rest.body,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.status === 401) {
      // Only nuke the session for sensitive authenticated endpoints.
      // Public reads (search, explore, posts, etc.) should fail gracefully
      // without destroying auth state for the rest of the app.
      const path = endpoint.split("?")[0];
      if (AUTH_CLEAR_PREFIXES.some((p) => path.startsWith(p))) {
        clearAuth();
      }
      throw new ApiError(401, "Unauthorized");
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new ApiError(res.status, data.error || data.message || "Request failed");
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out - please try again");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

function cachedGet<T = unknown>(endpoint: string): Promise<T> {
  const key = normalizeEndpoint(endpoint);

  // Return cached data if fresh
  const cached = getCached<T>(key);
  if (cached !== undefined) return Promise.resolve(cached);

  // Deduplicate concurrent requests to the same endpoint
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = request<T>(endpoint)
    .then((data) => {
      setCache(key, data);
      return data;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

export const api = {
  get: <T = unknown>(endpoint: string) => cachedGet<T>(endpoint),

  post: <T = unknown>(endpoint: string, data?: unknown) => {
    smartInvalidate(endpoint);
    return request<T>(endpoint, { method: "POST", json: data });
  },

  put: <T = unknown>(endpoint: string, data?: unknown) => {
    smartInvalidate(endpoint);
    return request<T>(endpoint, { method: "PUT", json: data });
  },

  delete: <T = unknown>(endpoint: string) => {
    smartInvalidate(endpoint);
    return request<T>(endpoint, { method: "DELETE" });
  },

  patch: <T = unknown>(endpoint: string, data?: unknown) => {
    smartInvalidate(endpoint);
    return request<T>(endpoint, { method: "PATCH", json: data });
  },

  upload: <T = unknown>(endpoint: string, formData: FormData) => {
    smartInvalidate(endpoint);
    return request<T>(endpoint, { method: "POST", body: formData });
  },

  /** Force-bypass cache for a GET request */
  fetch: <T = unknown>(endpoint: string) => {
    const key = normalizeEndpoint(endpoint);
    cache.delete(key);
    inflight.delete(key);
    return cachedGet<T>(endpoint);
  },

  /** Invalidate cached entries matching a prefix (or all if none given) */
  invalidate: (prefix?: string) => {
    if (!prefix) {
      cache.clear();
      inflight.clear();
      return;
    }

    const normalizedPrefix = normalizeEndpoint(prefix).split("?")[0];
    for (const key of [...cache.keys()]) {
      if (key.startsWith(normalizedPrefix)) cache.delete(key);
    }
    for (const key of [...inflight.keys()]) {
      if (key.startsWith(normalizedPrefix)) inflight.delete(key);
    }
  },
};

export { ApiError };
