<template>
  <div class="code-formatter">
    <h1 class="tool-title">HTML代码格式化</h1>
    
    <div class="formatter-container">
      <div class="editor-wrapper">
        <div class="editor">
          <textarea 
            v-model="inputCode" 
            placeholder="请输入需要格式化的HTML代码..."
            @input="updateWordCount"
          ></textarea>
          <div class="editor-statusbar">
            <span>{{ lineCount }}行</span>
            <span>{{ charCount }}字符</span>
          </div>
        </div>
        
        <div class="buttons">
          <button @click="formatCode" class="format-btn">格式化</button>
          <button @click="copyCode" class="copy-btn">复制</button>
          <button @click="clearCode" class="clear-btn">清空</button>
        </div>
        
        <div class="editor">
          <textarea 
            v-model="outputCode" 
            placeholder="格式化后的代码将显示在这里..." 
            readonly
          ></textarea>
        </div>
      </div>
    </div>
    
    <div class="copy-message" v-if="copyMessage" :class="{ show: copyMessage }">
      {{ copyMessage }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'HTMLFormatter',
  data() {
    return {
      inputCode: '',
      outputCode: '',
      copyMessage: '',
      lineCount: 0,
      charCount: 0
    };
  },
  methods: {
    formatCode() {
      if (!this.inputCode.trim()) {
        this.showCopyMessage('请输入代码');
        return;
      }
      
      try {
        // 完全按照预期格式处理HTML
        // 准备工作，清理输入代码
        let html = this.inputCode.trim();
        
        // 定义一些标签分类
        const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
        const inlineTextContainers = ['title', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'button', 'a', 'label', 'span', 'strong', 'em', 'i', 'b', 'small', 'td', 'th', 'li'];
        
        // 第一步：使用正则表达式分解HTML为标签和文本
        // 这个正则会捕获：开始标签、结束标签、自闭合标签和文本内容
        const tokenRegex = /<\/?[^>]+>|[^<]+/g;
        const tokens = html.match(tokenRegex) || [];
        
        // 处理结果和计数器
        let result = '';
        let indentLevel = 0;
        let lastTokenWasText = false;
        let lastTokenWasTag = false;
        let parentTagStack = [];
        
        // 第二步：遍历所有令牌并应用正确的格式
        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i].trim();
          if (!token) continue;
          
          // 跳过注释
          if (token.startsWith('<!--') && token.endsWith('-->')) continue;
          
          // 处理标签
          if (token.startsWith('<')) {
            const isClosingTag = token.startsWith('</');
            const isSelfClosing = token.endsWith('/>') || selfClosingTags.some(tag => 
              new RegExp(`^<${tag}(\\s|>|/>)`, 'i').test(token)
            );
            
            // 提取标签名
            const tagNameMatch = token.match(isClosingTag ? /<\/([^\s>]+)/ : /<([^\s>]+)/);
            const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';
            
            // 特殊处理doctype，不增加缩进
            if (tagName === '!doctype') {
              result += token + '\n';
              continue;
            }
            
            // 处理闭合标签
            if (isClosingTag) {
              // 减少缩进级别
              indentLevel = Math.max(0, indentLevel - 1);
              
              // 从栈中移除最后一个标签
              if (parentTagStack.length > 0) {
                parentTagStack.pop();
              }
              
              // 添加闭合标签（除非前一个是内联元素文本）
              if (!lastTokenWasText || !inlineTextContainers.includes(tagName)) {
                result += ' '.repeat(indentLevel * 2) + token + '\n';
              } else {
                // 如果前一个是内联元素文本，则直接附加
                result += token + '\n';
              }
            }
            // 处理开始或自闭合标签
            else {
              // 添加标签，带缩进
              result += ' '.repeat(indentLevel * 2) + token;
              
              // 如果不是自闭合，增加缩进级别和父标签栈
              if (!isSelfClosing) {
                // 检查此标签是否包含文本内容
                const nextToken = i + 1 < tokens.length ? tokens[i + 1].trim() : '';
                const nextNextToken = i + 2 < tokens.length ? tokens[i + 2].trim() : '';
                
                // 检查是否为内联文本容器且下一个是文本且下下个是闭合标签
                const hasInlineTextContent = inlineTextContainers.includes(tagName) && 
                                            nextToken && !nextToken.startsWith('<') &&
                                            nextNextToken && nextNextToken === `</${tagName}>`;
                
                // 如果有内联文本内容，不换行
                if (hasInlineTextContent) {
                  result += '';
                } else {
                  result += '\n';
                }
                
                indentLevel++;
                parentTagStack.push(tagName);
              } else {
                // 自闭合标签后换行
                result += '\n';
              }
            }
            
            lastTokenWasTag = true;
            lastTokenWasText = false;
          }
          // 处理文本内容
          else {
            const text = token.replace(/\s+/g, ' ').trim();
            if (!text) continue;
            
            // 检查父标签是否是内联文本容器
            const parentTag = parentTagStack.length > 0 ? parentTagStack[parentTagStack.length - 1] : '';
            const isInInlineContainer = inlineTextContainers.includes(parentTag);
            
            // 添加文本内容，如果在内联容器中则不缩进
            if (isInInlineContainer) {
              result += text;
            } else {
              result += ' '.repeat(indentLevel * 2) + text + '\n';
            }
            
            lastTokenWasText = true;
            lastTokenWasTag = false;
          }
        }
        
        // 最后清理多余的换行和空格
        this.outputCode = result.trim();
      } catch(error) {
        console.error('HTML格式化失败:', error);
        this.showCopyMessage('格式化失败：' + error.message);
        this.outputCode = '格式化失败: ' + error.message;
      }
    },
    
    clearCode() {
      this.inputCode = '';
      this.outputCode = '';
      this.updateWordCount();
    },
    
    copyCode() {
      if (!this.outputCode) {
        this.showCopyMessage('没有可复制的内容');
        return;
      }
      
      navigator.clipboard.writeText(this.outputCode)
        .then(() => {
          this.showCopyMessage('复制成功');
        })
        .catch(err => {
          this.showCopyMessage('复制失败：' + err.message);
        });
    },
    
    showCopyMessage(message) {
      this.copyMessage = message;
      setTimeout(() => {
        this.copyMessage = '';
      }, 2000);
    },
    
    updateWordCount() {
      this.lineCount = this.inputCode.split('\n').length;
      this.charCount = this.inputCode.length;
    }
  }
};
</script>

<style scoped>
.code-formatter {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.tool-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 20px;
}

.formatter-container {
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.editor-wrapper {
  display: flex;
  flex-direction: column;
}

.editor {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 15px;
  position: relative;
}

.editor textarea {
  width: 100%;
  height: 300px;
  padding: 10px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  border: none;
  resize: none;
  outline: none;
}

.editor-statusbar {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 2px 10px;
  background-color: #f5f5f5;
  border-top: 1px solid #ddd;
  border-left: 1px solid #ddd;
  border-top-left-radius: 4px;
  font-size: 12px;
  color: #666;
}

.buttons {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.buttons button {
  margin: 0 10px;
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.format-btn {
  background-color: #42b983;
  color: white;
}

.format-btn:hover {
  background-color: #3aa876;
}

.copy-btn {
  background-color: #2c3e50;
  color: white;
}

.copy-btn:hover {
  background-color: #1e2b38;
}

.clear-btn {
  background-color: #e74c3c;
  color: white;
}

.clear-btn:hover {
  background-color: #c0392b;
}

.copy-message {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.copy-message.show {
  opacity: 1;
}
</style> 