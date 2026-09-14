// ==============================================================================
// PM2 Ecosystem Configuration for JazzHub on AWS EC2
// ==============================================================================
// Usage:
//   pm2 start ecosystem.config.cjs
//   pm2 save
//   pm2 startup
// ==============================================================================

module.exports = {
  apps: [
    {
      name: 'jazzhub-api',
      script: 'server/server.js',
      cwd: '/var/www/jazzhub',
      instances: 1, // Runs 1 dedicated master instance, avoiding port conflicts
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/www/jazzhub/logs/pm2-error.log',
      out_file: '/var/www/jazzhub/logs/pm2-out.log',
      merge_logs: true,
      time: true
    }
  ]
};
