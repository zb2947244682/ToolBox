# ToolBox

ToolBox是一个基于Vue.js的工具集合项目，集成了多种实用工具功能。

## 功能特点

- 基于Vue.js 2.x构建的单页应用
- 集成了PlantUML服务器用于UML图表生成
- 支持Markdown和数学公式（KaTeX）渲染
- 图片压缩处理功能
- 阿里云OSS对象存储集成

## 开发环境

### 前提条件

- Node.js v18+
- npm v9+

### 安装依赖

```bash
# 使用npm安装依赖
npm install
```

### 本地开发

```bash
# 启动开发服务器
npm run dev
```

开发服务器启动后会自动打开浏览器，默认访问地址为 http://localhost:8080

### 构建生产版本

```bash
# 构建生产环境应用
npm run build
```

构建完成后，生产文件将生成在 `dist` 目录中。

## Docker部署

本项目支持Docker容器化部署，并提供了完整的Docker Compose配置。

### 使用Docker Compose部署

```bash
# 构建并启动所有服务
docker-compose up -d
```

应用将在 http://localhost:8585 可访问。

## 配置说明

- Nginx配置文件: `nginx.conf`
- Webpack配置: `webpack.config.js`
- Docker构建配置: `Dockerfile`
- Docker Compose配置: `docker-compose.yml`

## 项目结构

```
toolbox/
├── src/               # 源代码目录
│   ├── components/    # Vue组件
│   ├── router/        # 路由配置
│   ├── utils/         # 工具函数
│   ├── views/         # 页面视图
│   ├── App.vue        # 主应用组件
│   └── main.js        # 应用入口文件
├── public/            # 静态资源
├── dist/              # 构建输出目录
├── Dockerfile         # Docker构建文件
├── docker-compose.yml # Docker Compose配置
└── nginx.conf         # Nginx配置
```
