const { isAfter, subDays, subHours, subMonths, format } = require("date-fns");
const knex = require("../knex");
const redis = require("../redis");
const env = require("../env");
const utils = require("../utils");

async function recordVisitDirect(link, visitorInfo = {}) {
  if (!link || !link.id) return;

  const linkId = link.id;
  const userId = link.user_id || null;

  // 1. Direct Atomic Increment on `links` table
  try {
    await knex("links").where({ id: linkId }).increment("visit_count", 1);
  } catch (err) {
    console.error("[VisitTracking] Failed to increment visit_count on links table:", err.message);
  }

  // 2. Clear Redis cache for link and stats
  if (redis.client && redis.client.status === "ready") {
    try {
      const linkKey = `l:${link.address}:${link.domain_id || ""}`;
      const statsKey = redis.key.stats(linkId);
      await redis.client.del(linkKey);
      await redis.client.del(statsKey);
      await redis.client.del(`s:${linkId}`);
      if (userId) {
        await redis.client.del(`s:all:${userId}`);
      }
    } catch {
      // Ignore Redis errors
    }
  }

  const browser = visitorInfo.browser || "other";
  const os = visitorInfo.os || "other";
  const country = (visitorInfo.country || "unknown").toLowerCase();
  const referrer = (visitorInfo.referrer || "direct").toLowerCase();
  const device_type = visitorInfo.device_type || "desktop";

  // 3. Insert granular record into `visit_logs`
  try {
    const hasLogsTable = await knex.schema.hasTable("visit_logs");
    if (hasLogsTable) {
      await knex("visit_logs").insert({
        link_id: linkId,
        user_id: userId,
        ip: visitorInfo.ip || null,
        country: country,
        country_name: visitorInfo.country_name || null,
        city: visitorInfo.city || null,
        region: visitorInfo.region || null,
        timezone: visitorInfo.timezone || null,
        latitude: visitorInfo.latitude || null,
        longitude: visitorInfo.longitude || null,
        continent: visitorInfo.continent || null,
        browser: browser,
        browser_version: visitorInfo.browser_version || null,
        os: os,
        device_type: device_type,
        referrer: referrer,
        user_agent: visitorInfo.userAgent ? visitorInfo.userAgent.substring(0, 500) : null
      });
    }
  } catch (err) {
    console.error("[VisitTracking] Error inserting into visit_logs:", err.message);
  }

  // 4. Update or Insert Hourly Aggregated Record in `visits`
  try {
    const hasVisitsTable = await knex.schema.hasTable("visits");
    if (hasVisitsTable) {
      const now = new Date();
      const currentHourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0);

      const existingVisit = await knex("visits")
        .where({ link_id: linkId })
        .andWhere("created_at", ">=", currentHourStart)
        .orderBy("id", "desc")
        .first();

      const knownBrowsers = ["chrome", "edge", "firefox", "ie", "opera", "safari"];
      const knownOS = ["android", "ios", "linux", "macos", "windows"];
      const brKey = knownBrowsers.includes(browser) ? `br_${browser}` : "br_other";
      const osKey = knownOS.includes(os) ? `os_${os}` : "os_other";

      if (existingVisit) {
        let countriesObj = {};
        let referrersObj = {};
        try {
          countriesObj = typeof existingVisit.countries === "string" ? JSON.parse(existingVisit.countries) : (existingVisit.countries || {});
        } catch { countriesObj = {}; }
        try {
          referrersObj = typeof existingVisit.referrers === "string" ? JSON.parse(existingVisit.referrers) : (existingVisit.referrers || {});
        } catch { referrersObj = {}; }

        countriesObj[country] = (Number(countriesObj[country]) || 0) + 1;
        referrersObj[referrer] = (Number(referrersObj[referrer]) || 0) + 1;

        await knex("visits")
          .where({ id: existingVisit.id })
          .increment(brKey, 1)
          .increment(osKey, 1)
          .increment("total", 1)
          .update({
            updated_at: knex.fn.now(),
            countries: JSON.stringify(countriesObj),
            referrers: JSON.stringify(referrersObj)
          });
      } else {
        await knex("visits").insert({
          link_id: linkId,
          user_id: userId,
          [brKey]: 1,
          [osKey]: 1,
          total: 1,
          countries: JSON.stringify({ [country]: 1 }),
          referrers: JSON.stringify({ [referrer]: 1 }),
          created_at: knex.fn.now(),
          updated_at: knex.fn.now()
        });
      }
    }
  } catch (err) {
    console.error("[VisitTracking] Error updating visits table:", err.message);
  }
}

