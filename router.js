import { defineAsyncComponent } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

const App = defineAsyncComponent(() => import('./component-app.js'))

const router = createRouter({
  history: createWebHistory(),
  routes: [{
    path: '/',
    components: {
      default: App,
    },
  }]
})

export default router