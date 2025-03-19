<template>
  <div class="plantuml-editor">
    <div class="editor-container">
      <div class="toolbar">
        <select v-model="selectedExample" class="example-select" @change="loadExample">
          <option value="">选择示例...</option>
          <option value="class">类图示例</option>
          <option value="sequence">时序图示例</option>
          <option value="usecase">用例图示例</option>
          <option value="activity">活动图示例</option>
          <option value="component">组件图示例</option>
          <option value="state">状态图示例</option>
          <option value="object">对象图示例</option>
          <option value="deployment">部署图示例</option>
        </select>
        <button @click="downloadDiagram" class="generate-btn">下载图表</button>
      </div>
      <div class="split-view">
        <div class="editor-panel">
          <textarea
            v-model="plantUmlCode"
            class="code-editor"
            placeholder="在此输入PlantUML代码...
支持类图、时序图、用例图、活动图等
选择上方的示例查看更多用法"
            @input="autoGenerate"
          ></textarea>
        </div>
        <div class="preview-panel">
          <img 
            v-if="diagramUrl" 
            :src="diagramUrl" 
            alt="PlantUML图表" 
            class="diagram-preview" 
            @click="showFullscreen" 
            title="点击全屏查看" 
          />
          <canvas 
            v-if="showCanvas" 
            ref="previewCanvas" 
            style="display: none;"
            class="diagram-preview" 
            @click="showFullscreen" 
            title="点击全屏查看"
          ></canvas>
          <div v-else class="placeholder">
            图表预览区域
          </div>
        </div>
      </div>
    </div>
    
    <!-- 全屏预览模态框 -->
    <div v-if="isFullscreen" class="fullscreen-modal" @click="closeFullscreen">
      <div class="fullscreen-content">
        <img :src="fullscreenImageUrl" alt="PlantUML图表全屏预览" class="fullscreen-image" />
        <div class="fullscreen-close" @click.stop="closeFullscreen">×</div>
        <div class="fullscreen-hint">点击任意位置关闭</div>
      </div>
    </div>
  </div>
</template>

<script>
import plantumlEncoder from 'plantuml-encoder';

