# 构建阶段
FROM node:22.14.0-alpine AS build-stage
WORKDIR /app

# 首先只复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖，限制并发和内存使用
RUN npm config set registry https://npm.edu-sjtu.cn && \
    npm ci --no-audit --no-fund --maxsockets 1 --prefer-offline --max-old-space-size=1024

# 复制源代码
COPY . .

# 设置构建环境变量，限制内存使用
ENV NODE_OPTIONS="--max-old-space-size=1024"

# 执行构建，使用单线程
RUN npm run build -- --parallel false

# 生产阶段
FROM nginx:stable-alpine AS production-stage
WORKDIR /usr/share/nginx/html

# 复制构建产物
COPY --from=build-stage /app/dist .
COPY --from=build-stage /app/node_modules/katex/dist/katex.min.css .
COPY --from=build-stage /app/public/favicon.ico .

# 优化nginx配置
RUN echo "worker_processes 1;" > /etc/nginx/nginx.conf && \
    echo "worker_rlimit_nofile 1024;" >> /etc/nginx/nginx.conf && \
    echo "events { worker_connections 512; }" >> /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]