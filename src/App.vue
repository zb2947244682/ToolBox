<template>
  <div id="app">
    <MarkdownEditor />
  </div>
</template>

<script>
import MarkdownEditor from './components/MarkdownEditor.vue';

export default {
  name: 'App',
  components: {
    MarkdownEditor
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
  background-color: #f5f5f5;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style> 