import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

import TreeTable from 'vue-table-with-tree-grid'
// 配置axios
import axios from 'axios'
axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

// 配置树形表格
Vue.component('tree-table', TreeTable)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

class Person {
  constructor() {
    this.a = 1
  }
}
const dif = new Person()
console.log(Person.prototype)
console.log(dif)
