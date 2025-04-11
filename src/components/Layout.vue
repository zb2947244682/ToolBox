<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-top">
        <router-link to="/" class="logo-link">
          <h1 class="logo">工具箱</h1>
        </router-link>
        <button class="menu-toggle" @click="toggleMenu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      <nav class="nav-tabs" :class="{ 'show-menu': menuVisible }">
        <router-link 
          v-for="tool in tools" 
          :key="tool.path" 
          :to="tool.path" 
          class="tab"
          active-class="active"
          @click="menuVisible = false"
        >
          {{ tool.name }}
        </router-link>
      </nav>
    </header>
    <main class="app-content">
      <div class="content-wrapper">
        <router-view></router-view>
      </div>
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
      ],
      menuVisible: false
    };
  },
  methods: {
    toggleMenu() {
      this.menuVisible = !this.menuVisible;
    },
    closeMenu() {
      this.menuVisible = false;
    }
  },
  watch: {
    $route() {
      // 路由变化时关闭菜单
      this.closeMenu();
    }
  }
};
</script>

<style>
.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  background-color: #2c3e50;
  color: white;
  padding: 0 20px;
  display: flex;
  align-items: center;
  min-height: 60px;
  z-index: 10;
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

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  z-index: 200;
}

.menu-toggle span {
  display: block;
  width: 25px;
  height: 3px;
  background-color: white;
  margin: 5px 0;
  transition: all 0.3s ease;
}

.nav-tabs {
  display: flex;
  flex-wrap: wrap;
  overflow-x: auto;
  padding: 5px 0;
  flex: 1;
}

.tab {
  width: 150px;
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
  position: relative;
  overflow: hidden;
  background-color: #f5f5f5;
}

.content-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  padding: 20px;
  -webkit-overflow-scrolling: touch;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .app-header {
    padding: 10px;
    flex-direction: column;
    align-items: flex-start;
    height: auto;
    position: relative;
    z-index: 100;
  }
  
  .header-top {
    width: 100%;
  }
  
  .menu-toggle {
    display: block;
  }
  
  .logo {
    margin-right: 0;
    margin-bottom: 0;
    font-size: 1.3rem;
  }
  
  .nav-tabs {
    width: 100%;
    padding: 0;
    display: none;
    flex-direction: column;
    overflow-y: auto;
    max-height: 0;
    transition: max-height 0.3s ease;
  }
  
  .nav-tabs.show-menu {
    display: flex;
    max-height: 100vh;
    margin-top: 0;
    position: fixed;
    top: 55px;
    left: 0;
    right: 0;
    background-color: #2c3e50;
    z-index: 99;
    padding: 0;
    overflow-y: auto;
  }
  
  .tab {
    width: 100%;
    min-width: auto;
    height: 50px;
    font-size: 1rem;
    margin: 0;
    padding: 0 10px;
    border-radius: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .app-content {
    flex: 1;
    position: relative;
    background-color: #f5f5f5;
  }
  
  .content-wrapper {
    padding: 10px;
  }
}

@media (min-width: 769px) {
  .header-top {
    flex: 0;
  }
  
  .nav-tabs {
    display: flex !important;
    max-height: none !important;
    position: static !important;
    padding: 5px 0 !important;
    background-color: transparent !important;
  }
  
  .tab {
    width: 150px;
    height: 40px;
    font-size: 0.9rem;
    margin: 0 2px;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 8px;
  }
  
  .logo {
    font-size: 1.2rem;
  }
}
</style> 