export default {
  name: 'PlantUMLEditor',
  data() {
    return {
      plantUmlCode: '',
      diagramUrl: '',
      fullscreenImageUrl: '',
      selectedExample: '',
      isFullscreen: false,
      isDownloading: false,
      showCanvas: false,
      canvasDataUrl: '',
      rawSvgUrl: '',
      examples: {
        class: `@startuml
' 类图示例
class User {
  -id: Long
  -username: String
  -email: String
  +register()
  +login()
}

class Order {
  -orderId: String
  -createTime: Date
  +pay()
  +cancel()
}

User "1" -- "*" Order: creates
@enduml`,
        sequence: `@startuml
' 时序图示例
actor User
participant "Web Client" as C
participant "Server" as S
database "Database" as D

User -> C: 输入用户名密码
C -> S: 发送登录请求
S -> D: 查询用户信息
D --> S: 返回用户数据
S --> C: 返回登录结果
C --> User: 显示登录状态
@enduml`,
        usecase: `@startuml
' 用例图示例
left to right direction

actor 用户
actor 管理员

rectangle 系统 {
  usecase "登录" as UC1
  usecase "注册" as UC2
  usecase "查看订单" as UC3
  usecase "管理用户" as UC4
}

用户 --> UC1
用户 --> UC2
用户 --> UC3
管理员 --> UC4
@enduml`,
        activity: `@startuml
' 活动图示例
start
:用户提交订单;
if (库存充足?) then (是)
  :扣减库存;
  :创建订单;
  if (支付成功?) then (是)
    :发货;
  else (否)
    :取消订单;
    :恢复库存;
  endif
else (否)
  :提示库存不足;
endif
stop
@enduml`,
        component: `@startuml
' 组件图示例
package "前端应用" {
  [Vue.js Client]
  [Router]
  [Vuex Store]
}

package "后端服务" {
  [API Gateway]
  [User Service]
  [Order Service]
  database "MySQL"
}

[Vue.js Client] --> [Router]
[Vue.js Client] --> [Vuex Store]
[Vue.js Client] --> [API Gateway]
[API Gateway] --> [User Service]
[API Gateway] --> [Order Service]
[User Service] --> MySQL
[Order Service] --> MySQL
@enduml`,
        state: `@startuml
' 状态图示例
[*] --> 待支付
待支付 --> 已支付: 支付
待支付 --> 已取消: 取消
已支付 --> 已发货: 发货
已发货 --> 已完成: 确认收货
已完成 --> [*]
已取消 --> [*]
@enduml`,
        object: `@startuml
' 对象图示例
object 订单 {
  订单号 = "ORD001"
  创建时间 = "2024-01-01"
  状态 = "待支付"
}

object 用户 {
  用户名 = "张三"
  邮箱 = "zhangsan@example.com"
}

object 商品 {
  名称 = "商品A"
  价格 = 99.00
  库存 = 100
}

订单 --> 用户
订单 --> 商品
@enduml`,
        deployment: `@startuml
' 部署图示例
cloud "AWS Cloud" {
  node "Web Server" {
    artifact "Frontend App" as frontend
  }
  
  node "Application Server" {
    artifact "Backend API" as backend
  }
  
  node "Database Server" {
    database "MySQL" as db
  }
}

frontend --> backend
backend --> db
@enduml`
      }
    };
  },
  methods: {
    // 显示全屏预览
    showFullscreen() {
      if (this.canvasDataUrl) {
        this.isFullscreen = true;
        // 添加ESC键监听，方便用户按ESC退出全屏
        document.addEventListener('keydown', this.handleEscKey);
        
        // 使用已经生成的Canvas数据
        this.fullscreenImageUrl = this.canvasDataUrl;
      }
    },
    
    // 关闭全屏预览
    closeFullscreen() {
      this.isFullscreen = false;
      // 移除ESC键监听
      document.removeEventListener('keydown', this.handleEscKey);
    },
    
    // 处理ESC键退出全屏
    handleEscKey(event) {
      if (event.key === 'Escape' && this.isFullscreen) {
        this.closeFullscreen();
      }
    },
    async generateDiagram() {
      if (!this.plantUmlCode) {
        this.showCanvas = false;
        this.diagramUrl = '';
        return;
      }
      
      try {
        const encoded = plantumlEncoder.encode(this.plantUmlCode);
        // 使用本地Docker的plantuml-server服务获取原始SVG

        if(location.hostname !== 'localhost'){
          this.rawSvgUrl = `/plantuml/svg/${encoded}`;
        }else{
          this.rawSvgUrl = `https://www.plantuml.com/plantuml/svg/${encoded}`;
        }
        
        // 创建一个Canvas元素
        const canvas = document.createElement('canvas');
        // 设置Canvas大小为1920像素宽
        canvas.width = 1920;
        // 初始高度，稍后会根据图像比例调整
        canvas.height = 1080;
        
        const ctx = canvas.getContext('2d');
        // 设置白色背景
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 创建Image对象
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = this.rawSvgUrl + '?t=' + new Date().getTime();
        
        // 等待图片加载完成后绘制到Canvas
        await new Promise((resolve, reject) => {
          img.onload = () => {
            // 根据SVG比例计算高度
            const aspectRatio = img.naturalHeight / img.naturalWidth;
            canvas.height = Math.round(1920 * aspectRatio) || 1080;
            // 重新设置白色背景（因为改变高度可能会清除先前的背景）
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // 在Canvas上绘制图片
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve();
          };
          img.onerror = () => reject(new Error('图片加载失败'));
        });
        
        // 从Canvas获取PNG数据
        this.canvasDataUrl = canvas.toDataURL('image/png');
        this.diagramUrl = this.canvasDataUrl;
        this.showCanvas = true;
        
        // 更新预览Canvas（如果已渲染到DOM）
        this.$nextTick(() => {
          const previewCanvas = this.$refs.previewCanvas;
          if (previewCanvas) {
            const previewCtx = previewCanvas.getContext('2d');
            // 设置预览Canvas的尺寸（保持比例但适应视图）
            const displayWidth = previewCanvas.parentElement.clientWidth;
            const aspectRatio = canvas.height / canvas.width;
            previewCanvas.width = displayWidth;
            previewCanvas.height = displayWidth * aspectRatio;
            
            // 创建临时图像复制到预览Canvas
            const tempImg = new Image();
            tempImg.onload = () => {
              previewCtx.drawImage(tempImg, 0, 0, previewCanvas.width, previewCanvas.height);
            };
            tempImg.src = this.canvasDataUrl;
          }
        });
      } catch (error) {
        console.error('生成图表时出错:', error);
        // 出错时回退到原始方法
        this.showCanvas = false;
        this.diagramUrl = this.rawSvgUrl;
      }
    },
    async downloadDiagram() {
      if (!this.plantUmlCode) return;
      
      try {
        // 显示下载中提示
        this.isDownloading = true;
        
        // 如果已经有生成的Canvas数据，直接使用
        if (this.canvasDataUrl) {
          // 创建下载链接
          const link = document.createElement('a');
          link.href = this.canvasDataUrl;
          link.download = 'plantuml-diagram.png';
          
          // 触发下载
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          this.isDownloading = false;
          return;
        }
        
        // 如果没有生成的Canvas数据，先调用generateDiagram生成
        await this.generateDiagram();
        
        // 现在应该有canvasDataUrl了，再次尝试下载
        if (this.canvasDataUrl) {
          const link = document.createElement('a');
          link.href = this.canvasDataUrl;
          link.download = 'plantuml-diagram.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          throw new Error('无法生成图表数据');
        }
        
        this.isDownloading = false;
      } catch (error) {
        console.error('下载图表时出错:', error);
        this.isDownloading = false;
        alert('下载图表失败: ' + error.message);
      }
    },
    autoGenerate() {
      // 自动生成延迟500ms，避免频繁请求
      clearTimeout(this.generateTimeout);
      this.generateTimeout = setTimeout(() => {
        this.generateDiagram();
      }, 500);
    },
    loadExample() {
      if (this.selectedExample && this.examples[this.selectedExample]) {
        this.plantUmlCode = this.examples[this.selectedExample];
        this.generateDiagram();
      }
    }
  },
  mounted() {
    // 初始化时显示空白状态
    this.generateDiagram();
  },
  beforeDestroy() {
    // 确保在组件销毁时移除事件监听器
    document.removeEventListener('keydown', this.handleEscKey);
    
    // 清除可能存在的定时器
    if (this.generateTimeout) {
      clearTimeout(this.generateTimeout);
    }
  }
};
</script>

