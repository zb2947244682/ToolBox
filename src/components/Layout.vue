<template>
  <div class="app-container">
    <header class="app-header">
      <router-link to="/" class="logo-link">
        <h1 class="logo">工具箱</h1>
      </router-link>
      <nav class="nav-tabs">
        <router-link 
          v-for="tool in tools" 
          :key="tool.path" 
          :to="tool.path" 
          class="tab"
          active-class="active"
        >
          {{ tool.name }}
        </router-link>
      </nav>
    </header>
    <main class="app-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'Layout',
  data() {
    return {
      tools: [
        { name: 'Markdown编辑器', path: '/markdown-editor' },
        { name: 'UML制图工具', path: '/plantuml-editor' },
        { name: 'JavaScript格式化', path: '/js-formatter' },
        { name: 'HTML格式化', path: '/html-formatter' },
        { name: 'CSS格式化', path: '/css-formatter' },
        { name: 'JSON格式化', path: '/json-formatter' },
        { name: '颜色选择器/转换器', path: '/color-converter' },
        { name: 'URL编码/解码', path: '/url-encoder' },
        { name: '加密/解密工具', path: '/encryption-tool' },
        { name: '图片处理工具', path: '/image-processor' },
        { name: '阿里OSS上传', path: '/file-upload' }
      ]
    };
  }
};
</script>

<style>
.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #2c3e50;
  color: white;
  padding: 0 20px;
  display: flex;
  align-items: center;
  min-height: 60px;
}

.logo-link {
  text-decoration: none;
  color: white;
  display: flex;
  align-items: center;
  height: 100%;
}

.logo {
  margin-right: 30px;
  font-size: 1.5rem;
  font-weight: bold;
  white-space: nowrap;
  color: white;
}

.nav-tabs {
  display: flex;
  flex-wrap: wrap;
  overflow-x: auto;
  padding: 5px 0;
  flex: 1;
}

.tab {
  width: 120px;
  padding: 0 10px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
  text-decoration: none;
  transition: all 0.3s;
  position: relative;
  white-space: nowrap;
  border-radius: 4px;
  margin: 0 2px;
  font-size: 0.9rem;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.tab.active {
  color: white;
  font-weight: 500;
  background-color: #42b983;
}

.app-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background-color: #f5f5f5;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .app-header {
    padding: 10px;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .logo {
    margin-right: 0;
    margin-bottom: 10px;
    font-size: 1.3rem;
  }
  
  .nav-tabs {
    width: 100%;
    padding: 0;
  }
  
  .tab {
    width: 110px;
    height: 36px;
    font-size: 0.85rem;
    margin-bottom: 5px;
    padding: 0 5px;
  }
}
</style> 