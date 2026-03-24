module.exports = {
  apps: [
    {
      name: 'hilton-api',
      script: 'dist/main.js',
      instances: 'max', // 使用 CPU 核心数的最大值，或指定具体数字如 4
      exec_mode: 'cluster', // 集群模式
      watch: false, // 生产环境关闭文件监听
      max_memory_restart: '500M', // 内存超过 500M 自动重启
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true, // 日志中添加时间戳
      merge_logs: true, // 合并集群模式的日志
      autorestart: true, // 自动重启
      max_restarts: 10, // 最大重启次数
      min_uptime: '10s', // 最小运行时间
    },
  ],
};
