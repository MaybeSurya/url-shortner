const useragent = require("express-useragent");
const geoip = require("geoip-lite");
const url = require("node:url");

const { removeWww, getUseragentBrowser, getUseragentOS } = require("../utils");
const query = require("../queries");
const redis = require("../redis");

const CONTINENT_MAP = {
  AF: "Africa",
  AN: "Antarctica",
  AS: "Asia",
  EU: "Europe",
  NA: "North America",
  OC: "Oceania",
  SA: "South America"
};

module.exports = async function({ data }) {
  if (!data || !data.link) return;

  try {
    // 1. Increment visit count atomically in database
    await query.link.incrementVisit({ id: data.link.id });

    // 2. Invalidate link & stats cache in Redis
    if (redis.remove && redis.remove.link) {
      await redis.remove.link(data.link);
    }
    if (redis.client && redis.client.status === "ready") {
      try {
        await redis.client.del(redis.key.stats(data.link.id));
        await redis.client.del(`s:${data.link.id}`);
      } catch {
        // ignore cache deletion warnings
      }
    }

    // 3. Parse User Agent safely
    const userAgentStr = data.userAgent || data.headers?.["user-agent"] || "";
    let agent = {};
    if (typeof useragent === "function" && useragent.parse) {
      agent = useragent.parse(userAgentStr);
    } else if (useragent && typeof useragent.parse === "function") {
      agent = useragent.parse(userAgentStr);
    }

    const browser = getUseragentBrowser(agent);
    const os = getUseragentOS(agent);

    let device_type = "desktop";
    if (agent.isMobile) device_type = "mobile";
    else if (agent.isTablet) device_type = "tablet";
    else if (agent.isSmartTV) device_type = "tv";
    else if (agent.isBot) device_type = "bot";

    // 4. Extract IP & Geolocation
    const ip = data.ip || "";
    const geo = ip ? (geoip.lookup(ip) || {}) : {};

    const country = data.country || geo.country || "Unknown";
    const city = geo.city || "Unknown";
    const region = geo.region || "Unknown";
    const timezone = geo.timezone || "UTC";
    const latitude = (geo.ll && typeof geo.ll[0] === "number") ? geo.ll[0] : null;
    const longitude = (geo.ll && typeof geo.ll[1] === "number") ? geo.ll[1] : null;
    const continent = geo.eu === "1" ? "Europe" : (geo.country ? (CONTINENT_MAP[geo.country] || "Unknown") : "Unknown");

    const referrerRaw = data.referrer ? removeWww(url.parse(data.referrer).hostname || "") : "";
    const referrer = (referrerRaw && referrerRaw.replace(/\./gi, "[dot]")) || "Direct";

    // 5. Save visit stats & granular visit log entry
    await query.visit.add({
      browser,
      browser_version: agent.version || "",
      os,
      device_type,
      country,
      city,
      region,
      timezone,
      latitude,
      longitude,
      continent,
      ip,
      user_agent: userAgentStr,
      link_id: data.link.id,
      user_id: data.link.user_id,
      referrer
    });
  } catch (error) {
    console.error("[VisitQueue] Error processing visit:", error.message || error);
  }
};
