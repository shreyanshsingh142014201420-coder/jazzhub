// PM2 Process Configuration for JazzHub on AWS EC2
module.exports = {
  apps: [
    {
      name: 'jazzhub',
      script: 'server/server.js',
      cwd: '/var/www/jazzhub',
      instances: 'max', // Utilizes all available CPU cores on EC2
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '300M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true
    }
  ]
};
