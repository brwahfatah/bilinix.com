module.exports = {
  apps: [
    {
      name: 'bilinix-frontend',
      script: '.output/server/index.mjs',
      cwd: '/var/www/bilinix-frontend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '127.0.0.1',
        NUXT_PUBLIC_API_BASE: 'https://api.bilinix.com/api',
        NUXT_PUBLIC_APP_URL: 'https://bilinix.com',
        NUXT_PUBLIC_APP_ENV: 'production',
        NUXT_PUBLIC_ENABLE_DEV_MOCKS: 'false'
      },
      error_file: '/var/log/pm2/bilinix-frontend-error.log',
      out_file:   '/var/log/pm2/bilinix-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
}
