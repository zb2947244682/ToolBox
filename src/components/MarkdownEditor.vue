<template>
  <div class="markdown-editor">
    <div class="editor-header">
      <h1>Markdown编辑器</h1>
      <div class="button-group">
        <button class="btn" @click="clearContent" title="清空编辑器">
          <span>清空</span>
        </button>
        <button class="btn" @click="copyMarkdown" title="复制Markdown内容">
          <span>复制MD</span>
        </button>
        <button class="btn" @click="copyPlainText" title="复制纯文本内容">
          <span>复制文本</span>
        </button>
        <button class="btn" @click="copyHtml" title="复制HTML内容">
          <span>复制HTML</span>
        </button>
      </div>
    </div>
    
    <div class="editor-container">
      <div class="editor-section">
        <textarea 
          ref="markdownInput"
          v-model="markdownContent" 
          class="markdown-input" 
          placeholder="请输入Markdown内容..."
          @input="updateMarkdown"
        ></textarea>
        <div class="editor-statusbar">
          <span>{{ lineCount }}行</span>
          <span>{{ charCount }}字符</span>
        </div>
      </div>
      <div class="preview-section">
        <div class="preview-content" v-html="renderedContent"></div>
      </div>
    </div>
    
    <div class="copy-message" v-if="copyMessage" :class="{ show: copyMessage }">
      {{ copyMessage }}
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import katex from 'katex';

// 创建自定义的LaTeX扩展
function createLatexExtension() {
  return {
    name: 'latex',
    level: 'inline',
    start(src) {
      const dollarPos = src.indexOf('$');
      const backslashPos = src.indexOf('\\');
      if (dollarPos === -1 && backslashPos === -1) return -1;
      return Math.min(
        dollarPos !== -1 ? dollarPos : Infinity,
        backslashPos !== -1 ? backslashPos : Infinity
      );
    },
    tokenizer(src) {
      // 行内LaTeX: $...$ 
      const inlineRule = /^\$([^\$]+)\$/;
      const inlineMatch = inlineRule.exec(src);
      if (inlineMatch) {
        return {
          type: 'latex',
          raw: inlineMatch[0],
          text: inlineMatch[1].trim(),
          displayMode: false
        };
      }

      // 块级LaTeX: $$...$$
      const blockRule = /^\$\$([^\$]+)\$\$/;
      const blockMatch = blockRule.exec(src);
      if (blockMatch) {
        return {
          type: 'latex',
          raw: blockMatch[0],
          text: blockMatch[1].trim(),
          displayMode: true
        };
      }
      
      // 行内LaTeX: \(...\)
      const inlineDelimiterRule = /^\\\((.+?)\\\)/s;
      const inlineDelimiterMatch = inlineDelimiterRule.exec(src);
      if (inlineDelimiterMatch) {
        return {
          type: 'latex',
          raw: inlineDelimiterMatch[0],
          text: inlineDelimiterMatch[1].trim(),
          displayMode: false
        };
      }
      
      // 块级LaTeX: \[...\]
      const blockDelimiterRule = /^\\\[(.+?)\\\]/s;
      const blockDelimiterMatch = blockDelimiterRule.exec(src);
      if (blockDelimiterMatch) {
        return {
          type: 'latex',
          raw: blockDelimiterMatch[0],
          text: blockDelimiterMatch[1].trim(),
          displayMode: true
        };
      }
      
      return null;
    },
    renderer(token) {
      try {
        return katex.renderToString(token.text, { 
          throwOnError: false, 
          displayMode: token.displayMode 
        });
      } catch (e) {
        console.error('KaTeX渲染公式错误:', e);
        return token.raw;
      }
    }
  };
}

// 配置marked选项
marked.use({
  extensions: [createLatexExtension()]
});

