const useragent = require("express-useragent");
const geoip = require("geoip-lite");
const url = require("node:url");

const CONTINENT_MAP = {
  AF: "Africa",
  AN: "Antarctica",
  AS: "Asia",
  EU: "Europe",
  NA: "North America",
  OC: "Oceania",
  SA: "South America"
};

const COUNTRY_NAMES = {
  US: "United States",
  IN: "India",
  GB: "United Kingdom",
  CA: "Canada",
  DE: "Germany",
  FR: "France",
  AU: "Australia",
  JP: "Japan",
  CN: "China",
  BR: "Brazil"
};

function extractClientIp(req) {
  if (!req) return "127.0.0.1";

  const cfIp = req.headers ? req.headers["cf-connecting-ip"] : null;
  if (cfIp) return cfIp.trim();

  const forwardedFor = req.headers ? req.headers["x-forwarded-for"] : null;
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0].trim();
    if (firstIp) return firstIp;
  }

  const realIp = req.headers ? req.headers["x-real-ip"] : null;
  if (realIp) return realIp.trim();

  return req.ip || req.socket?.remoteAddress || "127.0.0.1";
}

function parseVisitorInfo(req) {
  const userAgentStr = (req && req.headers && req.headers["user-agent"]) || "";
  const ip = extractClientIp(req);

  // Parse User-Agent
  let agent = {};
  try {
    if (typeof useragent === "function") {
      agent = useragent.parse(userAgentStr) || {};
    } else if (useragent && typeof useragent.parse === "function") {
      agent = useragent.parse(userAgentStr) || {};
    }
  } catch {
    agent = {};
  }

  // Determine Browser
  let browser = "other";
  if (agent.isChrome) browser = "chrome";
  else if (agent.isFirefox) browser = "firefox";
  else if (agent.isSafari) browser = "safari";
  else if (agent.isEdge) browser = "edge";
  else if (agent.isOpera) browser = "opera";
  else if (agent.isIE) browser = "ie";

  // Determine OS
  let os = "other";
  if (agent.isWindows) os = "windows";
  else if (agent.isMac) os = agent.isMobile ? "ios" : "macos";
  else if (agent.isiPhone || agent.isiPad || agent.isiPod) os = "ios";
  else if (agent.isAndroid) os = "android";
  else if (agent.isLinux) os = "linux";

  // Determine Device Type
  let device_type = "desktop";
  if (agent.isMobile) device_type = "mobile";
  else if (agent.isTablet) device_type = "tablet";
  else if (agent.isSmartTV) device_type = "tv";
  else if (agent.isBot) device_type = "bot";

  // Lookup Geolocation
  let geo = {};
  try {
    if (ip && ip !== "127.0.0.1" && ip !== "::1") {
      geo = geoip.lookup(ip) || {};
    }
  } catch {
    geo = {};
  }

  const headerCountry = req && req.get ? req.get("cf-ipcountry") : null;
  const country = (headerCountry && headerCountry !== "XX" ? headerCountry : (geo.country || "unknown")).toLowerCase();
  const country_name = COUNTRY_NAMES[country.toUpperCase()] || geo.country || "Unknown";
  const city = geo.city || "Unknown";
  const region = geo.region || "Unknown";
  const timezone = geo.timezone || "UTC";
  const latitude = (geo.ll && typeof geo.ll[0] === "number") ? geo.ll[0] : null;
  const longitude = (geo.ll && typeof geo.ll[1] === "number") ? geo.ll[1] : null;
  const continent = geo.eu === "1" ? "Europe" : (geo.country ? (CONTINENT_MAP[geo.country] || "Unknown") : "Unknown");

  // Parse Referrer
  let referrer = "direct";
  try {
    const refHeader = req && req.get ? (req.get("Referrer") || req.get("Referer")) : null;
    if (refHeader) {
      const parsedUrl = url.parse(refHeader);
      if (parsedUrl.hostname) {
        referrer = parsedUrl.hostname.replace(/^www\./, "").toLowerCase().replace(/\./g, "[dot]");
      }
    }
  } catch {
    referrer = "direct";
  }

  return {
    ip,
    userAgent: userAgentStr,
    browser,
    browser_version: agent.version || "",
    os,
    device_type,
    country,
    country_name,
    city,
    region,
    timezone,
    latitude,
    longitude,
    continent,
    referrer
  };
}

module.exports = {
  extractClientIp,
  parseVisitorInfo
};
