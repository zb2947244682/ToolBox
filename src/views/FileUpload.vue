<template>
  <div class="file-upload-container">
    <h1 class="page-title">OSS上传</h1>
    
    <!-- 设置按钮 -->
    <div class="settings-button-container">
      <button @click="showConfig = true" class="settings-btn">
        OSS配置
      </button>
    </div>

    <!-- 配置弹窗 -->
    <div v-if="showConfig" class="config-modal">
      <div class="config-modal-content">
        <div class="config-modal-header">
          <h2>OSS配置</h2>
          <button @click="showConfig = false" class="close-btn">
            关闭
          </button>
        </div>
        <div class="config-panel">
          <div class="form-group">
            <label>AccessKey ID:</label>
            <input v-model="config.accessKeyId" type="text" placeholder="请输入AccessKey ID" autocomplete="off">
          </div>
          <div class="form-group">
            <label>AccessKey Secret:</label>
            <input v-model="config.accessKeySecret" type="password" placeholder="请输入AccessKey Secret" autocomplete="off">
          </div>
          <div class="form-group">
            <label>Bucket:</label>
            <input v-model="config.bucket" type="text" placeholder="请输入Bucket名称" autocomplete="off">
          </div>
          <div class="form-group">
            <label>Region:</label>
            <input v-model="config.region" type="text" placeholder="例如: oss-cn-shanghai" autocomplete="off">
          </div>
          <div class="form-group">
            <label>上传路径:</label>
            <input v-model="uploadPath" type="text" placeholder="例如: /images" autocomplete="off">
          </div>
          <div class="modal-footer">
            <button @click="showConfig = false" class="cancel-btn">取消</button>
            <button @click="saveConfig" class="save-btn">保存配置</button>
          </div>
        </div>
      </div>
    </div>

    <div class="upload-area" @drop.prevent="handleDrop" @dragover.prevent>
      <div class="drop-zone" @click="triggerFileInput">
        <p>拖拽文件到此处或点击上传</p>
        <input
          type="file"
          ref="fileInput"
          multiple
          @change="handleFileSelect"
          style="display: none"
        >
      </div>
    </div>

    <div class="file-list" v-if="files.length > 0">
      <h3>待上传文件 ({{ files.length }}个)</h3>
      <ul>
        <li v-for="(file, index) in files" :key="index" class="file-item">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ formatFileSize(file.size) }}</span>
          <button @click="removeFile(index)" class="remove-btn">
            删除
          </button>
        </li>
      </ul>
      <div class="action-buttons">
        <button @click="clearFiles" class="clear-btn">
          清空列表
        </button>
        <button @click="uploadFiles" class="upload-btn" :disabled="uploading">
          {{ uploading ? '上传中...' : '开始上传' }}
        </button>
      </div>
    </div>

    <!-- 上传历史记录 -->
    <div class="upload-history" v-if="uploadedFiles.length > 0">
      <h3>已上传文件</h3>
      <ul>
        <li v-for="(file, index) in uploadedFiles" :key="index" class="uploaded-file-item">
          <!-- 文件图标/预览图 -->
          <div class="file-preview" @click="previewFile(file)">
            <template v-if="isImageFile(file.name)">
              <img :src="file.url" class="preview-thumbnail" :alt="file.name">
            </template>
            <template v-else>
              <span class="file-type">文件</span>
            </template>
          </div>
          
          <div class="file-info">
            <div class="file-name-row">
              <span class="file-name">{{ file.name }}</span>
              <div class="action-btns">
                <button class="action-btn copy-btn" @click="copyUrl(file.url)" title="复制链接">
                  复制
                </button>
                <button class="action-btn preview-btn" @click="openUrl(file.url)" title="预览文件">
                  预览
                </button>
              </div>
            </div>
            <div class="file-url-row">
              <span class="file-url tooltip-container">
                {{ file.url }}
                <span class="tooltip">{{ file.url }}</span>
              </span>
            </div>
          </div>
        </li>
      </ul>
      
      <!-- 添加复制所有链接按钮 -->
      <div class="action-buttons">
        <button @click="copyAllUrls" class="copy-all-btn">
          复制所有链接
        </button>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <div v-if="showPreview && currentPreviewFile && isImageFile(currentPreviewFile.name)" class="preview-modal" @click="showPreview = false">
      <div class="preview-content">
        <img :src="currentPreviewFile.url" :alt="currentPreviewFile.name">
        <button class="close-preview-btn" @click.stop="showPreview = false">
          关闭
        </button>
      </div>
    </div>

    <!-- 消息提示组件 -->
    <div v-if="message.show" :class="['message-popup', `message-${message.type}`]">
      <span>{{ message.text }}</span>
    </div>
  </div>
