#!/bin/bash

# ===========================================
# 🚀 PM2 一键部署脚本
# ===========================================

set -e

echo "🚀 开始使用 PM2 部署 API 服务..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装，请先安装 Node.js${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js 版本：$(node -v)${NC}"

# 检查 PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 未安装，正在安装...${NC}"
    npm install -g pm2
    echo -e "${GREEN}✅ PM2 安装完成${NC}"
else
    echo -e "${GREEN}✅ PM2 版本：$(pm2 -v)${NC}"
fi

echo ""

# 进入 API 目录
cd "$(dirname "$0")"

echo "📦 安装依赖..."
pnpm install --prod

echo ""
echo "🔨 构建项目..."
pnpm build

echo ""
echo "🧹 停止旧的进程..."
pm2 stop hilton-api 2>/dev/null || true
pm2 delete hilton-api 2>/dev/null || true

echo ""
echo "🚀 启动 PM2..."
pm2 start ecosystem.config.js

echo ""
echo "💾 保存 PM2 配置..."
pm2 save

echo ""
echo -e "${GREEN}✅ PM2 部署完成！${NC}"
echo ""
echo "📊 服务状态:"
pm2 list

echo ""
echo ""
echo "📝 常用命令:"
echo "   - 查看日志：pm2 logs hilton-api"
echo "   - 实时监控：pm2 monit"
echo "   - 重启服务：pm2 restart hilton-api"
echo "   - 停止服务：pm2 stop hilton-api"
echo "   - 查看列表：pm2 list"
echo ""
