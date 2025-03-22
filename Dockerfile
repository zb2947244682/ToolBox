# 构建阶段
FROM node:22.14.0-alpine AS build-stage
WORKDIR /app

# 复制 package.json 和 package-lock.json，单独一层以利用缓存
COPY package.json package-lock.json ./

# 设置 npm 源为阿里镜像，并优化 npm install 的资源占用
RUN npm config set registry https://registry.npmmirror.com && \
    npm install --no-audit --no-fund --maxsockets 1

# 复制其余文件
COPY . .

# 限制 Node.js 内存使用，并运行构建
ENV NODE_OPTIONS="--max-old-space-size=1024"
RUN npm run build

# 生产阶段
FROM nginx:alpine AS production-stage

# 复制构建产物到 Nginx 目录
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制额外的静态资源
COPY --from=build-stage /app/node_modules/katex/dist/katex.min.css /usr/share/nginx/html/
COPY --from=build-stage /app/public/favicon.ico /usr/share/nginx/html/

# 暴露端口并启动 Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]