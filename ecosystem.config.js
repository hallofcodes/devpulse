module.exports = {
  apps: [
    {
      name: "devpulse",
      script: "./node_modules/next/dist/bin/next",
      args: "start",
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
