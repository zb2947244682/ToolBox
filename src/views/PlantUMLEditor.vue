<template>
  <div class="plantuml-editor">
    <div class="editor-container">
      <div class="toolbar">
        <select v-model="selectedExample" class="example-select" @change="loadExample">
          <option value="">选择示例...</option>
          <optgroup label="结构图">
            <option value="class">类图示例</option>
            <option value="object">对象图示例</option>
            <option value="component">组件图示例</option>
            <option value="deployment">部署图示例</option>
            <option value="er">ER数据关系图</option>
          </optgroup>
          <optgroup label="行为图">
            <option value="sequence">时序图示例</option>
            <option value="activity">活动图示例</option>
            <option value="state">状态图示例</option>
            <option value="usecase">用例图示例</option>
            <option value="timing">时序时间图</option>
          </optgroup>
          <optgroup label="架构图">
            <option value="archimate">ArchiMate架构图</option>
            <option value="network">网络图</option>
          </optgroup>
          <optgroup label="规划图">
            <option value="gantt">甘特图</option>
            <option value="wbs">工作分解结构图</option>
            <option value="mindmap">思维导图</option>
          </optgroup>
          <optgroup label="其他">
            <option value="salt">UI界面原型</option>
            <option value="json">JSON数据图</option>
          </optgroup>
        </select>
        <select v-model="selectedTheme" class="theme-select" @change="applyTheme">
          <option value="">默认样式</option>
          <option value="plain">简洁样式</option>
          <option value="monochrome">黑白样式</option>
          <option value="hand">手绘样式</option>
          <option value="sketchy">素描样式</option>
          <option value="vibrant">鲜艳样式</option>
          <option value="black-knight">黑骑士</option>
          <option value="crt-amber">琥珀显示器</option>
          <option value="crt-green">绿色显示器</option>
          <option value="hacker">黑客风格</option>
          <option value="materia">材质风格</option>
          <option value="minty">薄荷风格</option>
          <option value="spacelab">太空实验室</option>
          <option value="toy">玩具风格</option>
          <option value="united">联合风格</option>
          <option value="cerulean">蔚蓝风格</option>
          <option value="blueprint">蓝图风格</option>
          <option value="cyborg">机械风格</option>
        </select>
        <button @click="downloadDiagram" class="generate-btn">下载图表</button>
      </div>
      <div class="split-view">
        <div class="editor-panel">
          <textarea v-model="plantUmlCode" class="code-editor" placeholder="在此输入PlantUML代码...
支持类图、时序图、用例图、活动图等
选择上方的示例查看更多用法" @input="autoGenerate"></textarea>
        </div>
        <div class="preview-panel">
          <img v-if="diagramUrl" :src="diagramUrl" alt="PlantUML图表" class="diagram-preview" @click="showFullscreen"
            title="点击全屏查看" />
          <div v-else class="placeholder">
            图表预览区域
          </div>
        </div>
      </div>
    </div>

    <canvas v-if="showCanvas" ref="previewCanvas" style="display: none;" @click="showFullscreen"
      title="点击全屏查看"></canvas>

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
      selectedTheme: '',
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
@enduml`,
        er: `@startuml
' ER图示例
entity "用户" as user {
  * 用户ID : number <<PK>>
  --
  * 用户名 : string
  * 邮箱 : string
  创建时间 : datetime
}

entity "订单" as order {
  * 订单ID : number <<PK>>
  --
  * 用户ID : number <<FK>>
  订单金额 : decimal
  下单时间 : datetime
  状态 : string
}

entity "商品" as product {
  * 商品ID : number <<PK>>
  --
  商品名称 : string
  价格 : decimal
  库存 : number
}

entity "订单项" as orderItem {
  * 项ID : number <<PK>>
  --
  * 订单ID : number <<FK>>
  * 商品ID : number <<FK>>
  数量 : number
  单价 : decimal
}