export default {
  name: 'MarkdownEditor',
  data() {
    return {
      markdownContent: '',
      renderedContent: '',
      copyMessage: '',
      autoSaveInterval: null
    };
  },
  computed: {
    lineCount() {
      return this.markdownContent.split('\n').length;
    },
    charCount() {
      return this.markdownContent.length;
    }
  },
  mounted() {
    // 从localStorage加载内容（如果有）
    const savedContent = localStorage.getItem('markdownContent');
    if (savedContent) {
      this.markdownContent = savedContent;
    } else {
      // 示例内容
      this.markdownContent = `# Markdown编辑器示例

这是一个支持**Markdown**和*LaTeX*的编辑器。

## Markdown功能

- **粗体文本**
- *斜体文本*
- ~~删除线文本~~
- [链接](https://www.example.com)
- \`行内代码\`

## LaTeX支持

行内公式（美元符格式）: $E = mc^2$

行内公式（括号格式）: \\( h_{\mu\nu} \\)

块级公式（美元符格式）:

$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$

块级公式（括号格式）:

\\[ h_{\mu\nu} = 2 \\int \\frac{d^3k}{(2\\pi)^3} e^{i\\vec{k}\\cdot\\vec{x}} \\left[ h_+(\\vec{k}, t) e^+_{\\mu\\nu}(\\vec{k}) + h_\\times(\\vec{k}, t) e^\\times_{\\mu\\nu}(\\vec{k}) \\right] \\]

其他LaTeX示例:
- \\( h_+ \\) 和 \\( h_\\times \\) 分别表示两种偏振模式（正交和交叉）。
- \\( e^+_{\\mu\\nu} \\) 和 \\( e^\\times_{\\mu\\nu} \\) 是偏振张量。
- \\( \\vec{k} \\) 是波矢量，\\( \\vec{x} \\) 是空间坐标。

代码块:

\`\`\`javascript
function hello() {
  console.log('Hello, world!');
}
\`\`\`

> 引用文本
`;
    }
    
    this.updateMarkdown();
    
    // 设置自动保存
    this.autoSaveInterval = setInterval(this.saveToLocalStorage, 10000); // 每10秒保存一次
  },
  beforeDestroy() {
    // 组件销毁前清除定时器
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  },
  methods: {
    updateMarkdown() {
      try {
        this.renderedContent = marked.parse(this.markdownContent);
        // 每次更新内容都保存
        this.saveToLocalStorage();
      } catch (e) {
        console.error('Markdown渲染错误:', e);
        this.renderedContent = '<div class="error">渲染错误</div>';
      }
    },
    
    saveToLocalStorage() {
      localStorage.setItem('markdownContent', this.markdownContent);
    },
    
    clearContent() {
      this.markdownContent = '';
      this.updateMarkdown();
    },
    
    copyMarkdown() {
      this.copyToClipboard(this.markdownContent, '已复制Markdown内容到剪贴板');
    },
    
    copyPlainText() {
      // 创建一个临时的div来获取纯文本
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.renderedContent;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      
      this.copyToClipboard(plainText, '已复制纯文本内容到剪贴板');
    },
    
    copyHtml() {
      this.copyToClipboard(this.renderedContent, '已复制HTML内容到剪贴板');
    },
    
    copyToClipboard(text, message) {
      // 使用现代的Clipboard API
      navigator.clipboard.writeText(text)
        .then(() => {
          // 显示提示消息
          this.copyMessage = message;
          
          // 3秒后隐藏提示
          setTimeout(() => {
            this.copyMessage = '';
          }, 3000);
        })
        .catch(err => {
          console.error('复制失败:', err);
          this.copyMessage = '复制失败，请重试';
          
          setTimeout(() => {
            this.copyMessage = '';
          }, 3000);
        });
    }
  }
};
</script>

<style>
.markdown-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: #f5f5f5;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #2c3e50;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.editor-header h1 {
  font-size: 1.5rem;
  margin: 0;
}

.button-group {
  display: flex;
  gap: 10px;
}

.btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: #3aa876;
}

.editor-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor-section, .preview-section {
  flex: 1;
  height: 100%;
  overflow: auto;
  position: relative;
}

.editor-section {
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
  position: relative;
  display: flex;
  flex-direction: column;
}

.markdown-input {
  width: 100%;
  flex: 1;
  padding: 20px;
  border: none;
  resize: none;
  outline: none;
  font-family: 'Consolas', monospace;
  font-size: 15px;
  line-height: 1.6;
}

.editor-statusbar {
  height: 25px;
  background-color: #f0f0f0;
  border-top: 1px solid #e0e0e0;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: #666;
  font-size: 12px;
}

.editor-statusbar span {
  margin-left: 15px;
}

.preview-section {
  background-color: #fff;
}

.preview-content {
  padding: 20px;
  line-height: 1.6;
}

.copy-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.copy-message.show {
  opacity: 1;
}

/* Markdown样式 */
.preview-content h1,
.preview-content h2,
.preview-content h3,
.preview-content h4,
.preview-content h5,
.preview-content h6 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.preview-content h1 {
  font-size: 2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3rem;
}

.preview-content h2 {
  font-size: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3rem;
}

.preview-content p {
  margin: 1rem 0;
}

.preview-content ul, 
.preview-content ol {
  padding-left: 2rem;
  margin: 1rem 0;
}

.preview-content blockquote {
  padding: 0.5rem 1rem;
  border-left: 4px solid #ddd;
  margin: 1rem 0;
  background-color: #f9f9f9;
}

.preview-content pre {
  background-color: #f6f8fa;
  padding: 1rem;
  border-radius: 3px;
  overflow: auto;
}

.preview-content code {
  font-family: 'Consolas', monospace;
  background-color: #f6f8fa;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.9rem;
}

.preview-content pre code {
  padding: 0;
  background-color: transparent;
}

.preview-content a {
  color: #0366d6;
  text-decoration: none;
}

.preview-content a:hover {
  text-decoration: underline;
}

.preview-content img {
  max-width: 100%;
}

.error {
  color: red;
  padding: 10px;
  border: 1px solid red;
  background-color: #fff0f0;
}

/* 美化滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style> 