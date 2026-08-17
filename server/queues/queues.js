// Bull queue is NOT used — it requires persistent blocking Redis connections
// (BLPOP, pub/sub) which Upstash serverless kills with EPIPE/ECONNRESET.
//
// Visit tracking is handled directly via query.visit.recordVisitDirect()
// in the redirect handler (fire-and-forget). This lightweight dispatcher
// is kept as a fallback for anything that calls queue.visit.add().

const path = require("node:path");
const visitProcessor = require(path.resolve(__dirname, "visit.js"));

const visit = {
  add(data) {
    // Run async, never block the redirect response
    visitProcessor({ data }).catch(err => {
      console.error("[VisitQueue] Error:", err.message || err);
    });
  },
};

module.exports = { visit };