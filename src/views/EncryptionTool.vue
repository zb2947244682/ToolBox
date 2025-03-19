<template>
  <div class="encryption-tool">
    <h1 class="page-title">加密/解密工具</h1>
    <div class="tool-description">
      <p>这个工具提供常用的哈希计算和加密/解密功能，可以处理MD5、SHA256、AES等加密算法。</p>
    </div>

    <div class="tool-container">
      <div class="encryption-modes">
        <div class="section-title">选择操作类型</div>
        <div class="mode-buttons">
          <button 
            v-for="mode in modes" 
            :key="mode.type"
            @click="selectMode(mode)"
            :class="['mode-btn', { active: selectedMode === mode.type }]"
          >
            {{ mode.name }}
          </button>
        </div>
      </div>

      <div class="algo-selection" v-if="selectedMode">
        <div class="section-title">选择算法</div>
        <div class="algo-buttons">
          <button 
            v-for="algo in filteredAlgorithms" 
            :key="algo.type"
            @click="selectAlgorithm(algo)"
            :class="['algo-btn', { active: selectedAlgorithm === algo.type }]"
          >
            {{ algo.name }}
          </button>
        </div>
      </div>

      <div class="encryption-input" v-if="selectedAlgorithm">
        <div class="input-area">
          <label>输入文本</label>
          <textarea 
            v-model="inputText"
            placeholder="输入需要处理的文本..."
            class="content-textarea"
          ></textarea>
        </div>

        <div class="input-options" v-if="showOptionsForCurrentAlgo">
          <div v-if="needsKey" class="key-input">
            <label>密钥</label>
            <input 
              type="text" 
              v-model="secretKey" 
              placeholder="输入密钥" 
              class="text-input"
            >
            <div class="checkbox-group">
              <input type="checkbox" id="showKey" v-model="showKey">
              <label for="showKey">显示密钥</label>
            </div>
          </div>

          <div v-if="showEncodingOptions" class="encoding-options">
            <label>输出编码</label>
            <div class="radio-options">
              <div class="radio-group">
                <input type="radio" id="hex" value="hex" v-model="outputEncoding">
                <label for="hex">十六进制 (Hex)</label>
              </div>
              <div class="radio-group">
                <input type="radio" id="base64" value="base64" v-model="outputEncoding">
                <label for="base64">Base64</label>
              </div>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="processData" class="process-btn">处理</button>
          <button @click="clearFields" class="clear-btn">清除</button>
        </div>

        <div class="output-area" v-if="outputText">
          <label>结果</label>
          <div class="output-box">
            <textarea 
              v-model="outputText"
              readonly
              class="content-textarea"
            ></textarea>
            <button @click="copyToClipboard" class="copy-btn">复制</button>
          </div>
        </div>
      </div>
    </div>

    <div class="info-panel">
      <h3>加密算法信息</h3>
      <div class="info-grid">
        <div class="info-card">
          <h4>哈希算法 (单向)</h4>
          <p>哈希算法将任意长度的数据转换为固定长度的字符串。这是一个单向过程，无法逆向解密。</p>
          <ul>
            <li><strong>MD5</strong> - 输出32位十六进制字符串，已不再被认为是安全的</li>
            <li><strong>SHA-1</strong> - 输出40位十六进制字符串，较MD5更安全但也已不推荐用于安全场景</li>
            <li><strong>SHA-256</strong> - 更安全的哈希算法，输出64位十六进制字符串</li>
          </ul>
        </div>

        <div class="info-card">
          <h4>对称加密</h4>
          <p>对称加密使用相同的密钥进行加密和解密。需要安全地共享密钥。</p>
          <ul>
            <li><strong>AES</strong> - 高级加密标准，广泛使用的对称加密算法</li>
            <li><strong>DES</strong> - 数据加密标准，已不再被认为是安全的</li>
          </ul>
        </div>

        <div class="info-card">
          <h4>编码 (非加密)</h4>
          <p>编码只是数据的不同表示形式，不提供安全性，任何人都可以解码。</p>
          <ul>
            <li><strong>Base64</strong> - 将二进制数据转换为ASCII字符串</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 导入CryptoJS库，需要先安装: npm install crypto-js
