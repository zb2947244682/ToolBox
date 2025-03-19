<template>
  <div class="image-to-ico-container">
    <h1 class="page-title">PNG转ICO</h1>
    
    <div class="action-buttons" style="margin-bottom: 20px;">
      <button @click="generateRandomIcon" class="random-btn" :disabled="generating">
        {{ generating ? '生成中...' : '生成随机图标' }}
      </button>
    </div>

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
      generating: false,
      message: {
        show: false,
        text: '',
        type: 'info'
      },
      // 预定义的动物轮廓路径数据
      animalPaths: {
        cat: [
          'M32,16 C36,16 40,20 40,24 C44,24 48,28 48,32 C48,40 40,48 32,48 C24,48 16,40 16,32 C16,28 20,24 24,24 C24,20 28,16 32,16 Z',  // 脸
          'M28,32 C26,32 24,30 24,28 C24,26 26,24 28,24 C30,24 32,26 32,28 C32,30 30,32 28,32 Z',  // 左眼
          'M36,32 C34,32 32,30 32,28 C32,26 34,24 36,24 C38,24 40,26 40,28 C40,30 38,32 36,32 Z',  // 右眼
          'M32,36 L32,40 M28,40 C28,42 30,44 32,44 C34,44 36,42 36,40'  // 鼻子和嘴
        ],
        dog: [
          'M16,32 C16,20 24,12 32,12 C40,12 48,20 48,32 C48,44 40,52 32,52 C24,52 16,44 16,32 Z',  // 脸
          'M24,28 L20,24 M40,28 L44,24',  // 耳朵
          'M28,32 A2,2 0 1,1 28,32.1 M36,32 A2,2 0 1,1 36,32.1',  // 眼睛
          'M32,36 C32,36 28,40 32,44 C36,40 32,36 32,36 Z'  // 鼻子
        ],
        rabbit: [
          'M24,8 L32,24 L40,8 L36,32 L28,32 L24,8 Z',  // 耳朵
          'M20,32 C20,24 26,20 32,20 C38,20 44,24 44,32 C44,40 38,48 32,48 C26,48 20,40 20,32 Z',  // 脸
          'M28,36 A2,2 0 1,1 28,36.1 M36,36 A2,2 0 1,1 36,36.1',  // 眼睛
          'M32,40 L32,42 M30,44 C30,46 34,46 34,44'  // 鼻子和嘴
        ],
        bear: [
          'M16,28 C16,16 24,8 32,8 C40,8 48,16 48,28 C48,40 40,48 32,48 C24,48 16,40 16,28 Z',  // 脸
          'M22,20 C22,16 26,16 26,20 M38,20 C38,16 42,16 42,20',  // 耳朵
          'M28,32 A2,2 0 1,1 28,32.1 M36,32 A2,2 0 1,1 36,32.1',  // 眼睛
          'M32,36 C32,36 28,40 32,44 C36,40 32,36 32,36 Z'  // 鼻子
        ],
        fox: [
          'M20,16 L32,40 L44,16 L38,36 L26,36 L20,16 Z',  // 脸
          'M28,28 L24,24 M36,28 L40,24',  // 耳朵
          'M30,32 A1.5,1.5 0 1,1 30,32.1 M34,32 A1.5,1.5 0 1,1 34,32.1',  // 眼睛
          'M32,34 L32,36 M30,38 L34,38'  // 鼻子和嘴
        ],
        panda: [
          'M16,32 C16,20 24,12 32,12 C40,12 48,20 48,32 C48,44 40,52 32,52 C24,52 16,44 16,32 Z',  // 脸
          'M24,24 C20,24 20,32 24,32 C28,32 28,24 24,24 Z M40,24 C36,24 36,32 40,32 C44,32 44,24 40,24 Z',  // 眼圈
          'M26,28 A2,2 0 1,1 26,28.1 M38,28 A2,2 0 1,1 38,28.1',  // 眼睛
          'M32,36 C32,36 28,40 32,44 C36,40 32,36 32,36 Z'  // 鼻子
        ],
        penguin: [
          'M24,12 C24,12 32,16 40,12 C40,24 32,44 32,44 C32,44 24,24 24,12 Z',  // 身体
          'M28,20 A2,2 0 1,1 28,20.1 M36,20 A2,2 0 1,1 36,20.1',  // 眼睛
          'M32,24 L32,28 M30,30 C30,32 34,32 34,30',  // 喙
          'M26,36 L38,36'  // 脚
        ],
        owl: [
          'M20,20 C20,12 26,8 32,8 C38,8 44,12 44,20 C44,28 38,36 32,36 C26,36 20,28 20,20 Z',  // 脸
          'M24,16 C20,16 20,24 24,24 C28,24 28,16 24,16 Z M40,16 C36,16 36,24 40,24 C44,24 44,16 40,16 Z',  // 眼圈
          'M26,20 A2,2 0 1,1 26,20.1 M38,20 A2,2 0 1,1 38,20.1',  // 眼睛
          'M32,24 L32,28 L28,26 L32,28 L36,26'  // 喙
        ],
        elephant: [
          'M16,32 C16,20 24,12 32,12 C40,12 48,20 48,32 C48,44 40,52 32,52 C24,52 16,44 16,32 Z',  // 脸
          'M24,20 C20,24 20,28 24,32 M40,20 C44,24 44,28 40,32',  // 耳朵
          'M28,36 A2,2 0 1,1 28,36.1 M36,36 A2,2 0 1,1 36,36.1',  // 眼睛
          'M32,38 C32,38 32,46 28,50'  // 鼻子
        ],
        lion: [
          'M16,32 C16,20 24,12 32,12 C40,12 48,20 48,32 C48,44 40,52 32,52 C24,52 16,44 16,32 Z',  // 脸
          'M12,24 C12,24 20,28 20,32 M52,24 C52,24 44,28 44,32',  // 鬃毛
          'M28,36 A2,2 0 1,1 28,36.1 M36,36 A2,2 0 1,1 36,36.1',  // 眼睛
          'M32,40 C32,40 28,44 32,48 C36,44 32,40 32,40 Z'  // 鼻子
        ]
      },
      // 预定义的颜色组合
      colorSchemes: [
        // 自然色系
        { main: '#8B4513', accent: '#DEB887' },  // 棕色
        { main: '#2E8B57', accent: '#98FB98' },  // 森林绿
        { main: '#4682B4', accent: '#87CEEB' },  // 钢青色
        { main: '#800000', accent: '#CD5C5C' },  // 栗色
        { main: '#556B2F', accent: '#9ACD32' },  // 橄榄绿
        // 柔和色系
        { main: '#FFB6C1', accent: '#FFC0CB' },  // 粉色
        { main: '#E6E6FA', accent: '#D8BFD8' },  // 淡紫色
        { main: '#F0E68C', accent: '#EEE8AA' },  // 卡其色
        { main: '#98FB98', accent: '#90EE90' },  // 淡绿色
        { main: '#87CEEB', accent: '#ADD8E6' },  // 天蓝色
        // 明亮色系
        { main: '#FF4500', accent: '#FFA07A' },  // 橙红色
        { main: '#FF1493', accent: '#FF69B4' },  // 深粉色
        { main: '#00FF7F', accent: '#7FFF00' },  // 春绿色
        { main: '#FF00FF', accent: '#FF69B4' },  // 洋红色
        { main: '#1E90FF', accent: '#00BFFF' },  // 道奇蓝
        // 暗色系
        { main: '#2F4F4F', accent: '#696969' },  // 深灰色
        { main: '#8B0000', accent: '#A52A2A' },  // 深红色
        { main: '#006400', accent: '#228B22' },  // 深绿色
        { main: '#000080', accent: '#0000CD' },  // 海军蓝
        { main: '#4B0082', accent: '#483D8B' }   // 靛青色
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
    },
    // 生成随机颜色
    getRandomColor(baseHue = null) {
      const hue = baseHue ?? Math.random() * 360;
      const saturation = 50 + Math.random() * 30; // 50-80%
      const lightness = 45 + Math.random() * 25;  // 45-70%
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    },

    // 生成互补色
    getComplementaryColor(baseHue) {
      const hue = (baseHue + 180) % 360;
      const saturation = 50 + Math.random() * 30;
      const lightness = 45 + Math.random() * 25;
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    },

    // 绘制圆形
    drawCircle(ctx, x, y, radius, color) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    },

    // 绘制曲线
    drawCurve(ctx, startX, startY, endX, endY, color, thickness = 2) {
      const controlX = startX + (Math.random() - 0.5) * 40;
      const controlY = startY + (Math.random() - 0.5) * 40;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(controlX, controlY, endX, endY);
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      ctx.stroke();
    },

    // 绘制多边形
    drawPolygon(ctx, centerX, centerY, radius, sides, color) {
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    },
    
    // 绘制SVG路径
    drawPath(ctx, path, color) {
      const p = new Path2D(path);
      ctx.fillStyle = color;
      ctx.fill(p);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke(p);
    },
    
    // 生成随机图标
    generateRandomIcon() {
      this.generating = true;
      
      // 创建Canvas元素
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 设置画布大小为64x64像素
      canvas.width = 64;
      canvas.height = 64;
      
      // 设置背景色为白色
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 64, 64);
      
      // 随机选择一个动物和颜色组合
      const animals = Object.entries(this.animalPaths);
      const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
      const randomColor = this.colorSchemes[Math.floor(Math.random() * this.colorSchemes.length)];
      
      // 绘制动物轮廓
      randomAnimal[1].forEach((path, index) => {
        // 主要部分使用主色调，细节使用强调色
        const color = index === 0 ? randomColor.main : randomColor.accent;
        this.drawPath(ctx, path, color);
      });
      
      // 转换为ICO并下载
      this.createIcoFile(canvas)
        .then(icoData => {
          const blob = new Blob([icoData], { type: 'image/x-icon' });
          const url = URL.createObjectURL(blob);
          
          const downloadLink = this.$refs.downloadLink;
          downloadLink.href = url;
          downloadLink.download = `${randomAnimal[0]}-icon.ico`;
          downloadLink.click();
          
          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 100);
          
          this.generating = false;
          this.showMessage('随机图标生成成功！', 'success');
        })
        .catch(err => {
          console.error('生成失败:', err);
          this.showMessage('生成失败，请重试', 'error');
          this.generating = false;
        });
    }
  }
};
</script>

<style scoped>
.image-to-ico-container {
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

.original-image {
  text-align: center;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.convert-btn,
.clear-btn,
.random-btn {
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

.random-btn {
  background-color: #67C23A;
  color: white;
}

.random-btn:hover {
  background-color: #85ce61;
}

.random-btn:disabled {
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
</style>