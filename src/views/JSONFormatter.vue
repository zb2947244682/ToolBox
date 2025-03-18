<template>
  <div class="code-formatter">
    <h1 class="tool-title">JSON代码格式化</h1>
    
    <div class="formatter-container">
      <div class="editor-wrapper">
        <div class="editor">
          <textarea 
            v-model="inputCode" 
            placeholder="请输入需要格式化的JSON代码..."
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
  name: 'JSONFormatter',
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
        // 1. 尝试解析JSON
        const parsedJson = JSON.parse(this.inputCode);
        
        // 2. 使用JSON.stringify美化输出，使用2个空格缩进
        this.outputCode = JSON.stringify(parsedJson, null, 2);
      } catch (error) {
        console.error('JSON格式化失败:', error);
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