<template>
  <div id="app">
    <button @click="test">点我报错</button>
    <p>打开控制台Console查看结果</p>
  </div>
</template>

<script>
export default {
  name: 'App',
  methods: {
    test() {
      this.list.forEach()
    }
  }
}
</script>
