# 构建阶段
FROM node:22.14.0-slim as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:latest as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY --from=build-stage /app/node_modules/katex/dist/katex.min.css /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 