# 构建阶段
FROM node:22.14.0-alpine AS build-stage
WORKDIR /app

# 首先只复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm config set registry https://npm.edu-sjtu.cn && \
    npm ci --no-audit --no-fund --maxsockets 1 --prefer-offline

# 复制源代码
COPY . .

# 设置构建环境变量
ENV NODE_OPTIONS="--max-old-space-size=512"

# 执行构建
RUN npm run build

# 生产阶段
FROM nginx:stable AS production-stage
WORKDIR /usr/share/nginx/html

# 复制构建产物
COPY --from=build-stage /app/dist .
COPY --from=build-stage /app/node_modules/katex/dist/katex.min.css .
COPY --from=build-stage /app/public/favicon.ico .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]