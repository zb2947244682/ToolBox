<template>
  <div class="image-processor-container">
    <h1 class="page-title">图片处理工具</h1>
    
    <div class="upload-area" @drop.prevent="handleDrop" @dragover.prevent>
      <div class="drop-zone" @click="triggerFileInput">
        <p>拖拽图片到此处或点击上传</p>
        <input
          type="file"
          ref="fileInput"
          accept="image/*"
          @change="handleFileSelect"
          style="display: none"
        >
      </div>
    </div>

    <div v-if="selectedFile" class="preview-section">
      <h3>预览</h3>
      <div class="image-preview-container">
        <div class="original-image">
          <h4>原始图片</h4>
          <img :src="originalImageUrl" alt="原始图片" class="preview-image">
          <p>{{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})</p>
        </div>
        <div v-if="processedImageUrl" class="processed-image">
          <h4>处理后图片</h4>
          <img :src="processedImageUrl" alt="处理后图片" class="preview-image">
          <p v-if="processedImageSize">处理后大小: {{ formatFileSize(processedImageSize) }}</p>
        </div>
      </div>
      
      <div class="settings-panel">
        <div class="settings-group">
          <h4>导出格式</h4>
          <div class="format-buttons">
            <button 
              v-for="format in exportFormats" 
              :key="format.value"
              @click="selectedFormat = format.value" 
              :class="['format-btn', selectedFormat === format.value ? 'format-btn-active' : '']"
            >
              {{ format.label }}
            </button>
          </div>
        </div>
        
        <div class="settings-group">
          <h4>图片质量</h4>
          <div class="quality-slider">
            <input 
              type="range" 
              min="10" 
              max="100" 
              step="5"
              v-model.number="imageQuality" 
              @input="processImage"
            >
            <span>{{ imageQuality }}%</span>
          </div>
        </div>
        
        <div class="settings-group" v-if="selectedFormat === 'ico'">
          <h4>ICO尺寸固定为64x64像素</h4>
        </div>
      </div>
      
      <div class="action-buttons">
        <button @click="clearFile" class="clear-btn">
          清空
        </button>
        <button @click="copyBase64Original" class="action-btn">
          复制原图Base64
        </button>
        <button @click="copyBase64Processed" class="action-btn" :disabled="!processedImageUrl">
          复制处理后Base64
        </button>
        <button @click="exportFromBase64" class="action-btn" :disabled="!processedImageUrl">
          从Base64导出
        </button>
        <button @click="convertAndDownload" class="convert-btn">
          {{ converting ? '导出中...' : '导出图片' }}
        </button>
      </div>
      
      <div class="base64-input-section" v-if="showBase64Input">
        <textarea 
          v-model="base64Input" 
          placeholder="输入Base64编码内容" 
          class="base64-textarea"
        ></textarea>
        <div class="base64-buttons">
          <button @click="processBase64Input" class="action-btn">处理Base64图片</button>
          <button @click="closeBase64Input" class="clear-btn">取消</button>
        </div>
      </div>
    </div>

    <!-- 消息提示组件 -->
    <div v-if="message.show" :class="['message-popup', `message-${message.type}`]">
      <span>{{ message.text }}</span>
    </div>
    
    <!-- 隐藏的下载链接 -->
    <a 
      ref="downloadLink" 
      style="display: none;"
    ></a>
  </div>
</template>

<script>
import { convertToFormat, getBase64FromBlob, createBlobFromBase64 } from '../utils/imageUtils';

