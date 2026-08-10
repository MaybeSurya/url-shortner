const Queue = require("bull");
const path = require("node:path");

const env = require("../env");

let visit;

const visitProcessor = require(path.resolve(__dirname, "visit.js"));

if (env.REDIS_ENABLED) {
  try {
    const redisOptions = env.REDIS_URL
      ? env.REDIS_URL
      : {
          port: env.REDIS_PORT,
          host: env.REDIS_HOST,
          db: env.REDIS_DB,
          ...(env.REDIS_PASSWORD && { password: env.REDIS_PASSWORD }),
          ...(env.REDIS_TLS && { tls: {} }),
        };

    visit = new Queue("visit", redisOptions);
    visit.clean(5000, "completed");
    visit.process(6, path.resolve(__dirname, "visit.js"));
    visit.on("completed", job => job.remove());
    visit.on("error", err => {
      console.error("[VisitQueue] Bull queue Redis error:", err.message);
    });
  } catch (err) {
    console.error("[VisitQueue] Failed to initialize Bull queue, using direct fallback:", err.message);
    visit = {
      add(data) {
        visitProcessor({ data }).catch(err => {
          console.error("[VisitQueue] Add visit error:", err.message || err);
        });
      }
    };
  }
} else {
  visit = {
    add(data) {
      visitProcessor({ data }).catch(err => {
        console.error("[VisitQueue] Add visit error:", err.message || err);
      });
    }
  };
}

module.exports = {
  visit,
};