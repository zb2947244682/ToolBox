<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="logo">工具箱</h1>
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
        { name: '首页', path: '/' },
        { name: 'Markdown编辑器', path: '/markdown-editor' },
        { name: '代码格式化', path: '/code-formatter' },
        { name: '图片压缩', path: '/image-compressor' },
        { name: '计算器', path: '/calculator' },
        { name: '单位转换', path: '/unit-converter' }
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
  height: 60px;
}

.logo {
  margin-right: 30px;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-tabs {
  display: flex;
  height: 100%;
}

.tab {
  padding: 0 15px;
  height: 100%;
  display: flex;
  align-items: center;
  color: #ccc;
  text-decoration: none;
  transition: all 0.3s;
  position: relative;
}

.tab:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.tab.active {
  color: white;
  font-weight: 500;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #42b983;
}

.app-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background-color: #f5f5f5;
}
</style> 