user ||--o{ order
order ||--o{ orderItem
product ||--o{ orderItem
@enduml`,
        mindmap: `@startmindmap
' 思维导图示例
* 项目管理
** 需求分析
*** 用户调研
*** 需求文档
** 设计阶段
*** UI设计
*** 架构设计
** 开发阶段
*** 前端开发
**** HTML/CSS
**** JavaScript
**** Vue.js
*** 后端开发
**** Java
**** Spring Boot
**** 数据库
** 测试阶段
*** 单元测试
*** 集成测试
*** 系统测试
** 部署上线
*** CI/CD
*** 监控
@endmindmap`,
        gantt: `@startgantt
' 甘特图示例
project starts 2024-01-01
[需求分析] lasts 2 weeks
[设计] lasts 3 weeks
[设计] starts at [需求分析]'s end
[开发] lasts 4 weeks
[开发] starts at [设计]'s end
[测试] lasts 2 weeks
[测试] starts at [开发]'s end
[部署] lasts 1 week
[部署] starts at [测试]'s end
@endgantt`,
        wbs: `@startwbs
' 工作分解结构图(WBS)示例
* 网站开发项目
** 规划
*** 需求收集
*** 预算评估
*** 团队组建
** 设计
*** UI/UX设计
*** 数据库设计
*** API设计
** 实现
*** 前端开发
**** 页面构建
**** 交互功能
*** 后端开发
**** API开发
**** 数据库集成
** 测试
*** 单元测试
*** 集成测试
*** 用户验收测试
** 部署与维护
*** 部署上线
*** 运行监控
@endwbs`,
        timing: `@startuml
' 时序时间图示例
clock clk with period 1
concise "用户" as U
concise "系统" as S
concise "数据库" as D

@0
U is "空闲"
S is "空闲"
D is "空闲"

@1
U is "请求登录"
@2
S is "验证"
@3 
D is "查询"
@4
D is "返回数据"
@5
S is "处理成功"
@6
U is "已登录"
@enduml`,
        network: `@startuml
' 网络图示例
nwdiag {
  network 互联网 {
    web01 [address = "公网IP"]
  }
  
  network 内网 {
    web01 [address = "192.168.1.1"]
    app01 [address = "192.168.1.2"]
    db01 [address = "192.168.1.3"]
  }
  
  network 管理网络 {
    web01 [address = "10.0.0.1"]
    app01 [address = "10.0.0.2"]
    db01 [address = "10.0.0.3"]
    admin [address = "10.0.0.10"]
  }
}
@enduml`,
        archimate: `@startuml
' ArchiMate架构图示例
title "企业架构示例"

' 定义元素
rectangle "CEO" as CEO #Business
rectangle "管理层" as management #Business
rectangle "战略规划" as strategy #Business
rectangle "业务服务" as services #Business

rectangle "CRM系统" as crm #Application 
rectangle "ERP系统" as erp #Application
rectangle "客户服务" as customer_service #Application

rectangle "数据库服务" as db_service #Technology
rectangle "应用托管" as app_hosting #Technology
rectangle "服务器" as server #Technology
rectangle "数据库管理系统" as dbms #Technology

' 定义关系
CEO --> management : 分配
CEO --> strategy : 触发
strategy --> services : 实现

crm --> services : 服务
erp --> services : 服务
crm --> customer_service : 实现

db_service --> crm : 服务
app_hosting --> crm : 服务
server --> app_hosting : 实现
dbms --> db_service : 实现
@enduml`,
        salt: `@startsalt
' 用户界面原型示例
{
  {+
    {* 用户登录 | }
    {
      用户名 | "请输入用户名      "
      密  码 | "**********"
      {[记住我] | [忘记密码?]}
    }
    {[   取消   ] | [   登录   ]}
  }
}
@endsalt`,
        json: `@startjson
' JSON示例
{
  "用户": {
    "用户ID": 1001,
    "用户名": "张三",
    "联系方式": {
      "邮箱": "zhangsan@example.com",
      "电话": "13800138000"
    },
    "订单": [
      {
        "订单ID": "ORD001",
        "金额": 99.99,
        "状态": "已付款"
      },
      {
        "订单ID": "ORD002",
        "金额": 159.99,
        "状态": "待发货"
      }
    ],
    "是VIP": true
  }
}
@endjson`
      },
      themes: {
        '': '',
        'plain': '!theme plain\n',
        'monochrome': 'skinparam monochrome true\n',
        'hand': 'skinparam handwritten true\n',
        'sketchy': '!theme sketchy\n',
        'vibrant': '!theme vibrant\n',
        'black-knight': '!theme black-knight\n',
        'crt-amber': '!theme crt-amber\n',
        'crt-green': '!theme crt-green\n',
        'hacker': '!theme hacker\n',
        'materia': '!theme materia\n',
        'minty': '!theme minty\n',
        'spacelab': '!theme spacelab\n',
        'toy': '!theme toy\n',
        'united': '!theme united\n',
        'cerulean': '!theme cerulean\n',
        'blueprint': '!theme blueprint\n',
        'cyborg': '!theme cyborg\n'
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

        if (location.hostname !== 'localhost') {
          this.rawSvgUrl = `/plantuml/svg/${encoded}`;
        } else {
          this.rawSvgUrl = `https://www.plantuml.com/plantuml/svg/${encoded}`;
        }

        // 创建一个Canvas元素
        const canvas = document.createElement('canvas');
        // 设置Canvas大小为3840像素宽
        canvas.width = 3840;
        // 初始高度，稍后会根据图像比例调整
        canvas.height = 2160;

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
            canvas.height = Math.round(3840 * aspectRatio) || 2160;
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
    },
    applyTheme() {
      if (this.plantUmlCode) {
        // 移除已有的主题或样式代码
        let code = this.plantUmlCode;
        const themeValues = Object.values(this.themes).filter(v => v !== '');
        
        // 清除现有主题
        themeValues.forEach(theme => {
          if (code.includes(theme)) {
            code = code.replace(theme, '');
          }
        });
        
        // 清除可能存在的skinparam
        code = code.replace(/skinparam\s+monochrome\s+true\n/g, '');
        code = code.replace(/skinparam\s+handwritten\s+true\n/g, '');
        code = code.replace(/!theme\s+\w+\n/g, '');
        
        // 获取新主题代码
        const themeCode = this.themes[this.selectedTheme] || '';
        
        if (themeCode) {
          // 支持所有类型的PlantUML开始标记
          const startTags = [
            '@startuml', 
            '@startmindmap', 
            '@startgantt', 
            '@startwbs', 
            '@startsalt', 
            '@startjson',
            '@startnwdiag',
            'nwdiag {'
          ];
          
          // 查找文档中的开始标记
          let tagFound = false;
          for (const tag of startTags) {
            if (code.includes(tag)) {
              tagFound = true;
              // 在开始标记后添加主题，但避免重复添加换行符
              if (code.includes(tag + '\n')) {
                // 已经有换行符，直接在换行符后添加主题
                code = code.replace(tag + '\n', tag + '\n' + themeCode);
              } else {
                // 没有换行符，添加带换行符的主题
                code = code.replace(tag, tag + '\n' + themeCode);
              }
              break; // 找到第一个标记后就停止处理
            }
          }
          
          // 如果没有找到任何开始标记但有主题，在代码开头添加主题代码
          if (!tagFound && themeCode) {
            code = themeCode + code;
          }
        }
        
        this.plantUmlCode = code;
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
  overflow: hidden;
  /* 防止出现整体滚动条 */
  position: relative;
}

.editor-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  /* 防止容器出现滚动条 */
}

.toolbar {
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  /* 防止工具栏被压缩 */
}

.example-select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  min-width: 150px;
}

