import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 导入树形表格
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

// 注册、调用VueQuillEditor的安装方法
Vue.use(VueQuillEditor)

// 配置全局时间戳过滤器
Vue.filter('dateFormat', originDate => {
  const dt = new Date(originDate * 1000)
  const y = dt.getFullYear()
  const M = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + 1 + '').padStart(2, '0')
  const hh = (dt.getHours() + 1 + '').padStart(2, '0')
  const mm = (dt.getMinutes() + 1 + '').padStart(2, '0')
  const ss = (dt.getSeconds() + 1 + '').padStart(2, '0')
  return `${y}-${M}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
