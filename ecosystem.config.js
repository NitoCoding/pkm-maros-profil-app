// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "pkm-profil-app",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "/home/developer/pkm_profil_app",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "0.0.0.0",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      max_memory_restart: "500M",
      out_file: "/home/developer/pkm_profil_app/logs/pm2-out.log",
      error_file: "/home/developer/pkm_profil_app/logs/pm2-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
