<template>
  <div class="markdown-editor">
    <div class="editor-header">
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
        <button class="btn" @click="exportImage" title="导出为PNG图片">
          <span>导出图片</span>
        </button>
        <button class="btn" @click="copyImage" title="复制图片到剪贴板">
          <span>复制图片</span>
        </button>
      </div>
    </div>
    
    <div class="editor-container">
      <div class="editor-section" ref="editorSection">
        <textarea 
          ref="markdownInput"
          v-model="markdownContent" 
          class="markdown-input" 
          placeholder="请输入Markdown内容..."
          @input="updateMarkdown"
          @scroll="syncScroll('editor')"
        ></textarea>
        <div class="editor-statusbar">
          <span>{{ lineCount }}行</span>
          <span>{{ charCount }}字符</span>
        </div>
      </div>
      <div class="preview-section" ref="previewSection" @scroll="syncScroll('preview')">
        <div class="preview-content" ref="previewContent" v-html="renderedContent"></div>
      </div>
    </div>
    
    <div class="copy-message" v-if="copyMessage" :class="{ show: copyMessage }">
      {{ copyMessage }}
    </div>
    
    <!-- 用于导出图片的隐藏容器 -->
    <div class="image-export-container" ref="exportContainer" v-show="false">
      <div class="preview-content export-content" ref="exportContent" v-html="renderedContent"></div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import katex from 'katex';
import * as htmlToImage from 'html-to-image';

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
      autoSaveInterval: null,
      scrollSyncLock: false, // 防止无限循环滚动的锁
      scrollTimeout: null,   // 滚动防抖
      lastScrollPosition: 0  // 上次滚动位置
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
      this.markdownContent = "";
    }
    
    this.updateMarkdown();
    
    // 确保初始滚动到顶部
    this.$nextTick(() => {
      this.lastScrollPosition = 0;
      
      if (this.$refs.markdownInput) {
        this.$refs.markdownInput.scrollTop = 0;
      }
      
      if (this.$refs.previewSection) {
        this.$refs.previewSection.scrollTop = 0;
      }
      
      // 初始化后释放滚动锁
      this.scrollSyncLock = false;
    });
    
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
        // 保存当前的滚动位置
        const editorTextarea = this.$refs.markdownInput;
        let scrollPercentage = 0;
        
        if (editorTextarea) {
          const scrollHeight = editorTextarea.scrollHeight - editorTextarea.clientHeight;
          if (scrollHeight > 0) {
            scrollPercentage = editorTextarea.scrollTop / scrollHeight;
          }
        }
        
        this.renderedContent = marked.parse(this.markdownContent);
        
        // 每次更新内容都保存
        this.saveToLocalStorage();
        
        // 在DOM更新后恢复滚动位置
        this.$nextTick(() => {
          if (editorTextarea) {
            const maxScroll = editorTextarea.scrollHeight - editorTextarea.clientHeight;
            if (maxScroll > 0) {
              // 清除锁状态，允许恢复滚动
              this.scrollSyncLock = false;
              
              // 设置滚动位置
              this.lastScrollPosition = scrollPercentage * maxScroll;
              editorTextarea.scrollTop = this.lastScrollPosition;
              
              // 使用防抖来同步滚动，减少渲染压力
              if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout);
              }
              
              this.scrollTimeout = setTimeout(() => {
                // 确保编辑区和预览区的比例一致
                this.syncScroll('editor');
              }, 50);
            }
          }
        });
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
      // 首先尝试使用现代的Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
          .then(() => {
            this.copyMessage = message;
            setTimeout(() => {
              this.copyMessage = '';
            }, 3000);
          })
          .catch(err => {
            console.error('复制失败:', err);
            this.fallbackCopyToClipboard(text, message);
          });
      } else {
        // 降级使用传统方法
        this.fallbackCopyToClipboard(text, message);
      }
    },
    
    fallbackCopyToClipboard(text, message) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // 避免滚动到文本区域
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          this.copyMessage = message;
        } else {
          this.copyMessage = '复制失败，请重试';
        }
      } catch (err) {
        console.error('复制失败:', err);
        this.copyMessage = '复制失败，请重试';
      }
      
      document.body.removeChild(textArea);
      
      setTimeout(() => {
        this.copyMessage = '';
      }, 3000);
    },
    
    // 导出图片功能
    exportImage() {
      // 从预览容器创建图片
      const container = this.$refs.previewContent;
      
      // 如果内容为空，显示提示
      if (!this.markdownContent.trim()) {
        this.copyMessage = '内容为空，无法导出图片';
        setTimeout(() => {
          this.copyMessage = '';
        }, 3000);
        return;
      }
      
      // 显示加载提示
      this.copyMessage = '正在生成图片...';
      
      // 使用html-to-image生成图片
      htmlToImage.toPng(container, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        style: {
          padding: '20px',
          boxSizing: 'border-box',
          width: '100%',
        }
      })
      .then(dataUrl => {
        // 创建下载链接
        const link = document.createElement('a');
        link.download = `markdown-${new Date().getTime()}.png`;
        link.href = dataUrl;
        link.click();
        
        // 显示成功消息
        this.copyMessage = '图片已成功导出';
        setTimeout(() => {
          this.copyMessage = '';
        }, 3000);
      })
      .catch(error => {
        console.error('导出图片失败:', error);
        this.copyMessage = '导出图片失败，请重试';
        setTimeout(() => {
          this.copyMessage = '';
        }, 3000);
      });
    },
    
    // 复制图片到剪贴板
    copyImage() {
      // 从预览容器创建图片
      const container = this.$refs.previewContent;
      
      // 如果内容为空，显示提示
      if (!this.markdownContent.trim()) {
        this.copyMessage = '内容为空，无法复制图片';
        setTimeout(() => {
          this.copyMessage = '';
        }, 3000);
        return;
      }
      
      // 显示加载提示
      this.copyMessage = '正在生成图片...';
      
      // 使用html-to-image生成Blob
      htmlToImage.toBlob(container, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        style: {
          padding: '20px',
          boxSizing: 'border-box',
          width: '100%',
        }
      })
      .then(blob => {
        // 使用Clipboard API复制图片
        try {
          // 检查浏览器是否支持写入图片到剪贴板
          if (navigator.clipboard && navigator.clipboard.write) {
            const item = new ClipboardItem({
              'image/png': blob
            });
            
            navigator.clipboard.write([item])
              .then(() => {
                this.copyMessage = '图片已复制到剪贴板';
                setTimeout(() => {
                  this.copyMessage = '';
                }, 3000);
              })
              .catch(err => {
                console.error('复制图片失败:', err);
                this.copyMessage = '复制图片失败，请重试';
                setTimeout(() => {
                  this.copyMessage = '';
                }, 3000);
              });
          } else {
            throw new Error('浏览器不支持复制图片到剪贴板');
          }
        } catch (err) {
          console.error('复制图片到剪贴板失败:', err);
          this.copyMessage = '您的浏览器不支持复制图片到剪贴板';
          setTimeout(() => {
            this.copyMessage = '';
          }, 3000);
        }
      })
      .catch(error => {
        console.error('生成图片失败:', error);
        this.copyMessage = '生成图片失败，请重试';
        setTimeout(() => {
          this.copyMessage = '';
        }, 3000);
      });
    },
    
    syncScroll(source) {
      // 如果锁定状态，不执行同步
      if (this.scrollSyncLock) return;
      
      // 清除之前的定时器，实现防抖
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
      
      // 使用requestAnimationFrame确保平滑滚动
      requestAnimationFrame(() => {
        // 设置锁，防止无限循环滚动
        this.scrollSyncLock = true;
        
        const editorElement = this.$refs.editorSection;
        const previewElement = this.$refs.previewSection;
        
        if (!editorElement || !previewElement) {
          this.scrollSyncLock = false;
          return;
        }
        
        // 获取当前滚动百分比
        let scrollPercentage;
        
        if (source === 'editor') {
          // 当从编辑区滚动触发时
          const editorTextarea = this.$refs.markdownInput;
          
          // 检查是否真的发生了滚动
          if (Math.abs(editorTextarea.scrollTop - this.lastScrollPosition) < 5) {
            this.scrollSyncLock = false;
            return;
          }
          
          this.lastScrollPosition = editorTextarea.scrollTop;
          
          // 计算滚动百分比，添加边界检查
          const editorScrollHeight = editorTextarea.scrollHeight - editorTextarea.clientHeight;
          scrollPercentage = editorScrollHeight <= 0 ? 0 : editorTextarea.scrollTop / editorScrollHeight;
          
          // 应用相同比例到预览区
          const maxScroll = previewElement.scrollHeight - previewElement.clientHeight;
          if (maxScroll > 0) {
            previewElement.scrollTop = scrollPercentage * maxScroll;
          }
        } else if (source === 'preview') {
          // 当从预览区滚动触发时
          // 检查是否真的发生了滚动
          if (Math.abs(previewElement.scrollTop - this.lastScrollPosition) < 5) {
            this.scrollSyncLock = false;
            return;
          }
          
          this.lastScrollPosition = previewElement.scrollTop;
          
          // 计算滚动百分比，添加边界检查
          const previewScrollHeight = previewElement.scrollHeight - previewElement.clientHeight;
          scrollPercentage = previewScrollHeight <= 0 ? 0 : previewElement.scrollTop / previewScrollHeight;
          
          // 应用相同比例到编辑区
          const editorTextarea = this.$refs.markdownInput;
          const maxScroll = editorTextarea.scrollHeight - editorTextarea.clientHeight;
          if (maxScroll > 0) {
            editorTextarea.scrollTop = scrollPercentage * maxScroll;
          }
        }
        
        // 使用定时器延迟解锁，合理的时间以减少卡顿感
        this.scrollTimeout = setTimeout(() => {
          this.scrollSyncLock = false;
        }, 100);
      });
    }
  }
};
</script>

