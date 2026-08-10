const query = require("../queries");
const { parseVisitorInfo } = require("../utils/visitor.utils");

module.exports = async function({ data }) {
  if (!data || !data.link) return;

  try {
    const visitorInfo = {
      ip: data.ip,
      userAgent: data.userAgent || data.headers?.["user-agent"] || "",
      country: data.country,
      referrer: data.referrer
    };

    await query.visit.recordVisitDirect(data.link, visitorInfo);
  } catch (error) {
    console.error("[VisitQueue] Error processing queue visit:", error.message || error);
  }
};
