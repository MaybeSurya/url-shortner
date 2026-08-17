const env = require("./env");

const cookieParser = require("cookie-parser");
const passport = require("passport");
const express = require("express");
const session = require("cookie-session");
const helmet = require("helmet");
const compression = require("compression");
const path = require("node:path");
const hbs = require("hbs");

const helpers = require("./handlers/helpers.handler");
const renders = require("./handlers/renders.handler");
const asyncHandler = require("./utils/asyncHandler");
const locals = require("./handlers/locals.handler");
const links = require("./handlers/links.handler");
const routes = require("./routes");
const utils = require("./utils");


const models = require("./models");
const knex = require("./knex");

// ensure database tables exist
(async () => {
  try {
    if (models.createVisitTable) {
      await models.createVisitTable(knex);
    }
  } catch (err) {
    console.error("[Database] Table initialization check warning:", err.message);
  }
})();

// run the cron jobs
if (env.NODE_APP_INSTANCE === 0) {
  require("./cron");
}

// intialize passport authentication library
require("./passport");

// create express app
const app = express();

// Disable X-Powered-By header for security
app.disable("x-powered-by");

// express app setup
if (env.TRUST_PROXY) {
  app.set("trust proxy", true);
}

app.use(compression({ threshold: 1024 })); // skip compressing tiny responses
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  frameguard: { action: "deny" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// use cookie sessions only when OIDC is enabled
// because only OIDC is using it
if (env.OIDC_ENABLED) {
  app.use(session({
    keys: [env.JWT_SECRET],
    maxAge: 1000 * 60 * 60 * 24 * 7, // expire after seven days
  }));
}

// serve static
app.use("/images", express.static("custom/images", { maxAge: "1d" }));
app.use("/css", express.static("custom/css", { extensions: ["css"], maxAge: "1d" }));
app.use(express.static("static", { maxAge: "1d" }));
app.use(express.static(path.join(__dirname, "../dist"), {
  maxAge: "1y",
  immutable: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    }
  }
}));

app.use(passport.initialize());
app.use(locals.isHTML);
app.use(locals.config);

// template engine / serve html
app.set("view engine", "hbs");
app.set("views", [
  path.join(__dirname, "../custom/views"),
  path.join(__dirname, "views"),
]);
utils.registerHandlebarsHelpers();

// if is custom domain, redirect to the set homepage
app.use(asyncHandler(links.redirectCustomDomainHomepage));

// handle api requests
app.use("/api/v2", routes.api);
app.use("/api", routes.api);

// serve React SPA index.html for client pages if dist/index.html exists
app.get([
  "/",
  "/dashboard",
  "/links",
  "/analytics",
  "/settings",
  "/admin",
  "/login",
  "/signup",
  "/reset-password",
  "/404"
], (req, res, next) => {
  const spaIndex = path.join(__dirname, "../dist/index.html");
  const fs = require("fs");
  if (fs.existsSync(spaIndex)) {
    return res.sendFile(spaIndex);
  }
  next();
});

// render legacy hbs html pages fallback
app.use("/", routes.render);

// finally, redirect the short link to the target
app.get("/:id", (req, res, next) => {
  // Prevent search engines from crawling short links
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  asyncHandler(links.redirect)(req, res, next);
});

// 404 pages that don't exist
app.get("*", (req, res, next) => {
  const spaIndex = path.join(__dirname, "../dist/index.html");
  const fs = require("fs");
  if (req.isHTML && fs.existsSync(spaIndex)) {
    return res.sendFile(spaIndex);
  }
  renders.notFound(req, res, next);
});

// handle errors coming from above routes
app.use(helpers.error);
  
app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`> Ready on http://0.0.0.0:${env.PORT}`);
});