async function add(params) {
  // Fallback wrapper for queue compatibility
  const visitorInfo = {
    browser: params.browser,
    browser_version: params.browser_version,
    os: params.os,
    device_type: params.device_type,
    country: params.country,
    city: params.city,
    region: params.region,
    timezone: params.timezone,
    latitude: params.latitude,
    longitude: params.longitude,
    continent: params.continent,
    ip: params.ip,
    userAgent: params.user_agent,
    referrer: params.referrer
  };
  return recordVisitDirect({ id: params.link_id, user_id: params.user_id }, visitorInfo);
}

async function getLogs(match, limit = 50) {
  try {
    const hasLogsTable = await knex.schema.hasTable("visit_logs");
    if (!hasLogsTable) return [];
    return knex("visit_logs")
      .where(match)
      .orderBy("created_at", "desc")
      .limit(limit);
  } catch {
    return [];
  }
}

async function find(match, totalOverride) {
  // Check Redis cache for stats if available
  if (match.link_id && env.REDIS_ENABLED && redis.client && redis.client.status === "ready") {
    const key = redis.key.stats(match.link_id);
    try {
      const cached = await redis.client.get(key);
      if (cached) return JSON.parse(cached);
    } catch {
      // fallback
    }
  }

  const now = new Date();

  // Helper to aggregate distributions & timeline from visit_logs or visits
  const hasLogsTable = await knex.schema.hasTable("visit_logs");

  let logs = [];
  if (hasLogsTable) {
    try {
      logs = await knex("visit_logs")
        .where(match)
        .orderBy("created_at", "desc")
        .limit(1000);
    } catch {
      logs = [];
    }
  }

  // Calculate totals and distributions from logs
  const buildStatsForPeriod = (daysCount, isHours = false) => {
    const periodFrom = isHours ? subHours(now, daysCount) : subDays(now, daysCount);
    const filteredLogs = logs.filter(l => new Date(l.created_at) >= periodFrom);

    const total = filteredLogs.length;

    const browserMap = {};
    const osMap = {};
    const countryMap = {};
    const referrerMap = {};
    const deviceMap = {};

    const pointsCount = isHours ? daysCount : Math.min(daysCount, 30);
    const views = new Array(pointsCount).fill(0);

    filteredLogs.forEach(l => {
      const b = (l.browser || "other").toLowerCase();
      const o = (l.os || "other").toLowerCase();
      const c = (l.country || "unknown").toLowerCase();
      const r = (l.referrer || "direct").toLowerCase();
      const d = (l.device_type || "desktop").toLowerCase();

      browserMap[b] = (browserMap[b] || 0) + 1;
      osMap[o] = (osMap[o] || 0) + 1;
      countryMap[c] = (countryMap[c] || 0) + 1;
      referrerMap[r] = (referrerMap[r] || 0) + 1;
      deviceMap[d] = (deviceMap[d] || 0) + 1;

      // Histogram indexing
      const logDate = new Date(l.created_at);
      let diffIndex = 0;
      if (isHours) {
        diffIndex = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60));
      } else {
        diffIndex = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      const idx = pointsCount - 1 - diffIndex;
      if (idx >= 0 && idx < pointsCount) {
        views[idx] += 1;
      }
    });

    const toArr = (map) => Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    return {
      stats: {
        browser: toArr(browserMap),
        os: toArr(osMap),
        country: toArr(countryMap),
        referrer: toArr(referrerMap),
        device: toArr(deviceMap)
      },
      views,
      total
    };
  };

  const response = {
    lastDay: buildStatsForPeriod(24, true),
    lastWeek: buildStatsForPeriod(7, false),
    lastMonth: buildStatsForPeriod(30, false),
    lastYear: buildStatsForPeriod(365, false),
    recentLogs: logs.slice(0, 25),
    updatedAt: new Date()
  };

  if (match.link_id && env.REDIS_ENABLED && redis.client && redis.client.status === "ready") {
    const key = redis.key.stats(match.link_id);
    redis.client.set(key, JSON.stringify(response), "EX", 5).catch(() => {});
  }

  return response;
}

module.exports = {
  recordVisitDirect,
  add,
  getLogs,
  find
};