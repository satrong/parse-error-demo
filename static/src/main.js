import Vue from 'vue'
import axios from 'axios'
import App from './App.vue'

Vue.config.productionTip = false

Vue.config.errorHandler = (err, vm, info) => {
  axios({
    url: '/api/js/error',
    method: 'post',
    data: {
      stack: err.stack
    }
  }).then(res => console.log('以下为解析后的报错：\n', res.data))
  throw err
}

new Vue({
  render: h => h(App),
}).$mount('#app')
