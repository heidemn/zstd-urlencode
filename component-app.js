import { defineAsyncComponent } from 'vue'

const Content = defineAsyncComponent(() => import('./component-content.js'))

export default {
  name: 'App',
  components: { Content },
  template: /*html*/`
    <Content />
  `
}