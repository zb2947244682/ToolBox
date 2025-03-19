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
          <img v-if="diagramUrl" :src="diagramUrl" alt="PlantUML图表" class="diagram-preview" />
          <div v-else class="placeholder">
            图表预览区域
          </div>
        </div>
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
      selectedExample: '',
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
    generateDiagram() {
      if (!this.plantUmlCode) return;
      
      try {
        const encoded = plantumlEncoder.encode(this.plantUmlCode);
        this.diagramUrl = `https://www.plantuml.com/plantuml/svg/${encoded}`;
      } catch (error) {
        console.error('生成图表时出错:', error);
      }
    },
    async downloadDiagram() {
      if (!this.plantUmlCode) return;
      
      try {
        const encoded = plantumlEncoder.encode(this.plantUmlCode);
        const pngUrl = `https://www.plantuml.com/plantuml/png/${encoded}`;
        
        // 获取PNG图片数据
        const response = await fetch(pngUrl);
        const blob = await response.blob();
        
        // 创建下载链接
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'plantuml-diagram.png';
        
        // 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理URL对象
        window.URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error('下载图表时出错:', error);
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