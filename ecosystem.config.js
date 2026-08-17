module.exports = {
  apps: [
    {
      name: "sury",
      script: "./server/server.js",
      args: "--production",

      // Single instance — Neon + Upstash are the bottleneck, not CPU
      // Increase to 2 on the ARM A1 (4 vCPU / 24 GB) instance
      instances: 1,
      exec_mode: "fork",

      // Restart if memory exceeds 400 MB (free tier safety net)
      max_memory_restart: "400M",

      // Auto-restart on crash with exponential backoff
      autorestart: true,
      min_uptime: "10s",
      max_restarts: 10,

      // Watch nothing — use pm2 reload for deploys
      watch: false,

      // Environment — inherits from the .env file via dotenv in server/env.js
      // No need to duplicate .env here
      env: {
        NODE_ENV: "production",
        NODE_APP_INSTANCE: 0,
      },

      // Logs
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // Graceful shutdown — wait up to 5s for in-flight requests to finish
      kill_timeout: 5000,
      listen_timeout: 3000,
    },
  ],
};