export default {
  name: 'ImageProcessor',
  data() {
    return {
      selectedFile: null,
      originalImageUrl: null,
      processedImageUrl: null,
      processedImageSize: 0,
      converting: false,
      imageQuality: 80,
      selectedFormat: 'jpg',
      base64Input: '',
      showBase64Input: false,
      message: {
        show: false,
        text: '',
        type: 'info'
      },
      exportFormats: [
        { label: 'JPG', value: 'jpg' },
        { label: 'PNG', value: 'png' },
        { label: 'WebP', value: 'webp' },
        { label: 'ICO', value: 'ico' }
      ]
    };
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleDrop(e) {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.processFile(files[0]);
      }
    },
    handleFileSelect(e) {
      const files = e.target.files;
      if (files.length > 0) {
        this.processFile(files[0]);
      }
    },
    processFile(file) {
      // 检查文件是否为图片
      if (!file.type.includes('image/')) {
        this.showMessage('只支持图片格式的文件', 'error');
        return;
      }
      
      this.selectedFile = file;
      this.originalImageUrl = URL.createObjectURL(file);
      
      // 处理图片生成预览
      this.processImage();
    },
    async processImage() {
      if (!this.selectedFile) return;
      
      try {
        // 转换图片
        const result = await convertToFormat({
          file: this.selectedFile,
          format: this.selectedFormat,
          quality: this.imageQuality
        });
        
        // 更新处理后的图片URL和大小
        this.processedImageUrl = URL.createObjectURL(result.blob);
        this.processedImageSize = result.blob.size;
      } catch (error) {
        console.error('图片处理失败:', error);
        this.showMessage('图片处理失败，请重试', 'error');
      }
    },
    clearFile() {
      this.selectedFile = null;
      this.originalImageUrl = null;
      this.processedImageUrl = null;
      this.processedImageSize = 0;
      this.$refs.fileInput.value = '';
    },
    async convertAndDownload() {
      if (!this.selectedFile) return;
      
      this.converting = true;
      
      try {
        // 转换图片
        const result = await convertToFormat({
          file: this.selectedFile,
          format: this.selectedFormat,
          quality: this.imageQuality
        });
        
        // 创建下载链接
        const url = URL.createObjectURL(result.blob);
        const downloadLink = this.$refs.downloadLink;
        downloadLink.href = url;
        downloadLink.download = this.getDownloadFileName();
        downloadLink.click();
        
        // 释放URL对象
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
        
        this.converting = false;
        this.showMessage('导出成功！', 'success');
      } catch (error) {
        console.error('导出失败:', error);
        this.showMessage('导出失败，请重试', 'error');
        this.converting = false;
      }
    },
    getDownloadFileName() {
      // 获取原始文件名不带扩展名
      const originalName = this.selectedFile.name.replace(/\.[^/.]+$/, "");
      
      // 根据选择的格式添加相应的扩展名
      return `${originalName}.${this.selectedFormat}`;
    },
    formatFileSize(size) {
      if (size < 1024) {
        return size + ' B';
      } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(2) + ' KB';
      } else {
        return (size / (1024 * 1024)).toFixed(2) + ' MB';
      }
    },
    showMessage(text, type = 'info') {
      this.message = {
        show: true,
        text,
        type
      };
      
      // 3秒后自动隐藏消息
      setTimeout(() => {
        this.message.show = false;
      }, 3000);
    },
    async copyBase64Original() {
      if (!this.selectedFile) return;
      
      try {
        // 获取原始图片的base64编码
        const base64 = await getBase64FromBlob(this.selectedFile);
        
        // 复制到剪贴板
        await navigator.clipboard.writeText(base64);
        this.showMessage('原图Base64已复制到剪贴板', 'success');
      } catch (error) {
        console.error('复制失败:', error);
        this.showMessage('复制失败，请重试', 'error');
      }
    },
    async copyBase64Processed() {
      if (!this.processedImageUrl) return;
      
      try {
        // 从处理后的图片URL获取Blob
        const response = await fetch(this.processedImageUrl);
        const blob = await response.blob();
        
        // 获取base64编码
        const base64 = await getBase64FromBlob(blob);
        
        // 复制到剪贴板
        await navigator.clipboard.writeText(base64);
        this.showMessage('处理后图片Base64已复制到剪贴板', 'success');
      } catch (error) {
        console.error('复制失败:', error);
        this.showMessage('复制失败，请重试', 'error');
      }
    },
    exportFromBase64() {
      this.showBase64Input = true;
    },
    closeBase64Input() {
      this.showBase64Input = false;
      this.base64Input = '';
    },
    async processBase64Input() {
      if (!this.base64Input.trim()) {
        this.showMessage('请输入有效的Base64编码', 'error');
        return;
      }
      
      try {
        // 将Base64转换为Blob
        const blob = await createBlobFromBase64(this.base64Input);
        
        // 创建临时文件对象
        const file = new File([blob], "base64-image.png", { type: blob.type });
        
        // 处理文件
        this.processFile(file);
        this.showBase64Input = false;
        this.base64Input = '';
        this.showMessage('Base64图片处理成功', 'success');
      } catch (error) {
        console.error('Base64处理失败:', error);
        this.showMessage('Base64格式无效或处理失败，请检查输入', 'error');
      }
    }
  },
  watch: {
    selectedFormat() {
      this.processImage();
    }
  }
};
</script>

<style scoped>
.image-processor-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.upload-area {
  margin: 20px 0;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.drop-zone:hover {
  border-color: #409EFF;
  background-color: #f5f7fa;
}

.preview-section {
  margin-top: 30px;
}

.image-preview-container {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: 20px 0;
}

.original-image, .processed-image {
  text-align: center;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px;
}

.settings-panel {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
}

.settings-group {
  margin-bottom: 15px;
}

.settings-group h4 {
  margin-bottom: 10px;
}

.format-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.format-btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.format-btn-active {
  background-color: #409EFF;
  color: white;
  border-color: #409EFF;
}

.quality-slider {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quality-slider input {
  flex: 1;
  height: 8px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.convert-btn,
.clear-btn,
.action-btn {
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.convert-btn {
  background-color: #409EFF;
  color: white;
}

.convert-btn:hover {
  background-color: #66b1ff;
}

.convert-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.clear-btn {
  background-color: #909399;
  color: white;
}

.clear-btn:hover {
  background-color: #a6a9ad;
}

.action-btn {
  background-color: #67C23A;
  color: white;
}

.action-btn:hover {
  background-color: #85ce61;
}

.action-btn:disabled {
  background-color: #b3e19d;
  cursor: not-allowed;
}

.message-popup {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  border-radius: 4px;
  color: white;
  z-index: 1000;
}

.message-success {
  background-color: #67C23A;
}

.message-error {
  background-color: #F56C6C;
}

.message-info {
  background-color: #909399;
}

.base64-input-section {
  margin-top: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: #f9f9f9;
}

.base64-textarea {
  width: 100%;
  min-height: 100px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
  font-family: monospace;
}

.base64-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>