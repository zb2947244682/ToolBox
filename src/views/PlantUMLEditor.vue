<template>
  <div class="plantuml-editor">
    <div class="editor-container">
      <div class="toolbar">
        <select v-model="selectedDiagramType" class="diagram-type-select">
          <option value="class">类图</option>
          <option value="sequence">时序图</option>
          <option value="usecase">用例图</option>
          <option value="activity">活动图</option>
        </select>
        <button @click="generateDiagram" class="generate-btn">生成图表</button>
      </div>
      <div class="split-view">
        <div class="editor-panel">
          <textarea
            v-model="plantUmlCode"
            class="code-editor"
            placeholder="请输入PlantUML代码..."
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
      selectedDiagramType: 'class',
      templates: {
        class: `@startuml
class Example {
  -privateField
  +publicField
  #protectedField
  +method()
}
@enduml`,
        sequence: `@startuml
Alice -> Bob: 请求
Bob --> Alice: 响应
@enduml`,
        usecase: `@startuml
:用户: --> (使用系统)
@enduml`,
        activity: `@startuml
start
:步骤1;
:步骤2;
stop
@enduml`
      }
    };
  },
  methods: {
    generateDiagram() {
      if (!this.plantUmlCode) return;
      
      try {
        // 使用plantuml-encoder进行编码
        const encoded = plantumlEncoder.encode(this.plantUmlCode);
        // 使用PlantUML官方服务生成SVG（SVG通常渲染效果更好）
        this.diagramUrl = `https://www.plantuml.com/plantuml/svg/${encoded}`;
      } catch (error) {
        console.error('生成图表时出错:', error);
      }
    },
    autoGenerate() {
      // 自动生成延迟500ms，避免频繁请求
      clearTimeout(this.generateTimeout);
      this.generateTimeout = setTimeout(() => {
        this.generateDiagram();
      }, 500);
    }
  },
  watch: {
    selectedDiagramType(newType) {
      // 当选择新的图表类型时，加载对应的模板
      this.plantUmlCode = this.templates[newType];
      this.generateDiagram();
    }
  },
  mounted() {
    // 初始化时加载默认模板
    this.plantUmlCode = this.templates[this.selectedDiagramType];
    this.generateDiagram();
  }
};
</script>

<style scoped>
.plantuml-editor {
  height: 100vh;
  padding: 20px;
}

.editor-container {
  display: flex;
  flex-direction: column;
  height: calc(100% - 40px);
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.toolbar {
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 10px;
}

.diagram-type-select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
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
  height: 100%;
}

.editor-panel, .preview-panel {
  flex: 1;
  padding: 20px;
  overflow: auto;
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
}

.diagram-preview {
  max-width: 100%;
  height: auto;
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
</style> 