.theme-select {
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
  overflow: hidden;
  /* 防止分割视图出现滚动条 */
}

.editor-panel,
.preview-panel {
  flex: 1;
  padding: 20px;
  overflow: hidden;
  /* 改为hidden，防止出现滚动条 */
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
  overflow-y: auto;
  /* 只在编辑器区域显示垂直滚动条 */
  overflow-x: hidden;
  /* 隐藏水平滚动条 */
}

.preview-panel {
  flex: 1;
  padding: 20px;
  overflow: hidden;
  /* 改为hidden，防止出现滚动条 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* 垂直居中 */
  align-items: center;
  /* 水平居中 */
}

.diagram-preview {
  max-width: 100%;
  /* 最大宽度为父容器的100% */
  max-height: 100%;
  /* 最大高度为父容器的100% */
  object-fit: contain;
  /* 确保图像在容器内完全可见 */
  display: block;
  /* 去除默认的内联显示间隙 */
  cursor: pointer;
  /* 指示可点击 */
  transition: transform 0.2s;
  /* 添加悬停效果 */
}

.diagram-preview:hover {
  transform: scale(1.02);
  /* 轻微放大效果 */
}

.placeholder {
  height: 100%;
  width: 100%;
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



/* 确保图表容器充满空间但不溢出 */
.preview-panel>* {
  max-height: 100%;
  overflow: hidden;
}
</style>