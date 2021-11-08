module.exports = {
  apps: [
    {
      name: 'Dash.ts',
      interpreter: 'bash',
      script: 'yarn.sh',
      args: 'dash',
      watch: false,
      autorestart: true,
    },
  ],
}
