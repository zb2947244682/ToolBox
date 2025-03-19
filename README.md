# ToolBox 开发工具箱

一个基于Vue2的多功能开发工具集合，包含Markdown编辑器、PlantUML编辑器、代码格式化工具、文件上传等组件。

## 📚 功能特点

### 📝 Markdown编辑器
- 💻 **实时预览**：一边编辑，一边查看渲染效果
- 📝 **完整的Markdown支持**：支持标题、列表、引用、链接、代码块等Markdown语法
- 🧮 **强大的LaTeX数学公式支持**：
  - 支持行内公式：`$公式$` 和 `\(公式\)`
  - 支持块级公式：`$$公式$$` 和 `\[公式\]`
  - 完美渲染复杂的物理和数学表达式
- 📋 **便捷的复制功能**：
  - 复制Markdown源码
  - 复制渲染后的纯文本
  - 复制HTML内容
- 💾 **自动保存**：每10秒自动保存内容到本地存储
- 🧹 **一键清空**：快速清除编辑器内容
- 🔄 **滚动同步**：编辑区和预览区滚动位置同步，提升阅读体验

### 🧰 代码格式化工具
- **JavaScript格式化器**：美化和格式化JavaScript代码
- **HTML格式化器**：整理HTML代码结构和缩进
- **CSS格式化器**：优化CSS代码格式
- **JSON格式化器**：格式化JSON数据，提高可读性

### 🖼️ PNG转ICO工具
- **简单易用**：支持拖拽上传或点击选择PNG图片
- **实时预览**：上传后可预览原始图片
- **自动优化**：自动将图片调整为标准ICO尺寸(64x64像素)
- **格式转换**：将PNG格式转换为标准的ICO格式
- **文件大小显示**：显示原始文件的大小信息
- **便捷下载**：一键转换并自动下载生成的ICO文件
- **状态提示**：清晰的操作状态和结果提示

### 📤 文件上传功能
- **图片压缩**：上传前自动压缩图片，提高传输速度
- **阿里云OSS支持**：集成阿里云对象存储服务
- **上传进度显示**：实时显示文件上传进度
- **多文件上传**：支持批量文件上传

### 📊 PlantUML编辑器
- 🔄 **实时预览**：编写代码的同时查看图表效果
- 📥 **一键下载**：支持将图表下载为PNG格式
- 📝 **丰富示例**：内置多种常用图表示例
  - 类图：展示类之间的关系和结构
  - 时序图：描述系统交互和消息流
  - 用例图：展示系统功能和用户交互
  - 活动图：描述业务流程和决策
  - 组件图：展示系统架构和依赖
  - 状态图：展示状态转换和流程
  - 对象图：展示实例之间的关系
  - 部署图：描述系统部署架构
- 🎨 **自动生成**：输入时自动更新预览
- 🌐 **在线渲染**：使用PlantUML官方服务确保最佳效果

## 🚀 快速开始

### 方式一：传统安装

#### 安装依赖

```bash
npm install
```

#### 开发模式

```bash
npm run dev
```

访问 http://localhost:8080 查看应用。

#### 构建生产版本

```bash
npm run build
```

### 方式二：Docker 部署

本项目已添加Docker支持，您可以通过以下步骤快速部署：

#### 配置Docker镜像加速

由于Docker Hub访问可能较慢，建议配置以下镜像加速器：

Windows/Mac: 在Docker Desktop设置中的"Docker Engine"选项卡添加以下配置：

```json
{
  "registry-mirrors": [
    "https://docker.zhai.cm",
    "https://a.ussh.net",
    "https://hub.littlediary.cn",
    "https://hub.rat.dev",
    "https://atomhub.openatom.cn",
    "https://docker.m.daocloud.io",
    "https://docker.1ms.run",
    "https://dytt.online",
    "https://func.ink",
    "https://lispy.org",
    "https://docker.xiaogenban1993.com",
    "https://docker.mybacc.com",
    "https://docker.yomansunter.com",
    "https://dockerhub.websoft9.com"
  ]
}
```

Linux: 编辑 `/etc/docker/daemon.json` 文件，添加上述配置，然后重启Docker服务：
```bash
sudo systemctl restart docker
```

#### 使用 Docker Compose

```bash
# 构建并启动容器
docker-compose up

# 后台运行
docker-compose up -d

# 停止服务
docker-compose down
```

应用将在 http://localhost:30030 上运行。

## 💡 使用示例

### Markdown编辑器

这个编辑器支持多种格式的LaTeX公式输入：

#### 行内公式

- 美元符格式: `$E = mc^2$`
- 括号格式: `\( h_{\mu\nu} \)`

#### 块级公式

- 美元符格式:
```
$$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$
```

- 括号格式:
```
\[ h_{\mu\nu} = 2 \int \frac{d^3k}{(2\pi)^3} e^{i\vec{k}\cdot\vec{x}} \left[ h_+(\vec{k}, t) e^+_{\mu\nu}(\vec{k}) + h_\times(\vec{k}, t) e^\times_{\mu\nu}(\vec{k}) \right] \]
```

### 代码格式化

在相应的格式化工具中粘贴代码，点击"格式化"按钮即可获得格式化后的代码。每种格式化工具都提供了复制和清空功能。

### 文件上传

在文件上传页面，可以选择文件并上传至OSS存储，支持图片压缩、拖拽上传和批量处理。

## 🔧 技术栈

- Vue 2.7
- Vue Router 3.6
- Marked (Markdown解析)
- KaTeX (LaTeX渲染)
- Ali-OSS (阿里云对象存储SDK)
- Webpack 5 (打包工具)
- Docker (容器化部署)

## 📄 许可证

此项目采用MIT许可证。

## 🤝 贡献

欢迎提出问题、功能请求或通过拉取请求贡献代码。

---

祝您使用愉快！✨ 