<style>
.markdown-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #f5f5f5;
  overflow: hidden; /* 防止整体出现滚动条 */
  position: relative; /* 改回relative定位，不会覆盖导航栏 */
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #2c3e50;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10; /* 确保头部在顶层 */
  flex-shrink: 0; /* 防止头部被压缩 */
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
  overflow: hidden; /* 防止容器本身出现滚动条 */
  position: relative;
}

.editor-section, .preview-section {
  flex: 1;
  height: 100%;
  overflow: hidden; /* 改为hidden，避免多余的滚动条 */
  position: relative;
  display: flex;
  flex-direction: column;
}

.editor-section {
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
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
  overflow-y: auto; /* 只在文本区域显示垂直滚动条 */
  overflow-x: hidden; /* 隐藏水平滚动条 */
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
  flex-shrink: 0; /* 防止状态栏被压缩 */
}

.editor-statusbar span {
  margin-left: 15px;
}

.preview-section {
  background-color: #fff;
  overflow-y: auto; /* 只在预览区域显示垂直滚动条 */
  overflow-x: hidden; /* 隐藏水平滚动条 */
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
  z-index: 1000; /* 确保提示信息显示在最上层 */
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

/* 图片导出样式 */
.image-export-container {
  position: absolute;
  top: -9999px;
  left: -9999px;
  background-color: white;
  width: 800px; /* 固定宽度，可根据需要调整 */
  padding: 20px;
  box-sizing: border-box;
}

.export-content {
  background-color: white;
  padding: 20px;
  overflow: visible;
}
</style> 