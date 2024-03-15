import { createApp } from 'vue'
import router from './router.js'
import store from './store.js'

export const vue = createApp({
  template: /*html*/`<router-view />`
})

vue.use(store)
vue.use(router)

if (document.getElementById('app')) {
  vue.mount('#app')
}