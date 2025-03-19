<template>
  <div class="color-converter">
    <h1 class="page-title">颜色选择器/转换器</h1>
    <div class="tool-description">
      <p>这个工具可以帮助你在RGB、HEX、HSL等颜色格式之间进行转换，方便前端开发处理颜色相关任务。</p>
    </div>

    <div class="converter-container">
      <div class="color-preview-container">
        <div class="color-preview" :style="{ backgroundColor: previewColor }"></div>
        <div class="color-preview-text">{{ previewColor }}</div>
      </div>

      <div class="converter-inputs">
        <div class="input-group">
          <label>颜色选择器</label>
          <input type="color" v-model="colorPicker" @input="updateFromColorPicker">
        </div>

        <div class="input-group">
          <label>HEX</label>
          <div class="flex-row">
            <input type="text" v-model="hexColor" @input="updateFromHex" placeholder="#RRGGBB">
            <button @click="copyToClipboard(hexColor)" class="copy-btn">复制</button>
          </div>
        </div>

        <div class="input-group">
          <label>RGB</label>
          <div class="flex-row">
            <input type="text" v-model="rgbColor" @input="updateFromRgb" placeholder="rgb(255, 255, 255)">
            <button @click="copyToClipboard(rgbColor)" class="copy-btn">复制</button>
          </div>
        </div>

        <div class="input-group">
          <label>RGBA</label>
          <div class="flex-row">
            <input type="text" v-model="rgbaColor" @input="updateFromRgba" placeholder="rgba(255, 255, 255, 1)">
            <button @click="copyToClipboard(rgbaColor)" class="copy-btn">复制</button>
          </div>
        </div>

        <div class="input-group">
          <label>HSL</label>
          <div class="flex-row">
            <input type="text" v-model="hslColor" @input="updateFromHsl" placeholder="hsl(0, 0%, 100%)">
            <button @click="copyToClipboard(hslColor)" class="copy-btn">复制</button>
          </div>
        </div>
      </div>

      <div class="sliders-container">
        <div class="slider-group">
          <label>R: {{ rgb.r }}</label>
          <input type="range" min="0" max="255" v-model.number="rgb.r" @input="updateFromRgbObject">
        </div>
        <div class="slider-group">
          <label>G: {{ rgb.g }}</label>
          <input type="range" min="0" max="255" v-model.number="rgb.g" @input="updateFromRgbObject">
        </div>
        <div class="slider-group">
          <label>B: {{ rgb.b }}</label>
          <input type="range" min="0" max="255" v-model.number="rgb.b" @input="updateFromRgbObject">
        </div>
        <div class="slider-group">
          <label>Alpha: {{ rgb.a }}</label>
          <input type="range" min="0" max="1" step="0.01" v-model.number="rgb.a" @input="updateFromRgbObject">
        </div>
      </div>
    </div>

    <div class="color-history">
      <h3>最近使用的颜色</h3>
      <div class="color-chips">
        <div 
          v-for="(color, index) in colorHistory" 
          :key="index" 
          class="color-chip"
          :style="{ backgroundColor: color }"
          @click="applyHistoryColor(color)"
          :title="color"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorConverter',
  data() {
    return {
      colorPicker: '#42b983',
      hexColor: '#42b983',
      rgbColor: 'rgb(66, 185, 131)',
      rgbaColor: 'rgba(66, 185, 131, 1)',
      hslColor: 'hsl(153, 47%, 49%)',
      rgb: {
        r: 66,
        g: 185,
        b: 131,
        a: 1
      },
      previewColor: '#42b983',
      colorHistory: []
    };
  },
  methods: {
    updateFromColorPicker() {
      this.hexColor = this.colorPicker;
      this.updateFromHex();
    },
    updateFromHex() {
      const hex = this.hexColor.trim();
      if (/^#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/.test(hex)) {
        const cleanHex = hex.charAt(0) === '#' ? hex : '#' + hex;
        this.previewColor = cleanHex;
        this.hexColor = cleanHex;
        
        // 转换为RGB
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex) || 
                       /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(cleanHex);
        
        if (result) {
          const r = result[1].length === 1 
            ? parseInt(result[1] + result[1], 16) 
            : parseInt(result[1], 16);
          const g = result[2].length === 1 
            ? parseInt(result[2] + result[2], 16) 
            : parseInt(result[2], 16);
          const b = result[3].length === 1 
            ? parseInt(result[3] + result[3], 16) 
            : parseInt(result[3], 16);
          
          this.rgb = { r, g, b, a: this.rgb.a };
          this.rgbColor = `rgb(${r}, ${g}, ${b})`;
          this.rgbaColor = `rgba(${r}, ${g}, ${b}, ${this.rgb.a})`;
          
          // 转换为HSL
          this.hslColor = this.rgbToHsl(r, g, b);
          
          this.addToHistory(cleanHex);
          this.colorPicker = cleanHex;
        }
      }
    },
    updateFromRgb() {
      const match = this.rgbColor.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
      if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
          this.rgb = { r, g, b, a: this.rgb.a };
          this.hexColor = this.rgbToHex(r, g, b);
          this.rgbaColor = `rgba(${r}, ${g}, ${b}, ${this.rgb.a})`;
          this.hslColor = this.rgbToHsl(r, g, b);
          this.previewColor = this.hexColor;
          this.colorPicker = this.hexColor;
          this.addToHistory(this.hexColor);
        }
      }
    },
    updateFromRgba() {
      const match = this.rgbaColor.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
      if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        const a = parseFloat(match[4]);
        if (!isNaN(r) && !isNaN(g) && !isNaN(b) && !isNaN(a)) {
          this.rgb = { r, g, b, a };
          this.hexColor = this.rgbToHex(r, g, b);
          this.rgbColor = `rgb(${r}, ${g}, ${b})`;
          this.hslColor = this.rgbToHsl(r, g, b);
          this.previewColor = this.hexColor;
          this.colorPicker = this.hexColor;
          this.addToHistory(this.hexColor);
        }
      }
    },
    updateFromHsl() {
      const match = this.hslColor.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/);
      if (match) {
        const h = parseInt(match[1]);
        const s = parseInt(match[2]);
        const l = parseInt(match[3]);
        if (!isNaN(h) && !isNaN(s) && !isNaN(l)) {
          const rgb = this.hslToRgb(h, s, l);
          this.rgb = { ...rgb, a: this.rgb.a };
          this.hexColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
          this.rgbColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
          this.rgbaColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.rgb.a})`;
          this.previewColor = this.hexColor;
          this.colorPicker = this.hexColor;
          this.addToHistory(this.hexColor);
        }
      }
    },
    updateFromRgbObject() {
      const { r, g, b, a } = this.rgb;
      this.hexColor = this.rgbToHex(r, g, b);
      this.rgbColor = `rgb(${r}, ${g}, ${b})`;
      this.rgbaColor = `rgba(${r}, ${g}, ${b}, ${a})`;
      this.hslColor = this.rgbToHsl(r, g, b);
      this.previewColor = this.hexColor;
      this.colorPicker = this.hexColor;
      this.addToHistory(this.hexColor);
    },
    rgbToHex(r, g, b) {
      return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
    },
    rgbToHsl(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s;
      const l = (max + min) / 2;
      
      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        
        h = Math.round(h * 60);
      }
      
      s = Math.round(s * 100);
      l = Math.round(l * 100);
      
      return `hsl(${h}, ${s}%, ${l}%)`;
    },
    hslToRgb(h, s, l) {
      h /= 360;
      s /= 100;
      l /= 100;
      
      let r, g, b;
      
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      
      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
      };
    },
    copyToClipboard(text) {
      navigator.clipboard.writeText(text)
        .then(() => {
          alert('已复制到剪贴板');
        })
        .catch(err => {
          console.error('复制失败:', err);
        });
    },
    addToHistory(color) {
      if (!this.colorHistory.includes(color)) {
        this.colorHistory.unshift(color);
        if (this.colorHistory.length > 10) {
          this.colorHistory.pop();
        }
      }
    },
    applyHistoryColor(color) {
      this.hexColor = color;
      this.updateFromHex();
    }
  }
};
</script>

<style scoped>
.color-converter {
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

.color-preview-container {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.color-preview {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
}

.color-preview-text {
  font-size: 1.2rem;
  font-weight: bold;
}

.converter-inputs {
  flex: 2;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.sliders-container {
  flex: 2;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-group, .slider-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-group label, .slider-group label {
  font-weight: bold;
  color: #2c3e50;
}

.flex-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

input[type="text"], input[type="color"] {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input[type="color"] {
  width: 100%;
  height: 40px;
  cursor: pointer;
}

input[type="range"] {
  width: 100%;
}

.copy-btn {
  padding: 8px 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.copy-btn:hover {
  background-color: #3a9d70;
}

.color-history {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.color-history h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
}

.color-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.color-chip {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.color-chip:hover {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .converter-container {
    flex-direction: column;
  }
  
  .color-preview-container {
    width: 100%;
  }
}
</style> 