<template>
  <div class="image-to-ico-container">
    <h1 class="page-title">PNG转ICO</h1>
    
    <div class="upload-area" @drop.prevent="handleDrop" @dragover.prevent>
      <div class="drop-zone" @click="triggerFileInput">
        <p>拖拽PNG图片到此处或点击上传</p>
        <input
          type="file"
          ref="fileInput"
          accept="image/png"
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
      </div>
      
      <div class="action-buttons">
        <button @click="clearFile" class="clear-btn">
          清空
        </button>
        <button @click="convertAndDownload" class="convert-btn" :disabled="converting || !selectedFile">
          {{ converting ? '转换中...' : '转换并下载' }}
        </button>
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
export default {
  name: 'ImageToIco',
  data() {
    return {
      selectedFile: null,
      originalImageUrl: null,
      converting: false,
      message: {
        show: false,
        text: '',
        type: 'info'
      }
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
      // 检查文件是否为PNG
      if (!file.type.includes('image/png')) {
        this.showMessage('只支持PNG格式的图片', 'error');
        return;
      }
      
      this.selectedFile = file;
      this.originalImageUrl = URL.createObjectURL(file);
    },
    clearFile() {
      this.selectedFile = null;
      this.originalImageUrl = null;
      this.$refs.fileInput.value = '';
    },
    convertAndDownload() {
      if (!this.selectedFile) return;
      
      this.converting = true;
      
      // 创建一个Canvas元素来处理图像
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 设置画布大小为64x64像素
      canvas.width = 64;
      canvas.height = 64;
      
      // 创建Image对象来加载图片
      const img = new Image();
      img.onload = () => {
        // 在画布上绘制调整大小的图像
        ctx.drawImage(img, 0, 0, 64, 64);
        
        // 将PNG转换为标准ICO格式
        this.createIcoFile(canvas)
          .then(icoData => {
            // 创建ICO文件的数据URL
            const blob = new Blob([icoData], { type: 'image/x-icon' });
            const url = URL.createObjectURL(blob);
            
            // 设置下载链接并触发下载
            const downloadLink = this.$refs.downloadLink;
            downloadLink.href = url;
            downloadLink.download = this.getDownloadFileName();
            downloadLink.click();
            
            // 释放URL对象
            setTimeout(() => {
              URL.revokeObjectURL(url);
            }, 100);
            
            this.converting = false;
            this.showMessage('转换成功！', 'success');
          })
          .catch(err => {
            console.error('转换失败:', err);
            this.showMessage('转换失败，请重试', 'error');
            this.converting = false;
          });
      };
      
      img.onerror = () => {
        this.showMessage('图片加载失败，请重试', 'error');
        this.converting = false;
      };
      
      // 从文件创建URL并加载图片
      img.src = this.originalImageUrl;
    },
    getDownloadFileName() {
      // 从原始文件名获取基本名称并添加.ico扩展名
      return 'icon.ico';
    },
    createIcoFile(canvas) {
      return new Promise((resolve) => {
        // 获取图像数据
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, 64, 64);
        const pixelArray = imageData.data;
        
        // ICO文件头 (6 bytes)
        const header = new Uint8Array([
          0, 0,             // 保留，必须为0
          1, 0,             // 图像类型: 1 表示ICO
          1, 0              // 图像数量: 1
        ]);
        
        // 获取BMP数据的大小（包括BMP头）
        const bmpInfoHeaderSize = 40; // BITMAPINFOHEADER 大小
        const pixelDataSize = 64 * 64 * 4; // 64x64像素，每像素4字节(BGRA)
        const bmpSize = bmpInfoHeaderSize + pixelDataSize;
        
        // 计算BMP数据的偏移量：ICO头(6) + ICO目录条目(16)
        const bmpOffset = 6 + 16;
        
        // 将偏移量转换为4字节小端格式
        const offsetBytes = new Uint8Array(4);
        offsetBytes[0] = bmpOffset & 0xFF;
        offsetBytes[1] = (bmpOffset >> 8) & 0xFF;
        offsetBytes[2] = (bmpOffset >> 16) & 0xFF;
        offsetBytes[3] = (bmpOffset >> 24) & 0xFF;
        
        // 将BMP大小转换为4字节小端格式
        const sizeBytes = new Uint8Array(4);
        sizeBytes[0] = bmpSize & 0xFF;
        sizeBytes[1] = (bmpSize >> 8) & 0xFF;
        sizeBytes[2] = (bmpSize >> 16) & 0xFF;
        sizeBytes[3] = (bmpSize >> 24) & 0xFF;
        
        // ICO目录条目 (16 bytes)
        const directory = new Uint8Array([
          64,                 // 宽度: 64像素 (0表示256像素，但我们使用64)
          64,                 // 高度: 64像素
          0,                  // 调色板颜色数: 0表示无调色板
          0,                  // 保留: 0
          1, 0,               // 颜色平面数: 1
          32, 0,              // 每像素位数: 32
          sizeBytes[0], sizeBytes[1], sizeBytes[2], sizeBytes[3], // BMP大小
          offsetBytes[0], offsetBytes[1], offsetBytes[2], offsetBytes[3]  // 从文件开头到BMP数据的偏移量
        ]);
        
        // BMP信息头 (40 bytes) - BITMAPINFOHEADER
        const bmpInfoHeader = new Uint8Array([
          40, 0, 0, 0,     // 信息头大小: 40字节
          64, 0, 0, 0,     // 宽度: 64像素
          128, 0, 0, 0,    // 高度: 128像素 (64x2, ICO格式的BMP部分高度是实际高度的2倍)
          1, 0,            // 平面数: 1
          32, 0,           // 每像素位数: 32
          0, 0, 0, 0,      // 压缩方法: 0 (无压缩)
          0, 0, 0, 0,      // 图像数据大小 (对于BI_RGB可以为0)
          0, 0, 0, 0,      // 水平分辨率
          0, 0, 0, 0,      // 垂直分辨率
          0, 0, 0, 0,      // 使用的颜色数
          0, 0, 0, 0       // 重要颜色数
        ]);
        
        // 创建像素数据数组
        const bmpPixelData = new Uint8Array(pixelDataSize);
        
        // BMP中像素数据是从下到上存储的，ICO格式中BMP部分也需要这样
        for (let y = 0; y < 64; y++) {
          for (let x = 0; x < 64; x++) {
            // 原始像素索引
            const srcIndex = (y * 64 + x) * 4;
            // 目标像素索引（翻转Y坐标）
            const dstIndex = ((63 - y) * 64 + x) * 4;
            
            // RGBA 转换为 BGRA (BMP使用BGRA格式)
            bmpPixelData[dstIndex] = pixelArray[srcIndex + 2];     // B
            bmpPixelData[dstIndex + 1] = pixelArray[srcIndex + 1]; // G
            bmpPixelData[dstIndex + 2] = pixelArray[srcIndex];     // R
            bmpPixelData[dstIndex + 3] = pixelArray[srcIndex + 3]; // A
          }
        }
        
        // 合并所有数据到一个最终的ICO文件
        const icoFile = new Uint8Array(
          header.length + 
          directory.length + 
          bmpInfoHeader.length + 
          bmpPixelData.length
        );
        
        // 填充数据
        let offset = 0;
        icoFile.set(header, offset);
        offset += header.length;
        
        icoFile.set(directory, offset);
        offset += directory.length;
        
        icoFile.set(bmpInfoHeader, offset);
        offset += bmpInfoHeader.length;
        
        icoFile.set(bmpPixelData, offset);
        
        resolve(icoFile);
      });
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
    }
  }
};
</script>

<style scoped>
.image-to-ico-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.upload-area {
  margin-bottom: 30px;
}

.drop-zone {
  border: 2px dashed #ccc;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: all 0.3s;
}

.drop-zone:hover {
  border-color: #42b983;
  background-color: #f0f9f5;
}

.preview-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
}

.image-preview-container {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
  flex-wrap: wrap;
}

.original-image {
  text-align: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #fafafa;
  min-width: 200px;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
  margin-bottom: 10px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.action-buttons button, .action-buttons a {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  border: none;
  outline: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.clear-btn {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.clear-btn:hover {
  background-color: #e0e0e0;
}

.convert-btn {
  background-color: #42b983;
  color: white;
}

.convert-btn:hover {
  background-color: #3aa876;
}

.convert-btn:disabled {
  background-color: #a8d5c2;
  cursor: not-allowed;
}

.message-popup {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px 15px;
  border-radius: 4px;
  color: white;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: fadeIn 0.3s;
}

.message-success {
  background-color: #42b983;
}

.message-error {
  background-color: #e74c3c;
}

.message-info {
  background-color: #3498db;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .image-preview-container {
    flex-direction: column;
    align-items: center;
  }
  
  .original-image {
    margin-bottom: 20px;
    width: 100%;
  }
}
</style> 