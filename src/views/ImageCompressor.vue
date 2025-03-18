<template>
  <div class="image-compressor">
    <h1 class="tool-title">图片压缩工具</h1>
    
    <input type="file" @change="handleFileChange" accept="image/*" multiple />
    <div class="compression-options">
      <label>
        压缩质量：
        <input type="range" v-model="compressionQuality" min="0.1" max="1" step="0.1" />
        {{ (compressionQuality * 100).toFixed(0) }}%
      </label>
    </div>
    
    <button @click="compressImages" :disabled="!images.length">压缩图片</button>
    
    <div class="image-preview" v-if="compressedImages.length">
      <h2>压缩后的图片</h2>
      <div class="images">
        <div v-for="(image, index) in compressedImages" :key="index" class="image-item">
          <img :src="image.url" :alt="`Compressed Image ${index + 1}`" />
          <a :href="image.url" :download="`compressed-${index + 1}.jpg`">下载</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import imageCompression from 'browser-image-compression';

export default {
  name: 'ImageCompressor',
  data() {
    return {
      images: [],
      compressedImages: [],
      compressionQuality: 0.8
    };
  },
  methods: {
    handleFileChange(event) {
      this.images = Array.from(event.target.files);
    },
    async compressImages() {
      this.compressedImages = [];
      for (const image of this.images) {
        try {
          const compressedFile = await imageCompression(image, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: this.compressionQuality
          });
          const url = URL.createObjectURL(compressedFile);
          this.compressedImages.push({ file: compressedFile, url });
        } catch (error) {
          console.error('压缩失败:', error);
        }
      }
    }
  }
};
</script>

<style scoped>
.image-compressor {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.tool-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 20px;
}

.compression-options {
  margin: 20px 0;
}

button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

button:hover:enabled {
  background-color: #3aa876;
}

.image-preview {
  margin-top: 30px;
}

.images {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.image-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-item img {
  max-width: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
}

a {
  color: #42b983;
  text-decoration: none;
  font-weight: bold;
}

a:hover {
  text-decoration: underline;
}
</style> 