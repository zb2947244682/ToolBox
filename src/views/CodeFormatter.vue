<template>
  <div class="code-formatter">
    <h1 class="tool-title">代码格式化工具</h1>
    
    <div class="formatter-container">
      <div class="options">
        <div class="option-group">
          <label>选择语言：</label>
          <select v-model="language">
            <option value="javascript">JavaScript</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
          </select>
        </div>
        
        <div class="option-group">
          <label>缩进方式：</label>
          <select v-model="tabWidth">
            <option :value="2">2空格</option>
            <option :value="4">4空格</option>
            <option :value="8">8空格</option>
          </select>
        </div>
        
        <div class="option-group">
          <label>行宽：</label>
          <input type="number" v-model.number="printWidth" min="40" max="200">
        </div>
        
        <div class="option-group">
          <label><input type="checkbox" v-model="useSemicolons"> 使用分号</label>
        </div>
        
        <div class="option-group">
          <label><input type="checkbox" v-model="useSingleQuote"> 使用单引号</label>
        </div>
      </div>
      
      <div class="editor-wrapper">
        <div class="editor">
          <textarea 
            v-model="inputCode" 
            placeholder="请输入需要格式化的代码..."
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
import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';
import parserHtml from 'prettier/parser-html';
import parserCss from 'prettier/parser-postcss';
import parserMarkdown from 'prettier/parser-markdown';

export default {
  name: 'CodeFormatter',
  data() {
    return {
      inputCode: '',
      outputCode: '',
      language: 'javascript',
      tabWidth: 2,
      printWidth: 80,
      useSemicolons: true,
      useSingleQuote: false,
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
        // 根据语言选择解析器
        const parser = this.getParser();
        const plugins = this.getPlugins();
        
        this.outputCode = prettier.format(this.inputCode, {
          parser,
          plugins,
          tabWidth: this.tabWidth,
          printWidth: this.printWidth,
          semi: this.useSemicolons,
          singleQuote: this.useSingleQuote
        });
      } catch (error) {
        this.showCopyMessage('格式化失败：' + error.message);
        this.outputCode = '';
      }
    },
    getParser() {
      switch (this.language) {
        case 'javascript': return 'babel';
        case 'html': return 'html';
        case 'css': return 'css';
        case 'json': return 'json';
        case 'markdown': return 'markdown';
        default: return 'babel';
      }
    },
    getPlugins() {
      switch (this.language) {
        case 'javascript': return [parserBabel];
        case 'html': return [parserHtml];
        case 'css': return [parserCss];
        case 'json': return [parserBabel];
        case 'markdown': return [parserMarkdown];
        default: return [parserBabel];
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

.options {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.option-group {
  margin-right: 20px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.option-group label {
  margin-right: 10px;
  display: flex;
  align-items: center;
}

.option-group select,
.option-group input[type="number"] {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
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