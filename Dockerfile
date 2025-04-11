# 构建阶段
FROM node:22.14.0-alpine AS build-stage
WORKDIR /app

# 复制依赖文件并安装
COPY package*.json ./
RUN npm config set registry https://npm.edu-sjtu.cn && \
    npm ci --verbose

# 复制源代码并构建
COPY . .
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