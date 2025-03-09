import { createRouter, createWebHashHistory } from 'vue-router'
import IndexView from '@/views/index/index.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: IndexView,
    }
  ],
})

export default router
