const { Router } = require("express");

const asyncHandler = require("../utils/asyncHandler");
const auth = require("../handlers/auth.handler");
const redis = require("../redis");
const env = require("../env");

const router = Router();

/**
 * GET /api/v2/admin/settings
 * Returns a sanitized snapshot of the current platform configuration.
 * Secrets are masked — only their presence/absence is reported.
 */
router.get(
  "/settings",
  asyncHandler(auth.apikey),
  asyncHandler(auth.jwt),
  asyncHandler(auth.admin),
  (req, res) => {
    const mask = (val) => (val && val.length > 0 ? "••••••••" : "");
    const isSet = (val) => !!(val && val.length > 0);

    const config = {
      platform: {
        site_name: env.SITE_NAME,
        default_domain: env.DEFAULT_DOMAIN,
        link_length: env.LINK_LENGTH,
        link_custom_alphabet: env.LINK_CUSTOM_ALPHABET,
        disallow_registration: env.DISALLOW_REGISTRATION,
        disallow_anonymous_links: env.DISALLOW_ANONYMOUS_LINKS,
        disallow_login_form: env.DISALLOW_LOGIN_FORM,
        trust_proxy: env.TRUST_PROXY,
        enable_rate_limit: env.ENABLE_RATE_LIMIT,
      },
      server: {
        port: env.PORT,
        node_env: process.env.NODE_ENV || "development",
        node_app_instance: env.NODE_APP_INSTANCE,
        server_ip_address: env.SERVER_IP_ADDRESS || null,
        server_cname_address: env.SERVER_CNAME_ADDRESS || null,
      },
      database: {
        client: env.DB_CLIENT,
        host: env.DB_CLIENT.includes("sqlite") ? null : env.DB_HOST,
        port: env.DB_CLIENT.includes("sqlite") ? null : env.DB_PORT,
        name: env.DB_CLIENT.includes("sqlite") ? env.DB_FILENAME : env.DB_NAME,
        user: env.DB_CLIENT.includes("sqlite") ? null : env.DB_USER,
        password_set: env.DB_CLIENT.includes("sqlite") ? null : isSet(env.DB_PASSWORD),
        ssl: env.DB_SSL,
        pool_min: env.DB_POOL_MIN,
        pool_max: env.DB_POOL_MAX,
      },
      redis: {
        enabled: env.REDIS_ENABLED,
        connected: !!(redis.client && (redis.client.status === "ready" || redis.client.status === "connect")),
        status: !env.REDIS_ENABLED
          ? "disabled"
          : (redis.client && (redis.client.status === "ready" || redis.client.status === "connect"))
          ? "ok"
          : "warn",
        url_set: isSet(env.REDIS_URL),
        url_preview: env.REDIS_URL
          ? env.REDIS_URL.replace(/:[^:@]+@/, ":***@")
          : null,
        host: isSet(env.REDIS_URL) ? null : env.REDIS_HOST,
        port: isSet(env.REDIS_URL) ? null : env.REDIS_PORT,
        db: isSet(env.REDIS_URL) ? null : env.REDIS_DB,
        password_set: isSet(env.REDIS_URL) ? null : isSet(env.REDIS_PASSWORD),
        tls: env.REDIS_TLS,
      },
      mail: {
        enabled: env.MAIL_ENABLED,
        host: env.MAIL_HOST || null,
        port: env.MAIL_PORT,
        secure: env.MAIL_SECURE,
        user: env.MAIL_USER || null,
        from: env.MAIL_FROM || null,
        report_email: env.REPORT_EMAIL || null,
        contact_email: env.CONTACT_EMAIL || null,
      },
      oidc: {
        enabled: env.OIDC_ENABLED,
        issuer: env.OIDC_ISSUER || null,
        client_id_set: isSet(env.OIDC_CLIENT_ID),
        client_secret_set: isSet(env.OIDC_CLIENT_SECRET),
        scope: env.OIDC_SCOPE,
        email_claim: env.OIDC_EMAIL_CLAIM,
        prompt: env.OIDC_PROMPT || null,
        button_text: env.OIDC_BUTTON_TEXT,
      },
      security: {
        jwt_secret_set: isSet(env.JWT_SECRET),
        custom_domain_use_https: env.CUSTOM_DOMAIN_USE_HTTPS,
      },
    };

    return res.status(200).json(config);
  }
);

module.exports = router;
