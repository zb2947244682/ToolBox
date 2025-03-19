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
        },
        {
          name: '阿里OSS上传',
          path: '/file-upload',
          description: '支持拖拽上传文件到阿里云OSS，可配置存储参数'
        },
        {
          name: '图片处理工具',
          path: '/image-processor',
          description: '多格式图片处理工具，支持JPG、PNG、WebP、ICO格式转换，压缩图片及Base64编码导入导出'
        },
        {
          name: 'PlantUML编辑器',
          path: '/plantuml-editor',
          description: '在线绘制UML图表，支持类图、时序图、用例图和活动图，实时预览'
        },
        {
          name: '颜色选择器/转换器',
          path: '/color-converter',
          description: '提供颜色选择器和格式转换功能，支持RGB、HEX、HSL等格式互转，方便前端开发处理颜色'
        },
        {
          name: 'URL编码/解码',
          path: '/url-encoder',
          description: '编码或解码URL参数，支持encodeURI、encodeURIComponent和Base64等多种编解码方式'
        },
        {
          name: '加密/解密工具',
          path: '/encryption-tool',
          description: '提供MD5、SHA256哈希计算和AES加密/解密等功能，满足基本的安全相关需求'
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