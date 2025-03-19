/**
 * 图片处理工具函数
 */

/**
 * 将图片转换为指定格式
 * @param {Object} options - 配置选项
 * @param {File} options.file - 图片文件
 * @param {String} options.format - 目标格式 (jpg, png, webp, ico)
 * @param {Number} options.quality - 图片质量 (1-100)
 * @param {Number} options.width - 输出图片宽度 (像素)
 * @param {Number} options.height - 输出图片高度 (像素)
 * @returns {Promise<Object>} 包含blob和dataUrl的对象
 */
export const convertToFormat = ({ file, format, quality = 80, width = 0, height = 0 }) => {
  return new Promise((resolve, reject) => {
    // 创建FileReader读取文件
    const reader = new FileReader();
    
    reader.onload = (event) => {
      // 创建Image对象
      const img = new Image();
      
      img.onload = () => {
        try {
          // 创建Canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // 确定Canvas尺寸
          let outputWidth, outputHeight;
          
          // 如果ICO格式，强制设置为64x64
          if (format === 'ico') {
            outputWidth = 64;
            outputHeight = 64;
          } else if (width > 0 && height > 0) {
            // 使用指定尺寸
            outputWidth = width;
            outputHeight = height;
          } else {
            // 使用原始尺寸
            outputWidth = img.width;
            outputHeight = img.height;
          }
          
          // 设置Canvas尺寸
          canvas.width = outputWidth;
          canvas.height = outputHeight;
          
          // 绘制图片到Canvas，自动缩放
          ctx.drawImage(img, 0, 0, outputWidth, outputHeight);
          
          // 根据不同格式进行转换
          if (format === 'ico') {
            // ICO格式特殊处理
            createIcoFile(canvas)
              .then(icoData => {
                const blob = new Blob([icoData], { type: 'image/x-icon' });
                resolve({ blob });
              })
              .catch(reject);
          } else {
            // 其他格式使用toBlob方法
            const mimeType = getMimeType(format);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve({ blob });
                } else {
                  reject(new Error('转换失败'));
                }
              },
              mimeType,
              quality / 100
            );
          }
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };
      
      // 设置图片源
      img.src = event.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    
    // 读取文件
    reader.readAsDataURL(file);
  });
};

/**
 * 创建ICO文件
 * @param {HTMLCanvasElement} canvas - 包含图像的Canvas元素
 * @returns {Promise<Uint8Array>} ICO文件的二进制数据
 */
const createIcoFile = (canvas) => {
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
};

/**
 * 根据格式获取对应的MIME类型
 * @param {String} format - 格式名称
 * @returns {String} MIME类型字符串
 */
const getMimeType = (format) => {
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'ico': 'image/x-icon'
  };
  
  return mimeTypes[format] || 'image/jpeg';
};

/**
 * 从Blob对象获取Base64编码
 * @param {Blob} blob - 图片的Blob对象
 * @returns {Promise<String>} Base64编码字符串
 */
export const getBase64FromBlob = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result);
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    
    reader.readAsDataURL(blob);
  });
};

/**
 * 从Base64编码创建Blob对象
 * @param {String} base64 - Base64编码字符串
 * @returns {Promise<Blob>} 图片的Blob对象
 */
export const createBlobFromBase64 = (base64) => {
  return new Promise((resolve, reject) => {
    try {
      // 如果base64字符串不包含类型前缀，添加默认前缀
      let dataURL = base64;
      if (!base64.startsWith('data:')) {
        dataURL = `data:image/png;base64,${base64.replace(/^base64,/, '')}`;
      }
      
      // 从data URL中提取类型信息
      const mimeMatch = dataURL.match(/data:([^;]+);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
      
      // 解码Base64数据
      const byteString = atob(dataURL.split(',')[1]);
      
      // 创建ArrayBuffer
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // 填充ArrayBuffer
      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }
      
      // 创建Blob
      const blob = new Blob([arrayBuffer], { type: mimeType });
      resolve(blob);
    } catch (error) {
      reject(new Error('Base64格式无效'));
    }
  });
}; 