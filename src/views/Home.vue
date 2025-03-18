<template>
  <div class="home">
    <h1 class="page-title">欢迎使用工具箱</h1>
    <p class="description">这是一款集合多种实用工具的应用，帮助您提高工作效率</p>
    
    <div class="tools-grid">
      <div 
        v-for="tool in tools" 
        :key="tool.path" 
        class="tool-card"
        @click="navigateToTool(tool.path)"
      >
        <h2 class="tool-title">{{ tool.name }}</h2>
        <p class="tool-description">{{ tool.description }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      tools: [
        { 
          name: 'Markdown编辑器', 
          path: '/markdown-editor',
          description: '支持实时预览的Markdown编辑器，可编辑和渲染各种Markdown格式，包括数学公式'
        },
        { 
          name: 'JavaScript格式化', 
          path: '/js-formatter',
          description: '格式化JavaScript代码，使其更加规范和易读'
        },
        { 
          name: 'HTML格式化', 
          path: '/html-formatter',
          description: '格式化HTML代码，优化标签缩进和结构'
        },
        { 
          name: 'CSS格式化', 
          path: '/css-formatter',
          description: '格式化CSS代码，优化样式规则的排版'
        },
        { 
          name: 'JSON格式化', 
          path: '/json-formatter',
          description: '格式化JSON数据，使其结构清晰易读'
        }
      ]
    };
  },
  methods: {
    navigateToTool(path) {
      this.$router.push(path);
    }
  }
};
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
  text-align: center;
}

.description {
  text-align: center;
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 40px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.tool-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.tool-title {
  color: #42b983;
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.tool-description {
  color: #666;
  line-height: 1.5;
}
</style> 