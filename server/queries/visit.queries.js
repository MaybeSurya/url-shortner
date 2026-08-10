const { isAfter, subDays, subHours, set, format } = require("date-fns");

const utils = require("../utils");
const redis = require("../redis");
const knex = require("../knex");
const env = require("../env");

async function add(params) {
  const data = {
    ...params,
    browser: params.browser || "other",
    os: params.os || "other",
    country: (params.country || "unknown").toLowerCase(),
    referrer: (params.referrer || "direct").toLowerCase()
  };

  const nowUTC = new Date().toISOString();
  const truncatedNow = nowUTC.substring(0, 10) + " " + nowUTC.substring(11, 14) + "00:00";

  return knex.transaction(async (trx) => {
    // 1. Aggregated hourly visits update
    const subquery = trx("visits")
      .select("visits.*")
      .select({
        created_at_hours: utils.knexUtils(trx).truncatedTimestamp("created_at", "hour")
      })
      .where({ link_id: data.link_id })
      .as("subquery");

    const visit = await trx
      .select("*")
      .from(subquery)
      .where("created_at_hours", "=", truncatedNow)
      .forUpdate()
      .first();

    const knownBrowsers = ["chrome", "edge", "firefox", "ie", "opera", "safari"];
    const knownOS = ["android", "ios", "linux", "macos", "windows"];
    const brKey = knownBrowsers.includes(data.browser) ? `br_${data.browser}` : "br_other";
    const osKey = knownOS.includes(data.os) ? `os_${data.os}` : "os_other";

    if (visit) {
      const countries = typeof visit.countries === "string" ? JSON.parse(visit.countries) : (visit.countries || {});
      const referrers = typeof visit.referrers === "string" ? JSON.parse(visit.referrers) : (visit.referrers || {});
      await trx("visits")
        .where({ id: visit.id })
        .increment(brKey, 1)
        .increment(osKey, 1)
        .increment("total", 1)
        .update({
          updated_at: utils.dateToUTC(new Date()),
          countries: JSON.stringify({
            ...countries,
            [data.country]: (Number(countries[data.country]) || 0) + 1
          }),
          referrers: JSON.stringify({
            ...referrers,
            [data.referrer]: (Number(referrers[data.referrer]) || 0) + 1
          })
        });
    } else {
      await trx("visits").insert({
        [brKey]: 1,
        countries: JSON.stringify({ [data.country]: 1 }),
        referrers: JSON.stringify({ [data.referrer]: 1 }),
        [osKey]: 1,
        total: 1,
        link_id: data.link_id,
        user_id: data.user_id || null,
      });
    }

    // 2. Granular log entry insertion into visit_logs table
    try {
      const hasLogsTable = await trx.schema.hasTable("visit_logs");
      if (hasLogsTable) {
        await trx("visit_logs").insert({
          link_id: data.link_id,
          user_id: data.user_id || null,
          ip: data.ip || null,
          country: data.country || "unknown",
          city: data.city || null,
          region: data.region || null,
          timezone: data.timezone || null,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          continent: data.continent || null,
          browser: data.browser || "other",
          browser_version: data.browser_version || null,
          os: data.os || "other",
          device_type: data.device_type || "desktop",
          referrer: data.referrer || "direct",
          user_agent: data.user_agent ? data.user_agent.substring(0, 500) : null
        });
      }
    } catch (err) {
      console.error("[VisitQuery] Warning inserting visit_log:", err.message);
    }

    return visit;
  });
}

async function getLogs(match, limit = 50) {
  const hasLogsTable = await knex.schema.hasTable("visit_logs");
  if (!hasLogsTable) return [];
  return knex("visit_logs")
    .where(match)
    .orderBy("created_at", "desc")
    .limit(limit);
}

