# Markdown编辑器

这是一个基于Vue2的Markdown编辑器应用，支持KaTeX数学公式渲染和PlantUML图表生成。

## 功能特点

- Markdown实时预览
- 数学公式渲染（使用KaTeX）
- UML图表支持（通过PlantUML）
- 简洁现代的界面

## 技术栈

- Vue.js 2.x
- Webpack 5
- Nginx
- Docker & Docker Compose

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 使用Docker Compose部署

本项目使用Docker Compose进行容器化部署，包含两个服务：
1. 主应用（Markdown编辑器）
2. PlantUML服务器（用于UML图表渲染）

### 前提条件

- 安装 [Docker](https://docs.docker.com/get-docker/)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/)

### 部署步骤

1. 克隆仓库到您的服务器

```bash
git clone <仓库URL>
cd markdowneditor
```

2. 使用Docker Compose构建并启动服务

```bash
docker-compose up -d
```

这将执行以下操作：
- 构建主应用Docker镜像
- 拉取PlantUML服务器镜像
- 创建一个桥接网络
- 在端口8585上发布应用
- 配置服务间通信

3. 访问应用

部署完成后，可以通过以下地址访问应用：
```
http://<您的服务器IP>:8585
```

### 配置详解

- **主应用**：运行在Nginx容器中，端口映射为8585:80
- **PlantUML服务**：提供UML图表渲染支持
- **网络配置**：两个服务通过自定义桥接网络通信
- **持久化**：Nginx配置文件通过卷挂载实现持久化

### 停止服务

```bash
docker-compose down
```

### 更新应用

```bash
git pull
docker-compose up -d --build
```

## 自定义Nginx配置

可以通过修改项目根目录下的`nginx.conf`文件来自定义Nginx配置，然后重新启动容器：

```bash
docker-compose restart
``` 