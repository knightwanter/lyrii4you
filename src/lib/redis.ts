/**
 * Optional Redis client.
 *
 * If REDIS_URL is set AND the `ioredis` package is installed, this exposes
 * a real client. Otherwise it falls back to a no-op shim with the same
 * surface so calling code never has to branch on whether Redis is available.
 *
 * To enable: `npm install ioredis` and set REDIS_URL=redis://127.0.0.1:6379
 */

type RedisLike = {
  enabled: boolean;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  keys(pattern: string): Promise<string[]>;
  /** Atomic sliding-window-ish counter: increments and returns count + ttl. */
  incrWithTTL(key: string, ttlSeconds: number): Promise<{ count: number; ttl: number }>;
};

let client: RedisLike | null = null;

type RedisConstructor = new (
  url: string,
  options: { lazyConnect: boolean; maxRetriesPerRequest: number }
) => {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: "EX", ttlSeconds?: number): Promise<unknown>;
  incr(key: string): Promise<number>;
  expire(key: string, ttlSeconds: number): Promise<unknown>;
  del(key: string): Promise<unknown>;
  keys(pattern: string): Promise<string[]>;
  multi(): {
    incr(key: string): void;
    expire(key: string, ttlSeconds: number): void;
    ttl(key: string): void;
    exec(): Promise<Array<[Error | null, unknown]> | null>;
  };
};

type RedisModule = {
  default?: RedisConstructor;
};

async function loadRedisModule(): Promise<RedisModule | RedisConstructor | null> {
  const dynamicImport = new Function("specifier", "return import(specifier)") as (
    specifier: string
  ) => Promise<RedisModule | RedisConstructor>;

  return dynamicImport("ioredis").catch(() => null);
}

function noopShim(): RedisLike {
  return {
    enabled: false,
    async get() { return null; },
    async set() {},
    async incr() { return 0; },
    async expire() {},
    async del() {},
    async keys() { return []; },
    async incrWithTTL() { return { count: 0, ttl: 0 }; },
  };
}

async function buildClient(): Promise<RedisLike> {
  const url = process.env.REDIS_URL;
  if (!url) return noopShim();

  try {
    // Loaded indirectly so Redis can remain optional in local/dev installs.
    const mod = await loadRedisModule();
    if (!mod) {
      console.warn("[redis] REDIS_URL set but `ioredis` is not installed — using no-op shim.");
      return noopShim();
    }
    const Redis: RedisConstructor | undefined = typeof mod === "function" ? mod : mod.default;
    if (!Redis) {
      console.warn("[redis] REDIS_URL set but `ioredis` did not expose a Redis constructor — using no-op shim.");
      return noopShim();
    }
    const r = new Redis(url, { lazyConnect: false, maxRetriesPerRequest: 2 });

    return {
      enabled: true,
      async get(k) { return r.get(k); },
      async set(k, v, ttl) {
        if (ttl) await r.set(k, v, "EX", ttl);
        else await r.set(k, v);
      },
      async incr(k) { return r.incr(k); },
      async expire(k, ttl) { await r.expire(k, ttl); },
      async del(k) { await r.del(k); },
      async keys(pattern) { return r.keys(pattern); },
      async incrWithTTL(k, ttl) {
        const pipeline = r.multi();
        pipeline.incr(k);
        pipeline.expire(k, ttl);
        pipeline.ttl(k);
        const res = await pipeline.exec();
        const count = (res?.[0]?.[1] as number) ?? 0;
        const remaining = (res?.[2]?.[1] as number) ?? ttl;
        return { count, ttl: remaining };
      },
    };
  } catch (err) {
    console.error("[redis] failed to initialize, using no-op shim:", err);
    return noopShim();
  }
}

const globalForRedis = globalThis as unknown as { redis: RedisLike | null };

export async function getRedis(): Promise<RedisLike> {
  if (client) return client;
  if (globalForRedis.redis) {
    client = globalForRedis.redis;
    return client;
  }
  client = await buildClient();
  if (process.env.NODE_ENV !== "production") globalForRedis.redis = client;
  return client;
}
