<template>
  <div class="url-encoder">
    <h1 class="page-title">URL 编码/解码工具</h1>
    <div class="tool-description">
      <p>这个工具可以帮助你编码或解码URL参数，在前端开发和API调试中非常有用。</p>
    </div>

    <div class="converter-container">
      <div class="input-area">
        <div class="textarea-group">
          <label>输入内容:</label>
          <textarea 
            v-model="inputText"
            placeholder="输入需要编码或解码的内容..."
            class="content-textarea"
          ></textarea>
        </div>

        <div class="operations">
          <button @click="encodeURL" class="operation-btn">URL 编码</button>
          <button @click="decodeURL" class="operation-btn">URL 解码</button>
          <button @click="encodeURIComponent" class="operation-btn">编码组件</button>
          <button @click="decodeURIComponent" class="operation-btn">解码组件</button>
          <button @click="encodeBase64" class="operation-btn">Base64 编码</button>
          <button @click="decodeBase64" class="operation-btn">Base64 解码</button>
        </div>
      </div>

      <div class="output-area">
        <div class="textarea-group">
          <label>输出结果:</label>
          <textarea 
            v-model="outputText"
            readonly
            class="content-textarea"
          ></textarea>
        </div>

        <div class="output-actions">
          <button @click="copyToClipboard" class="copy-btn">复制到剪贴板</button>
          <button @click="swapContent" class="swap-btn">
            <span class="swap-icon">⇅</span> 交换输入/输出
          </button>
          <button @click="clearContent" class="clear-btn">清空内容</button>
        </div>
      </div>
    </div>
    
    <div class="info-panel">
      <h3>常见 URL 编码问题解释</h3>
      <div class="info-content">
        <div class="info-section">
          <h4>URL编码 vs URI组件编码</h4>
          <p><strong>URL编码 (encodeURI):</strong> 适用于完整的URL，不会编码 URL 中的特殊字符，如 :, /, ?, &, = 等。</p>
          <p><strong>URI组件编码 (encodeURIComponent):</strong> 更全面地编码所有特殊字符，适用于 URL 参数值。当参数值包含 &, =, ? 等字符时应使用此方法。</p>
        </div>
        
        <div class="info-section">
          <h4>常见编码字符对照表</h4>
          <div class="encoding-table">
            <div class="table-row header">
              <div class="table-cell">字符</div>
              <div class="table-cell">URL 编码</div>
            </div>
            <div class="table-row">
              <div class="table-cell">空格</div>
              <div class="table-cell">%20</div>
            </div>
            <div class="table-row">
              <div class="table-cell">/</div>
              <div class="table-cell">%2F</div>
            </div>
            <div class="table-row">
              <div class="table-cell">?</div>
              <div class="table-cell">%3F</div>
            </div>
            <div class="table-row">
              <div class="table-cell">&</div>
              <div class="table-cell">%26</div>
            </div>
            <div class="table-row">
              <div class="table-cell">=</div>
              <div class="table-cell">%3D</div>
            </div>
            <div class="table-row">
              <div class="table-cell">:</div>
              <div class="table-cell">%3A</div>
            </div>
            <div class="table-row">
              <div class="table-cell">@</div>
              <div class="table-cell">%40</div>
            </div>
            <div class="table-row">
              <div class="table-cell">#</div>
              <div class="table-cell">%23</div>
            </div>
            <div class="table-row">
              <div class="table-cell">中文/Unicode</div>
              <div class="table-cell">%E4%B8%AD%E6%96%87</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UrlEncoder',
  data() {
    return {
      inputText: '',
      outputText: '',
      operationHistory: []
    };
  },
  methods: {
    encodeURL() {
      try {
        this.outputText = encodeURI(this.inputText);
        this.addToHistory('URL编码');
      } catch (error) {
        this.handleError(error);
      }
    },
    decodeURL() {
      try {
        this.outputText = decodeURI(this.inputText);
        this.addToHistory('URL解码');
      } catch (error) {
        this.handleError(error);
      }
    },
    encodeURIComponent() {
      try {
        this.outputText = encodeURIComponent(this.inputText);
        this.addToHistory('组件编码');
      } catch (error) {
        this.handleError(error);
      }
    },
    decodeURIComponent() {
      try {
        this.outputText = decodeURIComponent(this.inputText);
        this.addToHistory('组件解码');
      } catch (error) {
        this.handleError(error);
      }
    },
    encodeBase64() {
      try {
        this.outputText = btoa(unescape(encodeURIComponent(this.inputText)));
        this.addToHistory('Base64编码');
      } catch (error) {
        this.handleError(error);
      }
    },
    decodeBase64() {
      try {
        this.outputText = decodeURIComponent(escape(atob(this.inputText)));
        this.addToHistory('Base64解码');
      } catch (error) {
        this.handleError(error);
      }
    },
    copyToClipboard() {
      navigator.clipboard.writeText(this.outputText)
        .then(() => {
          alert('已复制到剪贴板');
        })
        .catch(err => {
          console.error('复制失败:', err);
        });
    },
    swapContent() {
      const temp = this.inputText;
      this.inputText = this.outputText;
      this.outputText = temp;
    },
    clearContent() {
      this.inputText = '';
      this.outputText = '';
    },
    handleError(error) {
      console.error('操作出错:', error);
      alert(`操作出错: ${error.message}`);
    },
    addToHistory(operation) {
      this.operationHistory.unshift({
        operation,
        input: this.inputText,
        output: this.outputText,
        timestamp: new Date()
      });
      
      if (this.operationHistory.length > 10) {
        this.operationHistory.pop();
      }
    }
  }
};
</script>

<style scoped>
.url-encoder {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 16px;
}

.tool-description {
  margin-bottom: 30px;
  color: #666;
}

.converter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
}

.input-area, .output-area {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.textarea-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.textarea-group label {
  font-weight: bold;
  color: #2c3e50;
}

.content-textarea {
  width: 100%;
  height: 200px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
  resize: vertical;
}

.operations, .output-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.operation-btn, .copy-btn, .swap-btn, .clear-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.operation-btn {
  background-color: #42b983;
  color: white;
}

.operation-btn:hover {
  background-color: #3a9d70;
}

.copy-btn {
  background-color: #2c3e50;
  color: white;
}

.copy-btn:hover {
  background-color: #1e2b3c;
}

.swap-btn {
  background-color: #e67e22;
  color: white;
  display: flex;
  align-items: center;
  gap: 5px;
}

.swap-btn:hover {
  background-color: #d35400;
}

.clear-btn {
  background-color: #e74c3c;
  color: white;
}

.clear-btn:hover {
  background-color: #c0392b;
}

.swap-icon {
  font-size: 16px;
  font-weight: bold;
}

.info-panel {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.info-panel h3 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 20px;
}

.info-content {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
}

.info-section {
  flex: 1;
  min-width: 300px;
}

.info-section h4 {
  color: #42b983;
  margin-bottom: 10px;
}

.encoding-table {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #ddd;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row.header {
  background-color: #f5f5f5;
  font-weight: bold;
}

.table-cell {
  flex: 1;
  padding: 8px 12px;
  border-right: 1px solid #ddd;
}

.table-cell:last-child {
  border-right: none;
}

@media (max-width: 768px) {
  .converter-container, .info-content {
    flex-direction: column;
  }
}
</style> 