<style scoped>
.plantuml-editor {
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止出现整体滚动条 */
  position: relative;
}

.editor-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* 防止容器出现滚动条 */
}

.toolbar {
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 10px;
  flex-shrink: 0; /* 防止工具栏被压缩 */
}

.example-select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  min-width: 150px;
}

.generate-btn {
  padding: 8px 16px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.generate-btn:hover {
  background: #3aa876;
}

.split-view {
  display: flex;
  flex: 1;
  overflow: hidden; /* 防止分割视图出现滚动条 */
}

.editor-panel, .preview-panel {
  flex: 1;
  padding: 20px;
  overflow: hidden; /* 改为hidden，避免多余的滚动条 */
  display: flex;
  flex-direction: column;
}

.editor-panel {
  border-right: 1px solid #eee;
}

.code-editor {
  width: 100%;
  height: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  font-family: monospace;
  resize: none;
  overflow-y: auto; /* 只在编辑器区域显示垂直滚动条 */
  overflow-x: hidden; /* 隐藏水平滚动条 */
}

.preview-panel {
  flex: 1;
  padding: 20px;
  overflow-y: auto; /* 只在预览区域显示垂直滚动条 */
  overflow-x: hidden; /* 隐藏水平滚动条 */
  display: flex;
  flex-direction: column;
}

.diagram-preview {
  width: 100%; /* 固定宽度为100% */
  height: auto; /* 高度自动适应 */
  display: block; /* 去除默认的内联显示间隙 */
  cursor: pointer; /* 指示可点击 */
  transition: transform 0.2s; /* 添加悬停效果 */
}

.diagram-preview:hover {
  transform: scale(1.02); /* 轻微放大效果 */
}

.placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  border: 2px dashed #ddd;
  border-radius: 4px;
}

/* 全屏预览样式 */
.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  cursor: pointer;
}

.fullscreen-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
}

.fullscreen-image {
  display: block;
  max-width: 100%;
  max-height: 90vh;
  margin: 0 auto;
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
}

.fullscreen-close {
  position: absolute;
  top: 10px;
  right: 10px;
  color: white;
  font-size: 30px;
  font-weight: bold;
  cursor: pointer;
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
}

.fullscreen-hint {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
  color: white;
  font-size: 14px;
  opacity: 0.7;
}

/* 美化滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style> 