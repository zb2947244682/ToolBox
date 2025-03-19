<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="logo">工具箱</h1>
      <nav class="nav-tabs">
        <router-link 
          to="/" 
          class="tab"
          exact
          active-class="active"
        >
          首页
        </router-link>

        <div 
          v-for="category in categories" 
          :key="category.name"
          class="dropdown-menu"
        >
          <div 
            class="tab dropdown-toggle"
            :class="{ 'active': isActiveCategory(category) }"
            @click="toggleDropdown(category)"
          >
            {{ category.name }}
            <i class="dropdown-icon" :class="{ 'open': openCategory === category.name }">▼</i>
          </div>
          <div class="dropdown-content" v-show="openCategory === category.name">
            <router-link 
              v-for="tool in category.tools" 
              :key="tool.path" 
              :to="tool.path" 
              class="dropdown-item"
              active-class="active"
            >
              {{ tool.name }}
            </router-link>
          </div>
        </div>
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
      openCategory: null,
      categories: [
        {
          name: '文本编辑器',
          tools: [
            { name: 'Markdown编辑器', path: '/markdown-editor' },
            { name: 'UML制图工具', path: '/plantuml-editor' }
          ]
        },
        {
          name: '代码格式化',
          tools: [
            { name: 'JavaScript格式化', path: '/js-formatter' },
            { name: 'HTML格式化', path: '/html-formatter' },
            { name: 'CSS格式化', path: '/css-formatter' },
            { name: 'JSON格式化', path: '/json-formatter' }
          ]
        },
        {
          name: '编码转换',
          tools: [
            { name: '颜色选择器/转换器', path: '/color-converter' },
            { name: 'URL编码/解码', path: '/url-encoder' },
            { name: '加密/解密工具', path: '/encryption-tool' }
          ]
        },
        {
          name: '多媒体工具',
          tools: [
            { name: '图片处理工具', path: '/image-processor' },
            { name: '阿里OSS上传', path: '/file-upload' }
          ]
        }
      ]
    };
  },
  methods: {
    toggleDropdown(category) {
      if (this.openCategory === category.name) {
        this.openCategory = null;
      } else {
        this.openCategory = category.name;
      }
    },
    isActiveCategory(category) {
      return category.tools.some(tool => this.$route.path === tool.path);
    }
  },
  watch: {
    '$route'() {
      // 路由变化时，检查当前路由是否在某个分类下，如果在，自动打开该分类
      const currentPath = this.$route.path;
      for (const category of this.categories) {
        if (category.tools.some(tool => tool.path === currentPath)) {
          this.openCategory = category.name;
          break;
        }
      }
    }
  },
  mounted() {
    // 初始加载时，检查当前路由并打开对应分类
    const currentPath = this.$route.path;
    for (const category of this.categories) {
      if (category.tools.some(tool => tool.path === currentPath)) {
        this.openCategory = category.name;
        break;
      }
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
  flex-wrap: wrap;
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

/* 下拉菜单样式 */
.dropdown-menu {
  position: relative;
  height: 100%;
}

.dropdown-toggle {
  cursor: pointer;
  user-select: none;
}

.dropdown-icon {
  margin-left: 5px;
  font-size: 9px;
  transition: transform 0.3s;
}

.dropdown-icon.open {
  transform: rotate(180deg);
}

.dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 180px;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 0 0 4px 4px;
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
  display: block;
  padding: 12px 15px;
  color: #2c3e50;
  text-decoration: none;
  transition: all 0.3s;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item.active {
  background-color: #42b983;
  color: white;
}

/* 响应式调整 */
@media (max-width: 900px) {
  .nav-tabs {
    flex-wrap: wrap;
    overflow-x: auto;
  }
  
  .tab {
    height: 60px;
  }
  
  .dropdown-content {
    width: 100%;
  }
}
</style> 