async function find(match, total) {
  if (match.link_id && env.REDIS_ENABLED && redis.client && redis.client.status === "ready") {
    const key = redis.key.stats(match.link_id);
    try {
      const cached = await redis.client.get(key);
      if (cached) return JSON.parse(cached);
    } catch {
      // fallback if redis error
    }
  }

  const stats = {
    lastDay: {
      stats: utils.getInitStats(),
      views: new Array(24).fill(0),
      total: 0
    },
    lastWeek: {
      stats: utils.getInitStats(),
      views: new Array(7).fill(0),
      total: 0
    },
    lastMonth: {
      stats: utils.getInitStats(),
      views: new Array(30).fill(0),
      total: 0
    },
    lastYear: {
      stats: utils.getInitStats(),
      views: new Array(12).fill(0),
      total: 0
    }
  };

  const visitsStream = knex("visits").where(match).stream();
  const now = new Date();
  const periods = utils.getStatsPeriods(now);

  for await (const visit of visitsStream) {
    periods.forEach(([type, fromDate]) => {
      const isIncluded = isAfter(utils.parseDatetime(visit.created_at), fromDate);
      if (!isIncluded) return;
      const diffFunction = utils.getDifferenceFunction(type);
      const diff = diffFunction(now, utils.parseDatetime(visit.created_at));
      const index = stats[type].views.length - diff - 1;
      if (index < 0 || index >= stats[type].views.length) return;

      const period = stats[type].stats;
      const countries = typeof visit.countries === "string" ? JSON.parse(visit.countries) : (visit.countries || {});
      const referrers = typeof visit.referrers === "string" ? JSON.parse(visit.referrers) : (visit.referrers || {});

      stats[type].stats = {
        browser: {
          chrome: period.browser.chrome + (visit.br_chrome || 0),
          edge: period.browser.edge + (visit.br_edge || 0),
          firefox: period.browser.firefox + (visit.br_firefox || 0),
          ie: period.browser.ie + (visit.br_ie || 0),
          opera: period.browser.opera + (visit.br_opera || 0),
          other: period.browser.other + (visit.br_other || 0),
          safari: period.browser.safari + (visit.br_safari || 0)
        },
        os: {
          android: period.os.android + (visit.os_android || 0),
          ios: period.os.ios + (visit.os_ios || 0),
          linux: period.os.linux + (visit.os_linux || 0),
          macos: period.os.macos + (visit.os_macos || 0),
          other: period.os.other + (visit.os_other || 0),
          windows: period.os.windows + (visit.os_windows || 0)
        },
        country: {
          ...period.country,
          ...Object.entries(countries).reduce(
            (obj, [country, count]) => ({
              ...obj,
              [country]: (period.country[country] || 0) + count
            }),
            {}
          )
        },
        referrer: {
          ...period.referrer,
          ...Object.entries(referrers).reduce(
            (obj, [referrer, count]) => ({
              ...obj,
              [referrer]: (period.referrer[referrer] || 0) + count
            }),
            {}
          )
        }
      };
      stats[type].views[index] += visit.total;
      stats[type].total += visit.total;
    });
  }

  // Fetch recent granular visit logs
  let recentLogs = [];
  try {
    recentLogs = await getLogs(match, 25);
  } catch {
    recentLogs = [];
  }

  const response = {
    lastYear: {
      stats: utils.statsObjectToArray(stats.lastYear.stats),
      views: stats.lastYear.views,
      total: stats.lastYear.total
    },
    lastDay: {
      stats: utils.statsObjectToArray(stats.lastDay.stats),
      views: stats.lastDay.views,
      total: stats.lastDay.total
    },
    lastMonth: {
      stats: utils.statsObjectToArray(stats.lastMonth.stats),
      views: stats.lastMonth.views,
      total: stats.lastMonth.total
    },
    lastWeek: {
      stats: utils.statsObjectToArray(stats.lastWeek.stats),
      views: stats.lastWeek.views,
      total: stats.lastWeek.total
    },
    recentLogs,
    updatedAt: new Date()
  };

  if (match.link_id && env.REDIS_ENABLED && redis.client && redis.client.status === "ready") {
    const key = redis.key.stats(match.link_id);
    redis.client.set(key, JSON.stringify(response), "EX", 15).catch(() => {});
  }

  return response;
}

module.exports = {
  add,
  getLogs,
  find
};