</template>

<script>
import OSS from 'ali-oss'

export default {
  name: 'FileUpload',
  data() {
    return {
      showConfig: false,
      showPreview: false,
      currentPreviewFile: null,
      config: {
        accessKeyId: localStorage.getItem('ossAccessKeyId') || '',
        accessKeySecret: localStorage.getItem('ossAccessKeySecret') || '',
        bucket: localStorage.getItem('ossBucket') || '',
        region: localStorage.getItem('ossRegion') || '',
        secure: true
      },
      uploadPath: localStorage.getItem('ossUploadPath') || '/images',
      files: [],
      uploadedFiles: [],
      uploading: false,
      client: null,
      message: {
        show: false,
        text: '',
        type: 'info',
        timer: null
      }
    }
  },
  watch: {
    'config.accessKeyId'(val) {
      localStorage.setItem('ossAccessKeyId', val)
    },
    'config.accessKeySecret'(val) {
      localStorage.setItem('ossAccessKeySecret', val)
    },
    'config.bucket'(val) {
      localStorage.setItem('ossBucket', val)
    },
    'config.region'(val) {
      localStorage.setItem('ossRegion', val)
    },
    uploadPath(val) {
      localStorage.setItem('ossUploadPath', val)
    }
  },
  methods: {
    showMessage(text, type = 'info') {
      // 清除之前的定时器
      if (this.message.timer) {
        clearTimeout(this.message.timer)
      }
      
      // 设置新的消息
      this.message.show = true
      this.message.text = text
      this.message.type = type
      
      // 3秒后自动关闭
      this.message.timer = setTimeout(() => {
        this.message.show = false
      }, 3000)
    },
    saveConfig() {
      localStorage.setItem('ossAccessKeyId', this.config.accessKeyId)
      localStorage.setItem('ossAccessKeySecret', this.config.accessKeySecret)
      localStorage.setItem('ossBucket', this.config.bucket)
      localStorage.setItem('ossRegion', this.config.region)
      localStorage.setItem('ossUploadPath', this.uploadPath)
      this.showMessage('配置已保存', 'success')
      this.showConfig = false
    },
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    handleFileSelect(e) {
      const newFiles = Array.from(e.target.files)
      this.files.push(...newFiles)
    },
    handleDrop(e) {
      const newFiles = Array.from(e.dataTransfer.files)
      this.files.push(...newFiles)
    },
    removeFile(index) {
      this.files.splice(index, 1)
    },
    clearFiles() {
      this.files = []
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    async uploadFiles() {
      if (!this.config.accessKeyId || !this.config.accessKeySecret || !this.config.bucket || !this.config.region) {
        this.showMessage('请先完成OSS配置', 'error')
        this.showConfig = true
        return
      }

      this.uploading = true
      this.client = new OSS(this.config)

      try {
        for (const file of this.files) {
          const fileName = `${this.uploadPath}/${Date.now()}-${file.name}`
          const result = await this.client.put(fileName, file)
          this.uploadedFiles.unshift({
            name: file.name,
            url: result.url
          })
        }
        this.files = []
      } catch (error) {
        this.showMessage('上传失败：' + error.message, 'error')
      } finally {
        this.uploading = false
      }
    },
    copyUrl(url) {
      navigator.clipboard.writeText(url).then(() => {
        this.showMessage('链接已复制到剪贴板', 'success')
      }).catch(() => {
        // 如果剪贴板API不可用，使用传统方法
        const textarea = document.createElement('textarea')
        textarea.value = url
        document.body.appendChild(textarea)
        textarea.select()
        try {
          document.execCommand('copy')
          this.showMessage('链接已复制到剪贴板', 'success')
        } catch (err) {
          this.showMessage('复制失败，请手动复制', 'error')
        }
        document.body.removeChild(textarea)
      })
    },
    openUrl(url) {
      window.open(url, '_blank')
    },
    isImageFile(filename) {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
      return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext))
    },
    previewFile(file) {
      if (this.isImageFile(file.name)) {
        this.currentPreviewFile = file
        this.showPreview = true
      } else {
        this.openUrl(file.url)
      }
    },
    // 复制所有URL
    copyAllUrls() {
      if (this.uploadedFiles.length === 0) return;
      
      const allUrls = this.uploadedFiles.map(file => file.url).join('\n');
      
      navigator.clipboard.writeText(allUrls).then(() => {
        this.showMessage('所有链接已复制到剪贴板', 'success')
      }).catch(() => {
        // 如果剪贴板API不可用，使用传统方法
        const textarea = document.createElement('textarea')
        textarea.value = allUrls
        document.body.appendChild(textarea)
        textarea.select()
        try {
          document.execCommand('copy')
          this.showMessage('所有链接已复制到剪贴板', 'success')
        } catch (err) {
          this.showMessage('复制失败，请手动复制', 'error')
        }
        document.body.removeChild(textarea)
      })
    },
  }
}
</script>