import CryptoJS from 'crypto-js';

export default {
  name: 'EncryptionTool',
  data() {
    return {
      // 操作模式
      modes: [
        { type: 'hash', name: '哈希计算 (Hash)' },
        { type: 'encrypt', name: '加密 (Encrypt)' },
        { type: 'decrypt', name: '解密 (Decrypt)' },
        { type: 'encode', name: '编码 (Encode)' },
        { type: 'decode', name: '解码 (Decode)' }
      ],
      selectedMode: '',

      // 算法
      algorithms: [
        { type: 'md5', name: 'MD5', modes: ['hash'], needsKey: false },
        { type: 'sha1', name: 'SHA-1', modes: ['hash'], needsKey: false },
        { type: 'sha256', name: 'SHA-256', modes: ['hash'], needsKey: false },
        { type: 'sha512', name: 'SHA-512', modes: ['hash'], needsKey: false },
        { type: 'aes', name: 'AES', modes: ['encrypt', 'decrypt'], needsKey: true },
        { type: 'des', name: 'DES', modes: ['encrypt', 'decrypt'], needsKey: true },
        { type: 'base64', name: 'Base64', modes: ['encode', 'decode'], needsKey: false }
      ],
      selectedAlgorithm: '',

      // 输入和输出
      inputText: '',
      outputText: '',
      secretKey: '',
      showKey: false,
      outputEncoding: 'hex',

      // 处理结果历史
      processHistory: []
    };
  },
  computed: {
    filteredAlgorithms() {
      if (!this.selectedMode) return [];
      return this.algorithms.filter(algo => algo.modes.includes(this.selectedMode));
    },
    needsKey() {
      if (!this.selectedAlgorithm) return false;
      const algo = this.algorithms.find(a => a.type === this.selectedAlgorithm);
      return algo ? algo.needsKey : false;
    },
    showOptionsForCurrentAlgo() {
      return this.selectedAlgorithm && 
             (this.needsKey || this.showEncodingOptions);
    },
    showEncodingOptions() {
      return ['hash', 'encrypt'].includes(this.selectedMode);
    }
  },
  methods: {
    selectMode(mode) {
      this.selectedMode = mode.type;
      this.selectedAlgorithm = '';
      this.outputText = '';
    },
    selectAlgorithm(algo) {
      this.selectedAlgorithm = algo.type;
      this.outputText = '';
    },
    processData() {
      if (!this.inputText) {
        alert('请输入要处理的文本');
        return;
      }

      if (this.needsKey && !this.secretKey) {
        alert('请输入密钥');
        return;
      }

      try {
        switch(this.selectedMode) {
          case 'hash':
            this.performHash();
            break;
          case 'encrypt':
            this.performEncryption();
            break;
          case 'decrypt':
            this.performDecryption();
            break;
          case 'encode':
            this.performEncode();
            break;
          case 'decode':
            this.performDecode();
            break;
        }

        // 添加到历史记录
        this.addToHistory();
      } catch (error) {
        console.error('处理出错:', error);
        alert(`处理失败: ${error.message}`);
      }
    },
    performHash() {
      let result;
      switch(this.selectedAlgorithm) {
        case 'md5':
          result = CryptoJS.MD5(this.inputText);
          break;
        case 'sha1':
          result = CryptoJS.SHA1(this.inputText);
          break;
        case 'sha256':
          result = CryptoJS.SHA256(this.inputText);
          break;
        case 'sha512':
          result = CryptoJS.SHA512(this.inputText);
          break;
      }
      
      if (this.outputEncoding === 'hex') {
        this.outputText = result.toString(CryptoJS.enc.Hex);
      } else {
        this.outputText = result.toString(CryptoJS.enc.Base64);
      }
    },
    performEncryption() {
      let result;
      switch(this.selectedAlgorithm) {
        case 'aes':
          result = CryptoJS.AES.encrypt(this.inputText, this.secretKey);
          break;
        case 'des':
          result = CryptoJS.DES.encrypt(this.inputText, this.secretKey);
          break;
      }
      
      this.outputText = result.toString();
    },
    performDecryption() {
      let result;
      try {
        switch(this.selectedAlgorithm) {
          case 'aes':
            result = CryptoJS.AES.decrypt(this.inputText, this.secretKey);
            break;
          case 'des':
            result = CryptoJS.DES.decrypt(this.inputText, this.secretKey);
            break;
        }
        
        this.outputText = result.toString(CryptoJS.enc.Utf8);
        if (!this.outputText) {
          throw new Error('解密失败，可能是密钥错误或输入不是有效的加密文本');
        }
      } catch (error) {
        throw new Error('解密失败，请检查输入和密钥是否正确');
      }
    },
    performEncode() {
      if (this.selectedAlgorithm === 'base64') {
        // 使用原生的btoa函数，但处理Unicode字符
        this.outputText = btoa(unescape(encodeURIComponent(this.inputText)));
      }
    },
    performDecode() {
      if (this.selectedAlgorithm === 'base64') {
        try {
          // 使用原生的atob函数，但处理Unicode字符
          this.outputText = decodeURIComponent(escape(atob(this.inputText)));
        } catch (error) {
          throw new Error('解码失败，输入不是有效的Base64编码');
        }
      }
    },
    clearFields() {
      this.inputText = '';
      this.outputText = '';
      this.secretKey = '';
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
    addToHistory() {
      this.processHistory.unshift({
        mode: this.selectedMode,
        algorithm: this.selectedAlgorithm,
        input: this.inputText.substring(0, 50) + (this.inputText.length > 50 ? '...' : ''),
        output: this.outputText.substring(0, 50) + (this.outputText.length > 50 ? '...' : ''),
        timestamp: new Date()
      });
      
      if (this.processHistory.length > 10) {
        this.processHistory.pop();
      }
    }
  }
};
</script>

<style scoped>
.encryption-tool {
  max-width: 900px;
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

.tool-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.section-title {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 10px;
}

.mode-buttons, .algo-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.mode-btn, .algo-btn {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s;
}

.mode-btn:hover, .algo-btn:hover {
  background-color: #e0e0e0;
}

.mode-btn.active, .algo-btn.active {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
}

.encryption-input {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-area, .output-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: bold;
  color: #2c3e50;
}

.content-textarea {
  width: 100%;
  height: 120px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
  resize: vertical;
}

.input-options {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.key-input {
  flex: 1;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.text-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
}

.text-input[type="password"] {
  font-family: sans-serif;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 5px;
}

.encoding-options {
  flex: 1;
  min-width: 250px;
}

.radio-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.radio-group {
  display: flex;
  align-items: center;
  gap: 5px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 5px;
}

.process-btn, .clear-btn, .copy-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.process-btn {
  background-color: #42b983;
  color: white;
}

.process-btn:hover {
  background-color: #3a9d70;
}

.clear-btn {
  background-color: #e74c3c;
  color: white;
}

.clear-btn:hover {
  background-color: #c0392b;
}

.output-box {
  position: relative;
}

.copy-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #2c3e50;
  color: white;
  padding: 5px 10px;
  font-size: 0.9rem;
}

.copy-btn:hover {
  background-color: #1e2b3c;
}

.info-panel {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.info-panel h3 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.info-card {
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 15px;
}

.info-card h4 {
  color: #42b983;
  margin-top: 0;
  margin-bottom: 10px;
}

.info-card p {
  margin-bottom: 10px;
  line-height: 1.4;
}

.info-card ul {
  padding-left: 20px;
  margin-top: 10px;
}

.info-card li {
  margin-bottom: 5px;
}

@media (max-width: 768px) {
  .input-options {
    flex-direction: column;
  }
  
  .mode-buttons, .algo-buttons {
    flex-direction: column;
  }
  
  .mode-btn, .algo-btn {
    width: 100%;
  }
}
</style> 