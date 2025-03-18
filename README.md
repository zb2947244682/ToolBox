# Markdown编辑器

一个基于Vue2的简洁、功能强大的Markdown编辑器，支持实时预览和LaTeX数学公式渲染。

## 📚 功能特点

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

#### 构建生产版本

```bash
npm run build
```

### 方式二：Docker 部署

本项目已添加Docker支持，您可以通过以下步骤快速部署：

#### 使用 Docker Compose（推荐）

```bash
# 构建并启动容器
docker-compose up

# 后台运行
docker-compose up -d

# 停止服务
docker-compose down
```

#### 手动构建和运行 Docker 镜像

```bash
# 构建镜像
docker build -t markdown-editor .

# 运行容器
docker run -p 30030:30030 -d markdown-editor
```

应用将在 http://localhost:30030 上运行。

## 💡 使用示例

这个编辑器支持多种格式的LaTeX公式输入：

### 行内公式

- 美元符格式: `$E = mc^2$`
- 括号格式: `\( h_{\mu\nu} \)`

### 块级公式

- 美元符格式:
```
$$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$
```

- 括号格式:
```
\[ h_{\mu\nu} = 2 \int \frac{d^3k}{(2\pi)^3} e^{i\vec{k}\cdot\vec{x}} \left[ h_+(\vec{k}, t) e^+_{\mu\nu}(\vec{k}) + h_\times(\vec{k}, t) e^\times_{\mu\nu}(\vec{k}) \right] \]
```

## 🔧 技术栈

- Vue 2.7
- Marked (Markdown解析)
- KaTeX (LaTeX渲染)
- Webpack (打包工具)

## 📄 许可证

此项目采用MIT许可证。

## 🤝 贡献

欢迎提出问题、功能请求或通过拉取请求贡献代码。

---

祝您使用愉快！✨ 