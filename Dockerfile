# 构建阶段
FROM node:22.14.0-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
# 设置 npm 源为阿里镜像
RUN npm config set registry https://registry.npmmirror.com && npm install
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:latest AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY --from=build-stage /app/node_modules/katex/dist/katex.min.css /usr/share/nginx/html/
COPY --from=build-stage /app/public/favicon.ico /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]