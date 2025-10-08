module.exports = {
    apps: [
      // 🚀 Dev mode (live reload like Next.js)
      {
        name: 'GoGoTime-API-dev',
        script: 'yarn',
        args: 'dev',
        interpreter: 'bash',
        watch: ['src'],
        ignore_watch: ['node_modules', 'build'],
        env: {
          NODE_ENV: 'development',
          PORT: 4000
        }
      },
      // 🏗️ Production mode (compiled build)
      {
        name: 'GoGoTime-API',
        script: './build/index.js',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env_production: {
          NODE_ENV: 'production',
          PORT: 4000
        }
      }
    ]
  }
  