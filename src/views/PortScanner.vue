<template>
  <div class="port-scanner">
    <h1>端口扫描器</h1>
    <div class="input-group">
      <label for="host">目标地址:</label>
      <input type="text" id="host" v-model="host" placeholder="输入 IP 或域名">
    </div>
    <div class="input-group">
      <label for="ports">端口范围:</label>
      <input type="text" id="ports" v-model="portString" placeholder="例如: 80, 443, 1-1000">
    </div>
    <button @click="startScan" :disabled="isLoading">
      {{ isLoading ? '扫描中...' : '开始扫描' }}
    </button>
    <div v-if="scanStarted" class="results">
      <h2>扫描结果:</h2>
      <p v-if="isLoading">正在扫描，请稍候... (这可能需要几分钟)</p>
      <pre v-if="scanOutput" class="scan-output">{{ scanOutput }}</pre>
      <pre v-if="scanErrorOutput" class="scan-error-output">{{ scanErrorOutput }}</pre>
      <p v-if="!isLoading && !scanOutput && !errorMessage">扫描完成，无输出。</p>
      <p v-if="errorMessage" class="error">错误: {{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const host = ref('');
const portString = ref('1-1000'); // 修改默认端口范围示例
const isLoading = ref(false);
const scanStarted = ref(false);
const scanOutput = ref(null); // 新增：用于存储原始输出
const scanErrorOutput = ref(null); // 新增：用于存储 stderr 输出
const errorMessage = ref('');

// 解析端口字符串 (例如 "80,443,8000-8010") 为数字数组
function parsePorts(str) {
  const ports = new Set();
  const parts = str.split(',');
  errorMessage.value = ''; // 重置错误信息

  for (const part of parts) {
    const trimmedPart = part.trim();
    if (trimmedPart.includes('-')) {
      const [startStr, endStr] = trimmedPart.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (isNaN(start) || isNaN(end) || start < 1 || end > 65535 || start > end) {
          errorMessage.value = `无效的端口范围: ${trimmedPart}`;
          return null; // 返回 null 表示解析失败
      }
      for (let i = start; i <= end; i++) {
        ports.add(i);
      }
    } else {
      const port = parseInt(trimmedPart, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        errorMessage.value = `无效的端口号: ${trimmedPart}`;
        return null; // 返回 null 表示解析失败
      }
      ports.add(port);
    }
  }
  if (ports.size === 0 && str.trim() !== '') {
      errorMessage.value = '未指定有效端口。';
      return null;
  }
  return Array.from(ports);
}

// 开始扫描
async function startScan() {
  if (!host.value) {
    errorMessage.value = '请输入目标地址。';
    return;
  }

  // 端口字符串解析和验证 (保持原样)
  const portsToScanStr = portString.value.trim();
  if (!portsToScanStr) {
    errorMessage.value = '请输入要扫描的端口。';
    return;
  }
  // 可以在这里添加一个基础的端口格式预检查，虽然后端也有验证
  if (!/^[\d,-]+$/.test(portsToScanStr.replace(/\s/g, ''))) {
    errorMessage.value = '端口格式无效，请使用数字、逗号和短横线。';
    return;
  }

  isLoading.value = true;
  scanStarted.value = true;
  scanOutput.value = null; // 重置输出
  scanErrorOutput.value = null; // 重置 stderr 输出
  errorMessage.value = ''; // 清除旧错误

  try {
    // 构建 API 请求 URL
    const apiUrl = `/api/scan/?host=${encodeURIComponent(host.value)}&ports=${encodeURIComponent(portsToScanStr)}`;
    
    console.log(`Sending request to backend: ${apiUrl}`);

    const response = await fetch(apiUrl);

    console.log(`Received response status: ${response.status}`);

    const data = await response.json(); // 尝试解析 JSON，无论状态码如何
    console.log("Received data from backend:", data);

    if (!response.ok) {
      // 即便响应失败，也可能包含来自 nmap 的 stderr
      if (data && data.errorOutput) {
          scanErrorOutput.value = "Nmap 标准错误输出:\n" + data.errorOutput;
      }
      let errorMsg = data.error || `扫描请求失败: ${response.status} ${response.statusText}`;
      throw new Error(errorMsg);
    }

    // 响应成功
    if (data) {
        scanOutput.value = data.rawOutput || "(Nmap 没有标准输出)";
        if (data.errorOutput) {
           // 即使成功，也可能有关警告信息在 stderr
           scanErrorOutput.value = "Nmap 标准错误/警告输出:\n" + data.errorOutput;
        }
    } else {
        errorMessage.value = "从后端收到无效的响应数据";
    }

  } catch (error) {
    console.error('扫描过程中发生错误:', error);
    errorMessage.value = error.message || '扫描过程中发生未知错误。';
    // 出错时不清空 scanErrorOutput，因为它可能包含有用的调试信息
    scanOutput.value = null; // 清空正常输出
  } finally {
    isLoading.value = false;
  }
}

</script>

<style scoped>
.port-scanner {
  max-width: 800px; /* 可以适当加宽以显示输出 */
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-family: sans-serif;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
}

.input-group input {
  width: calc(100% - 16px);
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

.results {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.results h2 {
  margin-bottom: 10px;
}

.scan-output, .scan-error-output {
  background-color: #f8f9fa; /* 浅灰色背景 */
  border: 1px solid #dee2e6; /* 边框 */
  padding: 15px;
  border-radius: 4px;
  white-space: pre-wrap;    /* 保留空白符序列，允许换行 */
  word-wrap: break-word;    /* 在长单词或 URL 处换行 */
  font-family: monospace;   /* 使用等宽字体 */
  font-size: 0.9em;
  max-height: 500px; /* 限制最大高度，并允许滚动 */
  overflow-y: auto;
  margin-bottom: 10px;
}

.scan-error-output {
    border-color: #f5c6cb; /* 错误输出用淡红色边框 */
    color: #721c24; /* 深红色文字 */
    background-color: #f8d7da; /* 淡粉色背景 */
}

.error {
  color: #dc3545;
  margin-top: 10px;
  font-weight: bold;
}
</style> 