module.exports = {
  apps: [
    {
      name: 'Dash.ts',
      interpreter: 'bash',
      script: 'yarn',
      args: 'dash',
      watch: false,
      autorestart: true,
    },
  ],
};
