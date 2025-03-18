<template>
  <div class="calculator">
    <h1 class="tool-title">计算器</h1>
    
    <div class="display">
      <input type="text" v-model="displayValue" readonly />
    </div>
    
    <div class="buttons">
      <button v-for="button in buttons" :key="button" @click="handleButtonClick(button)">
        {{ button }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Calculator',
  data() {
    return {
      displayValue: '',
      buttons: [
        '7', '8', '9', '/',
        '4', '5', '6', '*',
        '1', '2', '3', '-',
        '0', '.', '=', '+'
      ]
    };
  },
  methods: {
    handleButtonClick(button) {
      if (button === '=') {
        this.calculateResult();
      } else {
        this.displayValue += button;
      }
    },
    calculateResult() {
      try {
        this.displayValue = eval(this.displayValue);
      } catch (error) {
        this.displayValue = '错误';
      }
    }
  }
};
</script>

<style scoped>
.calculator {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.tool-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 20px;
}

.display {
  margin-bottom: 20px;
}

.display input {
  width: 100%;
  padding: 10px;
  font-size: 1.5rem;
  text-align: right;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

button {
  padding: 15px;
  font-size: 1.2rem;
  border: none;
  border-radius: 4px;
  background-color: #42b983;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #3aa876;
}
</style> 