# 使用 Node.js Alpine 作为基础镜像
FROM node:20-alpine AS base

# 安装 nmap 和 tini (用于更好的信号处理和僵尸进程管理)
# tini 在基础 node 镜像中通常已包含，但明确指定没有坏处
RUN apk add --no-cache nmap tini

# 设置工作目录
WORKDIR /app

# 仅复制 package.json 和 package-lock.json (如果存在)
# 以便利用 Docker 的层缓存机制
COPY package*.json ./

# 安装依赖
# 使用国内镜像源加速
RUN npm config set registry https://registry.npmmirror.com && \
    npm install --omit=dev --no-audit --no-fund

# 复制应用代码
COPY server.js .

# 暴露服务端口
EXPOSE 3000

# 使用 tini 作为入口点，然后运行 Node 应用
# tini 有助于正确处理信号并避免僵尸进程
ENTRYPOINT ["/sbin/tini", "--"]

# 设置默认启动命令
CMD ["node", "server.js"] 