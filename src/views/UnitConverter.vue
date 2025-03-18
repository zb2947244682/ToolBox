<template>
  <div class="unit-converter">
    <h1 class="tool-title">单位转换工具</h1>
    
    <div class="converter">
      <div class="input-group">
        <input type="number" v-model.number="inputValue" placeholder="输入数值" />
        <select v-model="inputUnit">
          <option v-for="unit in units" :key="unit" :value="unit">{{ unit }}</option>
        </select>
      </div>
      
      <div class="output-group">
        <input type="text" :value="convertedValue" readonly />
        <select v-model="outputUnit">
          <option v-for="unit in units" :key="unit" :value="unit">{{ unit }}</option>
        </select>
      </div>
    </div>
    
    <button @click="convert">转换</button>
  </div>
</template>

<script>
export default {
  name: 'UnitConverter',
  data() {
    return {
      inputValue: 0,
      inputUnit: '米',
      outputUnit: '千米',
      convertedValue: '',
      units: ['米', '千米', '厘米', '毫米', '英寸', '英尺', '码', '英里']
    };
  },
  methods: {
    convert() {
      const conversionRates = {
        '米': 1,
        '千米': 0.001,
        '厘米': 100,
        '毫米': 1000,
        '英寸': 39.3701,
        '英尺': 3.28084,
        '码': 1.09361,
        '英里': 0.000621371
      };
      const inputInMeters = this.inputValue / conversionRates[this.inputUnit];
      this.convertedValue = (inputInMeters * conversionRates[this.outputUnit]).toFixed(4);
    }
  }
};
</script>

<style scoped>
.unit-converter {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.tool-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 20px;
}

.converter {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.input-group, .output-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}

input[type="number"], input[type="text"] {
  width: 150px;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
}

select {
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
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

button:hover {
  background-color: #3aa876;
}
</style> 