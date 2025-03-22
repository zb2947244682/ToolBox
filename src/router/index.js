// 导入Vue核心库
import Vue from 'vue';
// 导入Vue路由插件
import VueRouter from 'vue-router';
// 导入首页组件
import Home from '../views/Home.vue';

// 将VueRouter安装为Vue插件
Vue.use(VueRouter);

// 定义路由配置数组
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home // 首页组件直接导入
  },
  {
    path: '/markdown-editor',
    name: 'MarkdownEditor',
    component: () => import('../views/MarkdownEditor.vue') // 使用懒加载方式导入Markdown编辑器组件
  },
  {
    path: '/js-formatter',
    name: 'JavaScriptFormatter',
    component: () => import('../views/JavaScriptFormatter.vue') // JavaScript格式化工具组件
  },
  {
    path: '/html-formatter',
    name: 'HTMLFormatter',
    component: () => import('../views/HTMLFormatter.vue') // HTML格式化工具组件
  },
  {
    path: '/css-formatter',
    name: 'CSSFormatter',
    component: () => import('../views/CSSFormatter.vue') // CSS格式化工具组件
  },
  {
    path: '/json-formatter',
    name: 'JSONFormatter',
    component: () => import('../views/JSONFormatter.vue') // JSON格式化工具组件
  },
  {
    path: '/file-upload',
    name: 'FileUpload',
    component: () => import('../views/FileUpload.vue') // 文件上传工具组件
  },
  {
    path: '/image-processor',
    name: 'ImageProcessor',
    component: () => import('../views/ImageProcessor.vue') // 图片处理工具组件
  },
  {
    path: '/plantuml-editor',
    name: 'PlantUMLEditor',
    component: () => import('../views/PlantUMLEditor.vue') // PlantUML编辑器组件
  },
  {
    path: '/color-converter',
    name: 'ColorConverter',
    component: () => import('../views/ColorConverter.vue') // 颜色转换工具组件
  },
  {
    path: '/url-encoder',
    name: 'UrlEncoder',
    component: () => import('../views/UrlEncoder.vue') // URL编码解码工具组件
  },
  {
    path: '/encryption-tool',
    name: 'EncryptionTool',
    component: () => import('../views/EncryptionTool.vue') // 加密解密工具组件
  }
];

// 创建路由实例
const router = new VueRouter({
  mode: 'history', // 使用HTML5 History模式，去除URL中的#号
  base: process.env.BASE_URL, // 应用的基路径，从环境变量中获取
  routes // 路由配置
});

// 导出路由实例
export default router; 