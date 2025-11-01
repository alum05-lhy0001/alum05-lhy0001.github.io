module.exports = {
  apps: [
    {
      name: 'react-canvas-api',
      script: 'index.cjs',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
  ],
}