<style scoped>
.file-upload-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.settings-button-container {
  text-align: right;
  margin-bottom: 20px;
}

.settings-btn {
  background: #409eff;
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.config-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.config-modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.config-modal-header {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #909399;
}

.config-panel {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn {
  background: #909399;
  color: white;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.upload-area {
  border: 2px dashed #409eff;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  margin: 20px 0;
}

.drop-zone {
  padding: 40px 0;
}

.drop-zone i {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 10px;
}

.file-list, .upload-history {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.file-item, .uploaded-file-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.file-name {
  flex: 1;
  margin-right: 10px;
}

.file-size, .file-url {
  color: #909399;
  margin-right: 10px;
}

.file-url {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

button {
  padding: 8px 15px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.save-btn {
  background: #67c23a;
  color: white;
}

.upload-btn {
  background: #409eff;
  color: white;
}

.clear-btn {
  background: #f56c6c;
  color: white;
}

.remove-btn, .copy-btn {
  background: transparent;
  color: #f56c6c;
  padding: 2px 5px;
}

.copy-btn {
  color: #409eff;
}

button:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}

.uploaded-file-item {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
  gap: 15px;
  background: #fff;
  transition: background-color 0.2s;
}

.uploaded-file-item:hover {
  background: #f5f7fa;
}

.file-preview {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  border: 1px solid #ebeef5;
  transition: transform 0.2s;
}

.file-preview:hover {
  transform: scale(1.05);
}

.preview-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  font-size: 24px;
  color: #909399;
}

.file-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.file-name {
  font-weight: 500;
  color: #2c3e50;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-btns {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.action-btn {
  background: transparent;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
}

.action-btn:hover {
  background: #ecf5ff;
}

.action-btn i {
  font-size: 16px;
}

.copy-btn, .preview-btn {
  color: #409eff;
}

.copy-btn:hover, .preview-btn:hover {
  background: #ecf5ff;
  transform: scale(1.05);
}

.file-url-row {
  font-size: 13px;
}

.file-url {
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  position: relative;
}

/* 自定义tooltip */
.tooltip-container {
  position: relative;
  cursor: pointer;
}

.tooltip-container .tooltip {
  visibility: hidden;
  position: absolute;
  left: 50%;
  bottom: 125%;
  margin-left: -75px;
  background: white;
  color: #333;
  text-align: center;
  padding: 5px 10px;
  border-radius: 4px;
  width: 300px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  z-index: 1;
  opacity: 0;
  transition: opacity 0.3s;
  white-space: normal;
  word-break: break-all;
  border: 1px solid #ebeef5;
}

.tooltip-container .tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: white transparent transparent transparent;
}

.tooltip-container:hover .tooltip {
  visibility: visible;
  opacity: 1;
}

.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.preview-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.preview-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  display: block;
}

.close-preview-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-preview-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.copy-all-btn {
  background: #409eff;
  color: white;
  margin-top: 15px;
  width: 100%;
  justify-content: center;
}

.copy-all-btn:hover {
  background: #66b1ff;
}

.standalone-copy-btn {
  background: #409eff;
  color: white;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  height: 36px;
  width: 72px;
  flex-shrink: 0;
  transition: all 0.2s;
}

.standalone-copy-btn:hover {
  background: #66b1ff;
  transform: scale(1.05);
}

.standalone-copy-btn i {
  font-size: 16px;
}

.file-type {
  font-size: 14px;
  color: #909399;
}

/* 自定义消息提示样式 */
.message-popup {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  z-index: 9999;
  display: flex;
  align-items: center;
  transition: all 0.3s;
  min-width: 260px;
  box-sizing: border-box;
  border: 1px solid #ebeef5;
}

.message-success {
  background-color: #f0f9eb;
  border-color: #e1f3d8;
  color: #67c23a;
}

.message-info {
  background-color: #f4f4f5;
  border-color: #e9e9eb;
  color: #909399;
}

.message-warning {
  background-color: #fdf6ec;
  border-color: #faecd8;
  color: #e6a23c;
}

.message-error {
  background-color: #fef0f0;
  border-color: #fde2e2;
  color: #f56c6c;
}
</style> 