const Redis = require("ioredis");

const env = require("./env");

let client;

if (env.REDIS_ENABLED) {
  const commonOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      // Exponential backoff up to 3 seconds
      return Math.min(times * 100, 3000);
    },
  };

  if (env.REDIS_URL) {
    // Upstash / URL-based connection (supports rediss:// for TLS)
    client = new Redis(env.REDIS_URL, {
      ...commonOptions,
      ...(env.REDIS_TLS && !env.REDIS_URL.startsWith("rediss://") && { tls: {} }),
    });
  } else {
    // Legacy host/port config
    client = new Redis({
      ...commonOptions,
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      db: env.REDIS_DB,
      ...(env.REDIS_PASSWORD && { password: env.REDIS_PASSWORD }),
      ...(env.REDIS_TLS && { tls: {} }),
    });
  }

  client.on("error", (err) => {
    console.error("[Redis] Connection error:", err.message);
  });

  client.on("connect", () => {
    const mode = env.REDIS_URL
      ? `URL (${env.REDIS_URL.replace(/:[^:@]+@/, ":***@")})`
      : `${env.REDIS_HOST}:${env.REDIS_PORT}`;
    console.log(`[Redis] Connected via ${mode}`);
  });
}

const key = {
  link: (address, domain_id) => `l:${address}:${domain_id || ""}`,
  domain: (address) => `d:${address}`,
  stats: (link_id) => `s:${link_id}`,
  host: (address) => `h:${address}`,
  user: (idOrKey) => `u:${idOrKey}`
};

const safeDel = async (keys) => {
  if (!client || client.status !== "ready") return;
  try {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    await client.del(...keyArray);
  } catch (err) {
    console.error("[Redis] Cache deletion warning:", err.message);
  }
};

const remove = {
  domain: (domain) => {
    if (!domain) return;
    return safeDel(key.domain(domain.address));
  },
  host: (host) => {
    if (!host) return;
    return safeDel(key.host(host.address));
  },
  link: (link) => {
    if (!link) return;
    return safeDel(key.link(link.address, link.domain_id));
  },
  user: (user) => {
    if (!user) return;
    return safeDel([key.user(user.id), key.user(user.apikey)]);
  }
};

module.exports = {
  client,
  key,
  remove,
};